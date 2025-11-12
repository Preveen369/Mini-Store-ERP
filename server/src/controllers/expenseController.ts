import { Response } from 'express';
import { Expense } from '../models';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { dashboardCache } from '../utils/cache';

// Create expense
export const createExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, amount, note, date } = req.body;

    const expense = await Expense.create({
      category,
      amount,
      note,
      date: date || new Date(),
      createdBy: req.user!._id,
    });

    res.status(201).json({
      message: 'Expense created successfully',
      expense,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get expenses
export const getExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const category = req.query.category as string;
    const search = req.query.search as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    // Build query
    const query: any = {};

    if (category) {
      query.category = category;
    }

    // Search by note
    if (search) {
      query.note = { $regex: search, $options: 'i' };
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

    const expenses = await Expense.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ date: -1 });

    const total = await Expense.countDocuments(query);

    res.json({
      expenses,
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

// Delete expense
export const deleteExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const expenseId = req.params.id;

    const expense = await Expense.findByIdAndDelete(expenseId);

    if (!expense) {
      throw new AppError('Expense not found', 404);
    }

    // Invalidate cache to recalculate net profit
    dashboardCache.clear();

    res.json({
      message: 'Expense deleted successfully',
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};
