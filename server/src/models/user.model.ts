import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  idCardNumber: string;
  password?: string;
  passwordHash?: string;
  role: 'Worker' | 'Supervisor' | 'Admin';
  name?: string;
  lastLogin?: Date;
}

const UserSchema: Schema = new Schema({
  idCardNumber: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: false }, // Optional for workers
  role: { type: String, required: true, enum: ['Worker', 'Supervisor', 'Admin'] },
  name: { type: String, required: false },
  lastLogin: { type: Date, required: false },
});

export default mongoose.model<IUser>('User', UserSchema);
