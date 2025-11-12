import { Schema, model, Document, Types } from 'mongoose';

export interface ISaleItem {
  productId: Types.ObjectId;
  name: string;
  qty: number;
  sellPrice: number;
  costPrice: number; // Snapshot for profit calculation
}

export interface ICustomer {
  name?: string;
  phone?: string;
}

export interface ISale extends Document {
  invoiceNumber: string;
  customer: ICustomer;
  items: ISaleItem[];
  subtotal: number;
  taxes: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'credit';
  date: Date;
  createdBy: Types.ObjectId;
  pdfUrl?: string;
}

const saleSchema = new Schema<ISale>({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  customer: {
    name: String,
    phone: String,
  },
  items: [{
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    qty: {
      type: Number,
      required: true,
      min: 0,
    },
    sellPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  taxes: {
    type: Number,
    default: 0,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'credit'],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  pdfUrl: {
    type: String,
  },
}, {
  timestamps: true,
});

// Indexes (invoiceNumber already has unique index from field definition)
saleSchema.index({ date: -1 });
saleSchema.index({ 'customer.phone': 1 });
saleSchema.index({ createdBy: 1 });
// Compound indexes for dashboard queries
saleSchema.index({ date: -1, 'items.productId': 1 }); // For top products aggregation
saleSchema.index({ 'items.productId': 1, date: -1 }); // Alternative for product-based queries

export const Sale = model<ISale>('Sale', saleSchema);
