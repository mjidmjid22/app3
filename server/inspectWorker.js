const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

async function inspectWorker() {
  try {
    await new Promise(resolve => {
      mongoose.connection.once('open', resolve);
    });
    
    console.log('Connected to MongoDB');
    
    // Get the problematic worker
    const db = mongoose.connection.db;
    const collection = db.collection('workers');
    
    console.log('\nRaw documents in workers collection:');
    const rawWorkers = await collection.find({}).toArray();
    rawWorkers.forEach((worker, index) => {
      console.log(`\n${index + 1}. Worker:`, JSON.stringify(worker, null, 2));
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

inspectWorker();