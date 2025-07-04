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

async function showWorkerCredentials() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    // Get all workers
    const workers = await Worker.find();
    console.log('\n=== WORKER LOGIN CREDENTIALS ===\n');

    for (const worker of workers) {
      const email = `${worker.firstName.toLowerCase()}.${worker.lastName.toLowerCase()}@company.com`;
      const password = worker.idCardNumber;
      
      console.log(`Name: ${worker.firstName} ${worker.lastName}`);
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
      console.log(`Position: ${worker.position}`);
      console.log('---');
    }

    console.log('\nNote: All workers can now log in using their email and ID card number as password.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
    console.log('\nMongoDB disconnected');
  }
}

showWorkerCredentials();