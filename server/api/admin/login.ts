import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

// Admin model schema
const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: 'Admin' },
  dateCreated: { type: Date, default: Date.now },
  lastLogin: { type: Date, required: false },
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

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

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    res.status(200).json({
      _id: admin._id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    });
  } catch (error: any) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}