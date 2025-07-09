import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;
if (uri) {
  // Connect to MongoDB with proper error handling
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running on Vercel',
    timestamp: new Date().toISOString(),
    mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Mantaevert API is running',
    endpoints: ['/health', '/users', '/admin', '/workers', '/receipts']
  });
});

// Import routes
try {
  const workersRouter = require('../src/routes/workers.route').default;
  const receiptsRouter = require('../src/routes/receipts.route').default;
  const usersRouter = require('../src/routes/users.route').default;
  const adminRouter = require('../src/routes/admin.route').default;

  app.use('/workers', workersRouter);
  app.use('/receipts', receiptsRouter);
  app.use('/users', usersRouter);
  app.use('/admin', adminRouter);
} catch (error) {
  console.error('Error loading routes:', error);
}

// Export for Vercel serverless function
export default app;