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

mongoose.connect(uri);

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

import workersRouter from './routes/workers.route';
import receiptsRouter from './routes/receipts.route';
import usersRouter from './routes/users.route';
import adminRouter from './routes/admin.route';

app.use('/workers', workersRouter);
app.use('/receipts', receiptsRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port: ${port}`);
  console.log(`Server accessible at: http://192.168.0.114:${port}`);
});
