import { Router } from 'express';
import { body } from 'express-validator';
import { createSale, getSales, getSaleById, downloadInvoicePDF, deleteSale } from '../controllers/saleController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

router.use(authenticateToken);

// Get sales
router.get('/', getSales);

// Get single sale
router.get('/:id', getSaleById);

// Download invoice PDF
router.get('/:id/invoice-pdf', downloadInvoicePDF);

// Create sale
router.post(
  '/',
  [
    body('items').isArray({ min: 1 }),
    body('items.*.productId').isMongoId(),
    body('items.*.qty').isFloat({ min: 0.01 }),
    body('items.*.sellPrice').isFloat({ min: 0 }),
    body('customer').optional().isObject(),
    body('paymentMethod').isIn(['cash', 'card', 'upi', 'credit']),
    body('discount').optional().isFloat({ min: 0 }),
    validate,
  ],
  createSale
);

// Delete sale
router.delete('/:id', deleteSale);

export default router;
