import { Response } from 'express';
import mongoose from 'mongoose';
import { Purchase, Product, StockTransaction } from '../models';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { dashboardCache } from '../utils/cache';

// Create purchase and update stock
export const createPurchase = async (req: AuthRequest, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { supplier, items, invoiceRef } = req.body;
    const userId = req.userId!;

    // Calculate total
    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + item.qty * item.costPrice,
      0
    );

    // Create purchase
    const purchase = await Purchase.create(
      [{
        supplier,
        items,
        totalAmount,
        invoiceRef,
        createdBy: userId,
        date: new Date(),
      }],
      { session }
    );

    // Update stock and create transactions
    for (const item of items) {
      // Update product stock
      const product = await Product.findById(item.productId).session(session);
      if (!product) {
        throw new AppError(`Product ${item.productId} not found`, 404);
      }

      product.currentStock += item.qty;
      product.costPrice = item.costPrice; // Update cost price
      await product.save({ session });

      // Create stock transaction
      await StockTransaction.create(
        [{
          productId: item.productId,
          type: 'purchase',
          qty: item.qty,
          unitPrice: item.costPrice,
          purchaseId: purchase[0]._id,
          date: new Date(),
        }],
        { session }
      );
    }

    await session.commitTransaction();

    res.status(201).json({
      message: 'Purchase created successfully',
      purchase: purchase[0],
    });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(error.statusCode || 500).json({ error: error.message });
  } finally {
    session.endSession();
  }
};

// Get purchases
export const getPurchases = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    // Build query
    const query: any = {};

    // Search by supplier or invoice reference
    if (search) {
      query.$or = [
        { supplier: { $regex: search, $options: 'i' } },
        { invoiceRef: { $regex: search, $options: 'i' } },
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const purchases = await Purchase.find(query)
      .populate('items.productId', 'name sku')
      .populate('createdBy', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ date: -1 });

    const total = await Purchase.countDocuments(query);

    res.json({
      purchases,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete purchase
export const deletePurchase = async (req: AuthRequest, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const purchaseId = req.params.id;

    // Find the purchase
    const purchase = await Purchase.findById(purchaseId).session(session);
    if (!purchase) {
      throw new AppError('Purchase not found', 404);
    }

    // Reduce inventory for each item
    for (const item of purchase.items) {
      const product = await Product.findById(item.productId).session(session);
      if (product) {
        // Check if we have enough stock to remove
        if (product.currentStock < item.qty) {
          throw new AppError(
            `Cannot delete purchase. Insufficient stock for ${product.name}. Current stock: ${product.currentStock}, trying to remove: ${item.qty}`,
            400
          );
        }

        // Subtract the quantity from inventory
        product.currentStock -= item.qty;
        await product.save({ session });

        // Create reverse stock transaction
        await StockTransaction.create(
          [{
            productId: product._id,
            type: 'adjustment',
            qty: -item.qty,
            unitPrice: item.costPrice,
            reference: `Purchase ${purchase.invoiceRef || purchaseId} deleted`,
            date: new Date(),
          }],
          { session }
        );
      }
    }

    // Delete related stock transactions
    await StockTransaction.deleteMany(
      { purchaseId: purchase._id },
      { session }
    );

    // Delete the purchase
    await Purchase.findByIdAndDelete(purchaseId).session(session);

    await session.commitTransaction();

    // Invalidate cache to recalculate reports
    dashboardCache.clear();

    res.json({
      message: 'Purchase deleted successfully. Inventory has been adjusted.',
    });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(error.statusCode || 500).json({ error: error.message });
  } finally {
    session.endSession();
  }
};
