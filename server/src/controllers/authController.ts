import { Request, Response } from 'express';
import { User } from '../models';
import { hashPassword, comparePassword, generateOTP } from '../utils/crypto';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';

// Register
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, phone, roles } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await User.create({
      email,
      passwordHash,
      name,
      phone,
      roles: roles || ['cashier'],
    });

    // Generate tokens
    const token = generateToken((user._id as any).toString());
    const refreshToken = generateRefreshToken((user._id as any).toString());

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        roles: user.roles,
      },
      token,
      refreshToken,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

// Login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate tokens
    const token = generateToken((user._id as any).toString());
    const refreshToken = generateRefreshToken((user._id as any).toString());

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        roles: user.roles,
      },
      token,
      refreshToken,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

// Request OTP
export const requestOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier } = req.body; // email or phone

    // Find user by email or phone
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Generate OTP
    const otp = generateOTP();
    const otpHash = await hashPassword(otp);

    // Store OTP (in production, use expiry timestamp)
    user.otpSecret = otpHash;
    await user.save();

    // TODO: Send OTP via SMS/Email service
    console.log(`OTP for ${identifier}: ${otp}`);

    res.json({
      message: 'OTP sent successfully',
      // In development, return OTP (remove in production)
      ...(process.env.NODE_ENV === 'development' && { otp }),
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

// Verify OTP
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, otp } = req.body;

    // Find user
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!user || !user.otpSecret) {
      throw new AppError('Invalid OTP request', 400);
    }

    // Verify OTP
    const isValid = await comparePassword(otp, user.otpSecret);
    if (!isValid) {
      throw new AppError('Invalid OTP', 401);
    }

    // Clear OTP
    user.otpSecret = undefined;
    await user.save();

    // Generate tokens
    const token = generateToken((user._id as any).toString());
    const refreshToken = generateRefreshToken((user._id as any).toString());

    res.json({
      message: 'OTP verified successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        roles: user.roles,
      },
      token,
      refreshToken,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};
