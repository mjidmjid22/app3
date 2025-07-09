import mongoose, { Schema, Document } from 'mongoose';

export interface IReceipt extends Document {
  workerId: string;
  hoursWorked: number;
  date: Date;
  total: number;
}

const ReceiptSchema: Schema = new Schema({
  workerId: { type: String, required: true },
  hoursWorked: { type: Number, required: true },
  date: { type: Date, required: true },
  total: { type: Number, required: true },
});

export default mongoose.model<IReceipt>('Receipt', ReceiptSchema);
