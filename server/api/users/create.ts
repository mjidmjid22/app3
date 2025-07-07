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

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { idCardNumber, password, role, name } = req.body;

  if (!idCardNumber || !role) {
    return res.status(400).json({ error: 'ID card number and role are required' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ idCardNumber });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this ID card number already exists' });
    }

    let passwordHash;
    
    // Only hash password if provided (workers might not have passwords)
    if (password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }

    // Create user
    const newUser = new User({
      idCardNumber,
      passwordHash,
      role,
      name
    });

    await newUser.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        _id: newUser._id,
        idCardNumber: newUser.idCardNumber,
        role: newUser.role,
        name: newUser.name
      }
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}