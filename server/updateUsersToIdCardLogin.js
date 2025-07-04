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

async function updateUsersToIdCardLogin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    // Get all workers
    const workers = await Worker.find();
    console.log(`Found ${workers.length} workers`);

    let updated = 0;
    let skipped = 0;

    for (const worker of workers) {
      try {
        // Find existing user with old email format
        const oldEmail = `${worker.firstName.toLowerCase()}.${worker.lastName.toLowerCase()}@company.com`;
        const newEmail = `${worker.idCardNumber}@worker.local`;
        
        const existingUser = await User.findOne({ email: oldEmail });
        
        if (existingUser) {
          // Update to new email format
          existingUser.email = newEmail;
          await existingUser.save();
          console.log(`Updated user: ${worker.firstName} ${worker.lastName} -> ${newEmail}`);
          updated++;
        } else {
          // Check if already has new format
          const newFormatUser = await User.findOne({ email: newEmail });
          if (newFormatUser) {
            console.log(`User already has new format: ${newEmail}`);
            skipped++;
          } else {
            console.log(`No user found for worker: ${worker.firstName} ${worker.lastName}`);
          }
        }

      } catch (error) {
        console.error(`Failed to update user for ${worker.firstName} ${worker.lastName}:`, error.message);
      }
    }

    console.log(`\nUpdate complete:`);
    console.log(`- Updated: ${updated} users`);
    console.log(`- Skipped: ${skipped} users (already correct format)`);
    console.log(`- Total workers: ${workers.length}`);

  } catch (error) {
    console.error('Error during update:', error);
  } finally {
    mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

updateUsersToIdCardLogin();