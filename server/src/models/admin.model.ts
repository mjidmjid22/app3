import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: 'Admin';
  dateCreated: Date;
  lastLogin?: Date;
}

const AdminSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true, default: 'Admin' },
  dateCreated: { type: Date, default: Date.now },
  lastLogin: { type: Date },
});

export default mongoose.model<IAdmin>('Admin', AdminSchema);