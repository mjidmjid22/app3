const mongoose = require('mongoose');
require('dotenv').config({ path: '../server/.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

// Define the Worker schema (same as in the server)
const WorkerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  idCardNumber: { type: String, required: true, unique: true },
  dailyRate: { type: Number, required: true },
  position: { type: String, required: true },
  startDate: { type: Date, required: true },
});

const Worker = mongoose.model('Worker', WorkerSchema);

async function debugDatabase() {
  try {
    console.log('Connected to MongoDB');
    
    console.log('\n1. All workers in database:');
    const allWorkers = await Worker.find({});
    console.log('Total workers:', allWorkers.length);
    allWorkers.forEach((worker, index) => {
      console.log(`${index + 1}. ID: ${worker._id}, Name: ${worker.firstName} ${worker.lastName}, ID Card: ${worker.idCardNumber}`);
    });
    
    console.log('\n2. Searching specifically for ID card "2333":');
    const worker2333 = await Worker.findOne({ idCardNumber: '2333' });
    console.log('Found worker with ID 2333:', worker2333);
    
    console.log('\n3. Searching for any workers with ID card containing "2333":');
    const workersContaining2333 = await Worker.find({ idCardNumber: { $regex: '2333' } });
    console.log('Workers containing 2333:', workersContaining2333);
    
    console.log('\n4. All unique ID card numbers:');
    const idCards = await Worker.distinct('idCardNumber');
    console.log('ID cards:', idCards);
    
    console.log('\n5. Checking for duplicate ID cards:');
    const duplicates = await Worker.aggregate([
      { $group: { _id: '$idCardNumber', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    console.log('Duplicates:', duplicates);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugDatabase();