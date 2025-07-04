const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

async function cleanupWorkers() {
  try {
    await new Promise(resolve => {
      mongoose.connection.once('open', resolve);
    });
    
    console.log('Connected to MongoDB');
    
    // Get the problematic worker
    const db = mongoose.connection.db;
    const collection = db.collection('workers');
    
    console.log('\nBefore cleanup:');
    const beforeWorkers = await collection.find({}).toArray();
    console.log('Total documents:', beforeWorkers.length);
    
    // Delete the document that doesn't have the proper worker schema
    console.log('\nDeleting document with old schema...');
    const deleteResult = await collection.deleteOne({ 
      _id: new mongoose.Types.ObjectId('68655e8aa30e40fb6cb14a68') 
    });
    console.log('Delete result:', deleteResult);
    
    console.log('\nAfter cleanup:');
    const afterWorkers = await collection.find({}).toArray();
    console.log('Total documents:', afterWorkers.length);
    afterWorkers.forEach((worker, index) => {
      console.log(`${index + 1}. Worker:`, JSON.stringify(worker, null, 2));
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

cleanupWorkers();