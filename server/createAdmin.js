const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./dist/models/user.model').default;

const MONGO_URI = 'mongodb+srv://manteauverte:DE3mTIEfjf2ktcuV@cluster0.i5x7ktk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function createAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    const email = 'admin@example.com';
    const password = 'password';
    const role = 'Admin';

    // Delete existing admin user if it exists
    await User.deleteOne({ email });
    console.log('Deleted existing admin user if it existed');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({ email, passwordHash, role });

    await newUser.save();
    console.log('Admin user created successfully with role:', role);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

createAdmin();