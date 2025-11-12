import { Response } from 'express';
import { Sale, Expense, Product } from '../models';
import { AuthRequest } from '../middleware/auth';
import { dashboardCache } from '../utils/cache';

// Get summary report (revenue, profit, expenses)
export const getSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const from = req.query.from ? new Date(req.query.from as string) : new Date(0);
    const to = req.query.to ? new Date(req.query.to as string) : new Date();

    // Create cache key based on date range
    const cacheKey = `summary:${from.getTime()}:${to.getTime()}`;
    
    // Check cache first
    const cachedData = dashboardCache.get(cacheKey);
    if (cachedData) {
      res.json(cachedData);
      return;
    }

    // Optimize: Use aggregation instead of fetching all documents
    const [salesSummary, expensesSummary] = await Promise.all([
      Sale.aggregate([
        { $match: { date: { $gte: from, $lte: to } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$total' },
            cogs: { $sum: { $multiply: ['$items.qty', '$items.costPrice'] } },
            salesCount: { $sum: 1 },
          },
        },
      ]),
      Expense.aggregate([
        { $match: { date: { $gte: from, $lte: to } } },
        {
          $group: {
            _id: null,
            totalExpenses: { $sum: '$amount' },
          },
        },
      ]),
    ]);

    const revenue = salesSummary[0]?.revenue || 0;
    const cogs = salesSummary[0]?.cogs || 0;
    const salesCount = salesSummary[0]?.salesCount || 0;
    const totalExpenses = expensesSummary[0]?.totalExpenses || 0;
    const grossProfit = revenue - cogs;
    const netProfit = grossProfit - totalExpenses;

    const result = {
      summary: {
        revenue,
        cogs,
        grossProfit,
        totalExpenses,
        netProfit,
        salesCount,
        period: {
          from,
          to,
        },
      },
    };

    // Cache the result
    dashboardCache.set(cacheKey, result);

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get top-selling products
export const getTopProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const period = req.query.period as string || '7d';
    const limit = parseInt(req.query.limit as string) || 10;

    // Create cache key
    const cacheKey = `topProducts:${period}:${limit}`;
    
    // Check cache first
    const cachedData = dashboardCache.get(cacheKey);
    if (cachedData) {
      res.json(cachedData);
      return;
    }

    // Calculate date range
    const days = parseInt(period) || 7;
    const from = new Date();
    from.setDate(from.getDate() - days);

    // Aggregate top products
    const topProducts = await Sale.aggregate([
      { $match: { date: { $gte: from } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalQty: { $sum: '$items.qty' },
          totalRevenue: { $sum: { $multiply: ['$items.qty', '$items.sellPrice'] } },
          productName: { $first: '$items.name' },
        },
      },
      { $sort: { totalQty: -1 } },
      { $limit: limit },
    ]);

    const result = {
      topProducts,
      period: {
        from,
        to: new Date(),
      },
    };

    // Cache the result
    dashboardCache.set(cacheKey, result);

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get low stock products
export const getLowStock = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Create cache key
    const cacheKey = 'lowStock';
    
    // Check cache first
    const cachedData = dashboardCache.get(cacheKey);
    if (cachedData) {
      res.json(cachedData);
      return;
    }

    // Optimize: Only fetch necessary fields and limit results
    const products = await Product.find({
      $expr: { $lt: ['$currentStock', '$reorderThreshold'] },
    })
    .select('name sku currentStock reorderThreshold category _id')
    .sort({ currentStock: 1 })
    .limit(20) // Limit to top 20 low stock items
    .lean(); // Use lean() for better performance

    // Calculate avg weekly sales for each product (optimized)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const productIds = products.map(p => p._id);

    // Single aggregation for all products
    const salesData = await Sale.aggregate([
      { $match: { date: { $gte: sevenDaysAgo } } },
      { $unwind: '$items' },
      { $match: { 'items.productId': { $in: productIds } } },
      {
        $group: {
          _id: '$items.productId',
          totalQty: { $sum: '$items.qty' },
        },
      },
    ]);

    // Create a map for quick lookup
    const salesMap = new Map(salesData.map(s => [s._id.toString(), s.totalQty]));

    const enrichedProducts = products.map(product => ({
      product,
      avgWeeklySales: salesMap.get(product._id.toString()) || 0,
    }));

    const result = {
      lowStockProducts: enrichedProducts,
    };

    // Cache the result
    dashboardCache.set(cacheKey, result);

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
