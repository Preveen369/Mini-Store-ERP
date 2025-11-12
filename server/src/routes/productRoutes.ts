import { Router } from 'express';
import { body, query } from 'express-validator';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get products (with search, filter, pagination)
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().trim(),
    query('category').optional().trim(),
    query('lowStock').optional().isBoolean(),
    validate,
  ],
  getProducts
);

// Get single product
router.get('/:id', getProductById);

// Create product (admin only)
router.post(
  '/',
  authorizeRoles('admin'),
  [
    body('sku').trim().notEmpty().toUpperCase(),
    body('name').trim().notEmpty(),
    body('category').trim().notEmpty(),
    body('costPrice').isFloat({ min: 0 }),
    body('sellPrice').isFloat({ min: 0 }),
    body('unit').trim().notEmpty(),
    body('currentStock').optional().isFloat({ min: 0 }),
    body('reorderThreshold').optional().isFloat({ min: 0 }),
    validate,
  ],
  createProduct
);

// Update product (admin only)
router.put(
  '/:id',
  authorizeRoles('admin'),
  [
    body('sku').optional().trim().toUpperCase(),
    body('name').optional().trim(),
    body('category').optional().trim(),
    body('costPrice').optional().isFloat({ min: 0 }),
    body('sellPrice').optional().isFloat({ min: 0 }),
    body('unit').optional().trim(),
    body('currentStock').optional().isFloat({ min: 0 }),
    body('reorderThreshold').optional().isFloat({ min: 0 }),
    validate,
  ],
  updateProduct
);

// Delete product (admin only)
router.delete('/:id', authorizeRoles('admin'), deleteProduct);

export default router;
