import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '5000');

app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('MONGO_URI is not defined in .env file');
  process.exit(1);
}

// Connect to MongoDB with proper error handling
mongoose.connect(uri, { 
  serverSelectionTimeoutMS: 30000, // 30 seconds
  socketTimeoutMS: 45000, // 45 seconds
  bufferCommands: false,
  maxPoolSize: 10,
  retryWrites: true,
  w: 'majority'
})
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    console.log('🔄 Continuing without MongoDB - some features may not work');
    // Don't exit in development, but log the error
  });

const connection = mongoose.connection;

connection.once('open', () => {
  console.log('🔗 MongoDB connection established');
});

connection.on('error', (error) => {
  console.error('❌ MongoDB connection error:', error);
});

connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected');
});

import workersRouter from './routes/workers.route';
import receiptsRouter from './routes/receipts.route';
import usersRouter from './routes/users.route';
import adminRouter from './routes/admin.route';

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.use('/workers', workersRouter);
app.use('/receipts', receiptsRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📡 Server accessible at http://localhost:${port}`);
});
