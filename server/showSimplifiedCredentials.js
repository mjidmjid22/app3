const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://manteauverte:DE3mTIEfjf2ktcuV@cluster0.i5x7ktk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Define schemas
const WorkerSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  phoneNumber: String,
  idCardNumber: String,
  dailyRate: Number,
  position: String,
  startDate: Date
});

const Worker = mongoose.model('Worker', WorkerSchema);

async function showSimplifiedCredentials() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    // Get all workers
    const workers = await Worker.find();
    console.log('\n=== SIMPLIFIED LOGIN SYSTEM ===\n');

    console.log('🔹 WORKERS (Login with ID Card Number only):');
    console.log('─'.repeat(50));
    
    for (const worker of workers) {
      console.log(`👤 ${worker.firstName} ${worker.lastName}`);
      console.log(`   📱 Phone: ${worker.phoneNumber || 'Not provided'}`);
      console.log(`   🆔 ID Card: ${worker.idCardNumber}`);
      console.log(`   🔑 Login: ${worker.idCardNumber} (same as password)`);
      console.log(`   💼 Position: ${worker.position}`);
      console.log('');
    }

    console.log('🔹 ADMIN (Login with Email):');
    console.log('─'.repeat(50));
    console.log('👤 Administrator');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: password');
    console.log('');

    console.log('📋 HOW TO LOGIN:');
    console.log('─'.repeat(50));
    console.log('🔸 Workers: Select "Worker" tab, enter ID card number');
    console.log('🔸 Admin: Select "Admin" tab, enter email and password');
    console.log('🔸 Workers use their ID card number as both username AND password');
    console.log('🔸 No email required for workers!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
    console.log('\nMongoDB disconnected');
  }
}

showSimplifiedCredentials();