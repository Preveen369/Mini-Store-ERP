import { Router } from 'express';
import { body } from 'express-validator';
import { createExpense, getExpenses, deleteExpense } from '../controllers/expenseController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

router.use(authenticateToken);

// Get expenses
router.get('/', getExpenses);

// Create expense (admin only)
router.post(
  '/',
  authorizeRoles('admin'),
  [
    body('category').trim().notEmpty(),
    body('amount').isFloat({ min: 0 }),
    body('note').optional().trim(),
    body('date').optional().isISO8601(),
    validate,
  ],
  createExpense
);

// Delete expense (admin only)
router.delete('/:id', authorizeRoles('admin'), deleteExpense);

export default router;
