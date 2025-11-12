import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  roles: ('admin' | 'cashier')[];
  otpSecret?: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^\S+@\S+\.\S+$/,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  roles: {
    type: [String],
    enum: ['admin', 'cashier'],
    default: ['cashier'],
  },
  otpSecret: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for sales created by this user
userSchema.virtual('sales', {
  ref: 'Sale',
  localField: '_id',
  foreignField: 'createdBy',
});

// Virtual for purchases created by this user
userSchema.virtual('purchases', {
  ref: 'Purchase',
  localField: '_id',
  foreignField: 'createdBy',
});

// Virtual for expenses created by this user
userSchema.virtual('expenses', {
  ref: 'Expense',
  localField: '_id',
  foreignField: 'createdBy',
});

// Virtual for products created by this user
userSchema.virtual('productsCreated', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'createdBy',
});

// Virtual for products updated by this user
userSchema.virtual('productsUpdated', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'updatedBy',
});

export const User = model<IUser>('User', userSchema);
