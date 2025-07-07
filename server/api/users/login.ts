import { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

// User model schema
const UserSchema = new mongoose.Schema({
  idCardNumber: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: false },
  role: { type: String, required: true, enum: ['Worker', 'Supervisor', 'Admin'] },
  name: { type: String, required: false },
  lastLogin: { type: Date, required: false },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { idCardNumber, password } = req.body;

  if (!idCardNumber) {
    return res.status(400).json({ error: 'ID card number is required' });
  }

  try {
    const user = await User.findOne({ idCardNumber });
    if (!user) {
      return res.status(400).json({ error: 'Invalid ID card number' });
    }

    // If password is provided, validate it (for users with passwords)
    // If no password provided or empty, allow login for workers without passwords
    if (password && user.passwordHash) {
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid password' });
      }
    } else if (password && !user.passwordHash) {
      return res.status(400).json({ error: 'This user does not require a password' });
    } else if (!password && user.passwordHash) {
      return res.status(400).json({ error: 'Password required for this user' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      _id: user._id,
      idCardNumber: user.idCardNumber,
      role: user.role,
      name: user.name
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}