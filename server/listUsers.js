const mongoose = require('mongoose');
const User = require('./dist/models/user.model').default;

const MONGO_URI = 'mongodb+srv://manteauverte:DE3mTIEfjf2ktcuV@cluster0.i5x7ktk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function listUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    const users = await User.find();
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`- Email: ${user.email}, Role: ${user.role}, ID: ${user._id}`);
    });

    if (users.length === 0) {
      console.log('No users found in database');
    }
  } catch (error) {
    console.error('Error listing users:', error);
  } finally {
    mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

listUsers();