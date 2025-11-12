import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, requestOTP, verifyOTP } from '../controllers/authController';
import { validate } from '../middleware/validator';

const router = Router();

// Register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty(),
    body('phone').optional().trim(),
    validate,
  ],
  register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    validate,
  ],
  login
);

// Request OTP
router.post(
  '/request-otp',
  [
    body('identifier').notEmpty(), // email or phone
    validate,
  ],
  requestOTP
);

// Verify OTP
router.post(
  '/verify-otp',
  [
    body('identifier').notEmpty(),
    body('otp').isLength({ min: 6, max: 6 }),
    validate,
  ],
  verifyOTP
);

export default router;
