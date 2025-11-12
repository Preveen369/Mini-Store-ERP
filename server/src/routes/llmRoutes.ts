import { Router } from 'express';
import { body } from 'express-validator';
import { 
  handleNaturalLanguageQuery, 
  generateInsights, 
  generateDashboardInsights,
  generateReportsInsights 
} from '../controllers/llmController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validator';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limit for LLM endpoints (more restrictive)
const llmRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each user to 10 requests per windowMs
  message: 'Too many LLM requests, please try again later.',
});

router.use(authenticateToken);
router.use(llmRateLimit);

// Natural language query
router.post(
  '/nlq',
  [
    body('query').trim().notEmpty().isLength({ max: 500 }),
    validate,
  ],
  handleNaturalLanguageQuery
);

// Generate insights
router.post(
  '/insights',
  [
    body('context').isObject(),
    validate,
  ],
  generateInsights
);

// Generate dashboard-specific insights
router.post(
  '/dashboard-insights',
  [
    body('context').isObject(),
    validate,
  ],
  generateDashboardInsights
);

// Generate reports-specific insights
router.post(
  '/reports-insights',
  [
    body('context').isObject(),
    body('period').optional().isString(),
    validate,
  ],
  generateReportsInsights
);

export default router;
