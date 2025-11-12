import { Schema, model, Document, Types } from 'mongoose';

export interface IProduct extends Document {
  sku: string;
  name: string;
  category: string;
  costPrice: number;
  sellPrice: number;
  unit: string;
  currentStock: number;
  reorderThreshold: number;
  vendor?: {
    name: string;
    contact?: string;
  };
  metadata?: Record<string, any>;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>({
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  costPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  sellPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  unit: {
    type: String,
    required: true,
    default: 'pcs',
    trim: true,
  },
  currentStock: {
    type: Number,
    required: true,
    default: 0,
  },
  reorderThreshold: {
    type: Number,
    required: true,
    default: 10,
  },
  vendor: {
    name: String,
    contact: String,
  },
  metadata: {
    type: Schema.Types.Mixed,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes (sku already has unique index from field definition)
productSchema.index({ name: 'text', category: 'text' }); // Text search
productSchema.index({ category: 1 });
productSchema.index({ currentStock: 1 });
productSchema.index({ createdBy: 1 });
productSchema.index({ updatedBy: 1 });

export const Product = model<IProduct>('Product', productSchema);
