import { Schema, model, Document, Types } from 'mongoose';

export interface IPurchaseItem {
  productId: Types.ObjectId;
  qty: number;
  costPrice: number;
}

export interface IPurchase extends Document {
  supplier: string;
  items: IPurchaseItem[];
  totalAmount: number;
  invoiceRef?: string;
  date: Date;
  createdBy: Types.ObjectId;
}

const purchaseSchema = new Schema<IPurchase>({
  supplier: {
    type: String,
    required: true,
    trim: true,
  },
  items: [{
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    qty: {
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
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  invoiceRef: {
    type: String,
    trim: true,
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
}, {
  timestamps: true,
});

// Indexes
purchaseSchema.index({ date: -1 });
purchaseSchema.index({ supplier: 1 });
purchaseSchema.index({ createdBy: 1 });

export const Purchase = model<IPurchase>('Purchase', purchaseSchema);
