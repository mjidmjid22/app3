const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://manteauverte:DE3mTIEfjf2ktcuV@cluster0.i5x7ktk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Define schemas
const WorkerSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  idCardNumber: String,
  dailyRate: Number,
  position: String,
  startDate: Date
});

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, required: true, enum: ['Worker', 'Supervisor', 'Admin'] },
});

const Worker = mongoose.model('Worker', WorkerSchema);
const User = mongoose.model('User', UserSchema);

async function showUpdatedCredentials() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    // Get all workers
    const workers = await Worker.find();
    console.log('\n=== UPDATED WORKER LOGIN CREDENTIALS ===\n');

    for (const worker of workers) {
      const idCardNumber = worker.idCardNumber;
      const password = worker.idCardNumber; // Same as ID card number
      
      console.log(`Name: ${worker.firstName} ${worker.lastName}`);
      console.log(`ID Card Number (Login): ${idCardNumber}`);
      console.log(`Password: ${password}`);
      console.log(`Position: ${worker.position}`);
      console.log('---');
    }

    console.log('\n=== ADMIN CREDENTIALS ===\n');
    console.log('Email: admin@example.com');
    console.log('Password: password');
    console.log('---');

    console.log('\nNote: Workers now log in using their ID card number (both as username and password).');
    console.log('Admin still uses email and password.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
    console.log('\nMongoDB disconnected');
  }
}

showUpdatedCredentials();