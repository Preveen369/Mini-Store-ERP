import { Schema, model, Document, Types } from 'mongoose';

export interface IStockTransaction extends Document {
  productId: Types.ObjectId;
  type: 'purchase' | 'sale' | 'adjustment';
  qty: number;
  unitPrice: number;
  saleId?: Types.ObjectId;
  purchaseId?: Types.ObjectId;
  createdBy?: Types.ObjectId; // For manual adjustments
  note?: string; // For adjustment reasons
  date: Date;
}

const stockTransactionSchema = new Schema<IStockTransaction>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  type: {
    type: String,
    enum: ['purchase', 'sale', 'adjustment'],
    required: true,
  },
  qty: {
    type: Number,
    required: true,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  saleId: {
    type: Schema.Types.ObjectId,
    ref: 'Sale',
  },
  purchaseId: {
    type: Schema.Types.ObjectId,
    ref: 'Purchase',
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  note: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
stockTransactionSchema.index({ productId: 1, date: -1 });
stockTransactionSchema.index({ type: 1 });
stockTransactionSchema.index({ date: -1 });
stockTransactionSchema.index({ saleId: 1 });
stockTransactionSchema.index({ purchaseId: 1 });
stockTransactionSchema.index({ createdBy: 1 });

export const StockTransaction = model<IStockTransaction>('StockTransaction', stockTransactionSchema);
