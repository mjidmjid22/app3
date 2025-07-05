import express from 'express';
import bcrypt from 'bcrypt';
import Admin from '../models/admin.model';

const router = express.Router();

// Admin login
router.route('/login').post(async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(400).json('Invalid email or password');
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    res.json({ 
      _id: admin._id, 
      email: admin.email, 
      name: admin.name,
      role: admin.role 
    });
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Get all admins
router.route('/').get(async (req, res) => {
  try {
    const admins = await Admin.find().select('-passwordHash');
    res.json(admins);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Add a new admin
router.route('/add').post(async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({ 
      email, 
      passwordHash, 
      name,
      role: 'Admin'
    });

    await newAdmin.save();
    res.json('Admin added!');
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

export default router;