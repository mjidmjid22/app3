const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

async function convertWorkersToUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    // Get all workers
    const workers = await Worker.find();
    console.log(`Found ${workers.length} workers to convert`);

    let converted = 0;
    let skipped = 0;

    for (const worker of workers) {
      try {
        // Generate email from worker name
        const email = `${worker.firstName.toLowerCase()}.${worker.lastName.toLowerCase()}@company.com`;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          console.log(`User already exists for ${worker.firstName} ${worker.lastName} (${email})`);
          skipped++;
          continue;
        }

        // Use ID card number as default password
        const password = worker.idCardNumber;
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user account
        const newUser = new User({
          email: email,
          passwordHash: passwordHash,
          role: 'Worker'
        });

        await newUser.save();
        console.log(`Created user account for ${worker.firstName} ${worker.lastName} (${email})`);
        converted++;

      } catch (error) {
        console.error(`Failed to create user for ${worker.firstName} ${worker.lastName}:`, error.message);
      }
    }

    console.log(`\nConversion complete:`);
    console.log(`- Converted: ${converted} workers`);
    console.log(`- Skipped: ${skipped} workers (already had accounts)`);
    console.log(`- Total workers: ${workers.length}`);

  } catch (error) {
    console.error('Error during conversion:', error);
  } finally {
    mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

convertWorkersToUsers();