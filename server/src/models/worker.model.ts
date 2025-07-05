import mongoose, { Schema, Document } from 'mongoose';

export interface IWorker extends Document {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  idCardNumber: string;
  dailyRate: number;
  position: string;
  startDate: Date;
  isChecked: boolean;
  isPaid: boolean;
}

const WorkerSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String, required: false },
  idCardNumber: { type: String, required: true, unique: true },
  dailyRate: { type: Number, required: true },
  position: { type: String, required: true },
  startDate: { type: Date, required: true },
  isChecked: { type: Boolean, default: false },
  isPaid: { type: Boolean, default: false },
});

export default mongoose.model<IWorker>('Worker', WorkerSchema);
