import { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB if not already connected
if (mongoose.connection.readyState === 0) {
  const uri = process.env.MONGO_URI;
  if (uri) {
    mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    }).catch((error) => {
      console.error('❌ MongoDB connection error:', error);
    });
  }
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    status: 'OK',
    message: 'Mantaevert API is running on Vercel',
    timestamp: new Date().toISOString(),
    mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
}