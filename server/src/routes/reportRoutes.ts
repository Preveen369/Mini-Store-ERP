import { Router } from 'express';
import { query } from 'express-validator';
import {
  getSummary,
  getTopProducts,
  getLowStock,
} from '../controllers/reportController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

router.use(authenticateToken);

// Summary report
router.get(
  '/summary',
  [
    query('from').optional().isISO8601(),
    query('to').optional().isISO8601(),
    validate,
  ],
  getSummary
);

// Top products
router.get(
  '/top-products',
  [
    query('period').optional().isIn(['7d', '30d', '90d']),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    validate,
  ],
  getTopProducts
);

// Low stock items
router.get('/low-stock', getLowStock);

export default router;
