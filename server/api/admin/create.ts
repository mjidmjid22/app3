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

  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }

  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create admin
    const newAdmin = new Admin({
      email,
      passwordHash,
      name,
      role: 'Admin'
    });

    await newAdmin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      admin: {
        _id: newAdmin._id,
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role,
        dateCreated: newAdmin.dateCreated
      }
    });
  } catch (error: any) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}