import { Schema, model, Document, Types } from 'mongoose';

export interface IExpense extends Document {
  category: string;
  amount: number;
  note?: string;
  date: Date;
  createdBy: Types.ObjectId;
}

const expenseSchema = new Schema<IExpense>({
  category: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  note: {
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
expenseSchema.index({ category: 1 });
expenseSchema.index({ date: -1 });
expenseSchema.index({ createdBy: 1 });

export const Expense = model<IExpense>('Expense', expenseSchema);
