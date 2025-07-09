import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user.model';

const router = express.Router();

// Get all users
router.route('/').get((req, res) => {
  User.find()
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Add a new user
router.route('/add').post(async (req, res) => {
  const { idCardNumber, password, role, name } = req.body;

  try {
    let passwordHash;
    
    // Only hash password if provided (workers might not have passwords)
    if (password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }

    const newUser = new User({ 
      idCardNumber, 
      passwordHash, // Will be undefined if no password provided
      role, 
      name 
    });

    await newUser.save();
    res.json('User added!');
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// User login
router.route('/login').post(async (req, res) => {
  const { idCardNumber, password } = req.body;

  try {
    const user = await User.findOne({ idCardNumber });
    if (!user) {
      return res.status(400).json('Invalid ID card number');
    }

    // If password is provided, validate it (for users with passwords)
    // If no password provided or empty, allow login for workers without passwords
    if (password && user.passwordHash) {
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json('Invalid password');
      }
    } else if (password && !user.passwordHash) {
      return res.status(400).json('This user does not require a password');
    } else if (!password && user.passwordHash) {
      return res.status(400).json('Password required for this user');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({ 
      _id: user._id, 
      idCardNumber: user.idCardNumber, 
      role: user.role,
      name: user.name 
    });
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Get a single user by ID
router.route('/:id').get((req, res) => {
  User.findById(req.params.id)
    .then(user => res.json(user))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Delete a user by ID
router.route('/:id').delete((req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then(() => res.json('User deleted.'))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Update a user by ID
router.route('/update/:id').post(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.idCardNumber = req.body.idCardNumber || user.idCardNumber;
      user.role = req.body.role || user.role;
      user.name = req.body.name || user.name;

      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(req.body.password, salt);
      }

      await user.save();
      res.json('User updated!');
    } else {
      res.status(404).json('Error: User not found');
    }
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

export default router;
