import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { groqService } from '../services/groqService';
import { Sale, Expense, Product, Purchase } from '../models';

// Get comprehensive business context
const getBusinessContext = async () => {
  try {
    const [products, sales, expenses, purchases] = await Promise.all([
      Product.find().sort({ createdAt: -1 }).limit(50),
      Sale.find().sort({ date: -1 }).limit(20),
      Expense.find().sort({ date: -1 }).limit(20),
      Purchase.find().sort({ date: -1 }).limit(20)
    ]);

    // Calculate summary metrics
    const currentDate = new Date();
    const last30Days = new Date();
    last30Days.setDate(currentDate.getDate() - 30);
    const last7Days = new Date();
    last7Days.setDate(currentDate.getDate() - 7);

    // Recent sales data
    const recentSales = await Sale.find({ date: { $gte: last30Days } });
    const recentExpenses = await Expense.find({ date: { $gte: last30Days } });
    const recentPurchases = await Purchase.find({ date: { $gte: last30Days } });

    // Calculate metrics
    let totalRevenue = 0;
    let totalCogs = 0;
    recentSales.forEach(sale => {
      totalRevenue += sale.total;
      sale.items.forEach(item => {
        totalCogs += item.qty * item.costPrice;
      });
    });

    const totalExpenses = recentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const grossProfit = totalRevenue - totalCogs;
    const netProfit = grossProfit - totalExpenses;

    // Low stock products
    const lowStockProducts = products.filter(p => p.currentStock < p.reorderThreshold);

    // Top selling products (last 30 days)
    const topProducts = await Sale.aggregate([
      { $match: { date: { $gte: last30Days } } },
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
      { $limit: 10 },
    ]);

    // Expense breakdown by category
    const expensesByCategory = await Expense.aggregate([
      { $match: { date: { $gte: last30Days } } },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    return {
      summary: {
        totalRevenue,
        totalCogs,
        grossProfit,
        netProfit,
        totalExpenses,
        profitMargin: totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(2) : 0,
        period: 'last 30 days'
      },
      products: {
        total: products.length,
        lowStock: lowStockProducts,
        topSelling: topProducts
      },
      sales: {
        total: recentSales.length,
        totalRevenue,
        averageOrderValue: recentSales.length > 0 ? (totalRevenue / recentSales.length).toFixed(2) : 0,
        recent: recentSales.slice(0, 5)
      },
      expenses: {
        total: recentExpenses.length,
        totalAmount: totalExpenses,
        byCategory: expensesByCategory,
        recent: recentExpenses.slice(0, 5)
      },
      purchases: {
        total: recentPurchases.length,
        totalValue: recentPurchases.reduce((sum, p) => sum + p.totalAmount, 0),
        recent: recentPurchases.slice(0, 5)
      },
      alerts: {
        lowStockCount: lowStockProducts.length,
        isLossmaking: netProfit < 0,
        highExpenses: totalExpenses > totalRevenue * 0.8
      }
    };
  } catch (error) {
    console.error('Error getting business context:', error);
    return null;
  }
};

// Handle natural language query
export const handleNaturalLanguageQuery = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { query } = req.body;

    if (!query || !query.trim()) {
      res.status(400).json({ error: 'Query is required' });
      return;
    }

    // Get comprehensive business context
    const businessContext = await getBusinessContext();
    
    if (!businessContext) {
      res.status(500).json({ error: 'Failed to gather business data' });
      return;
    }

    // Parse the query using Groq to understand intent
    const action = await groqService.parseNaturalLanguageQuery(query);
    
    let specificData = {};

    // Execute specific queries if needed
    switch (action.action) {
      case 'report_summary':
      case 'profit_by_period':
        const from = action.from ? new Date(action.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const to = action.to ? new Date(action.to) : new Date();

        const sales = await Sale.find({ date: { $gte: from, $lte: to } });
        const expenses = await Expense.find({ date: { $gte: from, $lte: to } });

        let revenue = 0;
        let cogs = 0;
        sales.forEach(sale => {
          revenue += sale.total;
          sale.items.forEach(item => {
            cogs += item.qty * item.costPrice;
          });
        });

        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const grossProfit = revenue - cogs;
        const netProfit = grossProfit - totalExpenses;

        specificData = {
          revenue,
          cogs,
          grossProfit,
          totalExpenses,
          netProfit,
          period: { from: from.toISOString().split('T')[0], to: to.toISOString().split('T')[0] },
          salesCount: sales.length,
          expenseCount: expenses.length
        };
        break;

      case 'product_search':
        const searchQuery = action.query || query;
        const foundProducts = await Product.find({
          $or: [
            { name: { $regex: searchQuery, $options: 'i' } },
            { category: { $regex: searchQuery, $options: 'i' } },
            { sku: { $regex: searchQuery, $options: 'i' } }
          ]
        }).limit(10);
        specificData = { products: foundProducts, searchQuery };
        break;

      case 'low_stock_list':
        const lowStock = await Product.find({
          $expr: { $lt: ['$currentStock', '$reorderThreshold'] },
        });
        specificData = { lowStockProducts: lowStock };
        break;

      case 'top_products':
        const days = action.days || 30;
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - days);

        const topProducts = await Sale.aggregate([
          { $match: { date: { $gte: fromDate } } },
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
          { $limit: 10 },
        ]);

        specificData = { topProducts, period: `last ${days} days` };
        break;

      default:
        // For general queries, use business context
        specificData = { generalQuery: true };
    }

    // Combine business context with specific data
    const combinedData = {
      ...businessContext,
      specificQuery: specificData,
      queryType: action.action || 'general'
    };

    // Generate conversational response using Groq with full business context
    const conversationalResponse = await groqService.answerBusinessQuery(query, combinedData);

    res.json({
      query,
      action,
      response: conversationalResponse,
      data: combinedData,
    });
  } catch (error: any) {
    console.error('LLM Query Error:', error);
    res.status(500).json({ error: error.message || 'Failed to process query' });
  }
};

// Generate business insights
export const generateInsights = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { context } = req.body;

    // Generate insights using Groq
    const insights = await groqService.generateInsights(context);

    res.json({
      insights,
      context,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Generate dashboard-specific insights
export const generateDashboardInsights = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { context } = req.body;

    // Generate dashboard insights using Groq
    const insights = await groqService.generateDashboardInsights(context);

    res.json({
      insights,
      context,
      type: 'dashboard'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Generate reports-specific insights
export const generateReportsInsights = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { context, period } = req.body;

    // Generate reports insights using Groq
    const insights = await groqService.generateReportsInsights(context, period || 'recent period');

    res.json({
      insights,
      context,
      period,
      type: 'reports'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
