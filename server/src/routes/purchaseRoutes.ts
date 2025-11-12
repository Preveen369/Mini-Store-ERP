import { Router } from 'express';
import { body } from 'express-validator';
import { createPurchase, getPurchases, deletePurchase } from '../controllers/purchaseController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

router.use(authenticateToken);

// Get purchases
router.get('/', getPurchases);

// Create purchase (admin only)
router.post(
  '/',
  authorizeRoles('admin'),
  [
    body('supplier').trim().notEmpty(),
    body('items').isArray({ min: 1 }),
    body('items.*.productId').isMongoId(),
    body('items.*.qty').isFloat({ min: 0.01 }),
    body('items.*.costPrice').isFloat({ min: 0 }),
    body('invoiceRef').optional().trim(),
    validate,
  ],
  createPurchase
);

// Delete purchase (admin only)
router.delete('/:id', authorizeRoles('admin'), deletePurchase);

export default router;
