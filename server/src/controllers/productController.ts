import { Response } from 'express';
import { Product, Sale, Purchase } from '../models';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

// Get products with search, filter, pagination
export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const lowStock = req.query.lowStock === 'true';

    // Build query
    const query: any = {};

    if (search) {
      query.$text = { $search: search };
    }

    if (category) {
      query.category = category;
    }

    if (lowStock) {
      query.$expr = { $lt: ['$currentStock', '$reorderThreshold'] };
    }

    // Execute query
    const products = await Product.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      products,
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

// Get single product
export const getProductById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.json({ product });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

// Create product
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const productData = req.body;

    // Check if SKU exists
    const existing = await Product.findOne({ sku: productData.sku });
    if (existing) {
      throw new AppError('SKU already exists', 400);
    }

    const product = await Product.create({
      ...productData,
      createdBy: req.user!._id,
      updatedBy: req.user!._id,
    });

    res.status(201).json({
      message: 'Product created successfully',
      product,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

// Update product
export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const updates = req.body;

    // If SKU is being updated, check uniqueness
    if (updates.sku) {
      const existing = await Product.findOne({
        sku: updates.sku,
        _id: { $ne: req.params.id },
      });
      if (existing) {
        throw new AppError('SKU already exists', 400);
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...updates,
        updatedBy: req.user!._id,
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.json({
      message: 'Product updated successfully',
      product,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

// Delete product
export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const productId = req.params.id;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Check if product is used in any sales
    const salesWithProduct = await Sale.findOne({
      'items.productId': productId,
    });

    if (salesWithProduct) {
      throw new AppError(
        'Cannot delete product. It has been used in sales transactions. Please archive it instead.',
        400
      );
    }

    // Check if product is used in any purchases
    const purchasesWithProduct = await Purchase.findOne({
      'items.productId': productId,
    });

    if (purchasesWithProduct) {
      throw new AppError(
        'Cannot delete product. It has been used in purchase transactions. Please archive it instead.',
        400
      );
    }

    // Safe to delete
    await Product.findByIdAndDelete(productId);

    res.json({
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};
