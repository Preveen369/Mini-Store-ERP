import { Setting } from '../models';

export const getNextInvoiceNumber = async (): Promise<string> => {
  // Use findOneAndUpdate with atomic increment to prevent race conditions
  // This ensures that even if multiple sales happen simultaneously,
  // each will get a unique invoice number
  const result = await Setting.findOneAndUpdate(
    { key: 'invoiceSequence' },
    { $inc: { value: 1 } }, // Atomically increment the value
    { 
      new: true, // Return the updated document
      upsert: true, // Create if it doesn't exist
      setDefaultsOnInsert: true,
    }
  );

  // If the document was just created, it will have value: 1
  // Otherwise, it will have the incremented value
  const nextNumber = result ? parseInt(result.value, 10) : 1;

  // Format: INV-2025-00001
  const year = new Date().getFullYear();
  const paddedNumber = nextNumber.toString().padStart(5, '0');
  return `INV-${year}-${paddedNumber}`;
};

export const getTaxRate = async (): Promise<number> => {
  const setting = await Setting.findOne({ key: 'taxRate' });
  return setting ? parseFloat(setting.value) : 0;
};

export const setTaxRate = async (rate: number): Promise<void> => {
  await Setting.findOneAndUpdate(
    { key: 'taxRate' },
    { value: rate },
    { upsert: true }
  );
};
