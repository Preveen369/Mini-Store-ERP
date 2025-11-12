import { Response } from 'express';
import mongoose from 'mongoose';
import { Sale, Product, StockTransaction } from '../models';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { getNextInvoiceNumber, getTaxRate } from '../utils/settings';
import { pdfService } from '../services/pdfService';
import { dashboardCache } from '../utils/cache';

// Create sale
export const createSale = async (req: AuthRequest, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, customer, paymentMethod, discount = 0 } = req.body;
    const userId = req.userId!;

    // Generate invoice number
    const invoiceNumber = await getNextInvoiceNumber();

    // Get tax rate
    const taxRate = await getTaxRate();

    // Fetch products and calculate totals
    const enrichedItems = [];
    const stockTransactionIds = []; // Track created transaction IDs
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) {
        throw new AppError(`Product ${item.productId} not found`, 404);
      }

      // Check stock availability
      if (product.currentStock < item.qty) {
        throw new AppError(
          `Insufficient stock for ${product.name}. Available: ${product.currentStock}`,
          400
        );
      }

      const lineTotal = item.qty * (item.sellPrice || product.sellPrice);
      subtotal += lineTotal;

      enrichedItems.push({
        productId: product._id,
        name: product.name,
        qty: item.qty,
        sellPrice: item.sellPrice || product.sellPrice,
        costPrice: product.costPrice,
      });

      // Update stock
      product.currentStock -= item.qty;
      await product.save({ session });

      // Create stock transaction and store its ID
      const stockTransactions = await StockTransaction.create(
        [{
          productId: product._id,
          type: 'sale',
          qty: -item.qty,
          unitPrice: item.sellPrice || product.sellPrice,
          date: new Date(),
        }],
        { session }
      );
      stockTransactionIds.push(stockTransactions[0]._id);
    }

    // Calculate final amounts
    const taxes = (subtotal - discount) * (taxRate / 100);
    const total = subtotal - discount + taxes;

    // Create sale
    const sale = await Sale.create(
      [{
        invoiceNumber,
        customer,
        items: enrichedItems,
        subtotal,
        taxes,
        discount,
        total,
        paymentMethod,
        createdBy: userId,
        date: new Date(),
      }],
      { session }
    );

    // Update ONLY the stock transactions created in this sale with the sale reference ID
    await StockTransaction.updateMany(
      { _id: { $in: stockTransactionIds } },
      { saleId: sale[0]._id },
      { session }
    );

    await session.commitTransaction();

    res.status(201).json({
      message: 'Sale created successfully',
      sale: sale[0],
      invoiceNumber,
    });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(error.statusCode || 500).json({ error: error.message });
  } finally {
    session.endSession();
  }
};

// Get sales
export const getSales = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    // Build query
    const query: any = {};

    // Search by invoice number or customer name
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } },
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set to end of day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const sales = await Sale.find(query)
      .populate('createdBy', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ date: -1 });

    const total = await Sale.countDocuments(query);

    res.json({
      sales,
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

// Get single sale
export const getSaleById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sale = await Sale.findById(req.params.id).populate('createdBy', 'name email');

    if (!sale) {
      throw new AppError('Sale not found', 404);
    }

    res.json({ sale });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

// Download invoice PDF
export const downloadInvoicePDF = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      throw new AppError('Sale not found', 404);
    }

    // Generate PDF in memory
    const pdfBuffer = await pdfService.generateInvoicePDF(sale);
    
    // Set headers for download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${sale.invoiceNumber}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send buffer directly
    res.send(pdfBuffer);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

// Delete sale
export const deleteSale = async (req: AuthRequest, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const saleId = req.params.id;

    // Find the sale
    const sale = await Sale.findById(saleId).session(session);
    if (!sale) {
      throw new AppError('Sale not found', 404);
    }

    // Restore inventory for each item
    for (const item of sale.items) {
      const product = await Product.findById(item.productId).session(session);
      if (product) {
        // Add back the quantity to inventory
        product.currentStock += item.qty;
        await product.save({ session });

        // Create reverse stock transaction
        await StockTransaction.create(
          [{
            productId: product._id,
            type: 'adjustment',
            qty: item.qty,
            unitPrice: item.sellPrice,
            reference: `Sale ${sale.invoiceNumber} deleted`,
            date: new Date(),
          }],
          { session }
        );
      }
    }

    // Delete related stock transactions
    await StockTransaction.deleteMany(
      { saleId: sale._id },
      { session }
    );

    // Delete the sale
    await Sale.findByIdAndDelete(saleId).session(session);

    await session.commitTransaction();

    // Invalidate cache to recalculate reports
    dashboardCache.clear();

    res.json({
      message: 'Sale deleted successfully. Inventory has been restored.',
    });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(error.statusCode || 500).json({ error: error.message });
  } finally {
    session.endSession();
  }
};
