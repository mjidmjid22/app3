const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

async function checkIndexes() {
  try {
    await new Promise(resolve => {
      mongoose.connection.once('open', resolve);
    });
    
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collection = db.collection('workers');
    
    console.log('\nIndexes on workers collection:');
    const indexes = await collection.indexes();
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. Index:`, JSON.stringify(index, null, 2));
    });
    
    // Try to drop and recreate the unique index
    console.log('\nDropping idCardNumber index...');
    try {
      await collection.dropIndex('idCardNumber_1');
      console.log('Index dropped successfully');
    } catch (error) {
      console.log('Index drop failed (might not exist):', error.message);
    }
    
    console.log('\nCreating new unique index on idCardNumber...');
    await collection.createIndex({ idCardNumber: 1 }, { unique: true });
    console.log('Index created successfully');
    
    console.log('\nFinal indexes:');
    const finalIndexes = await collection.indexes();
    finalIndexes.forEach((index, i) => {
      console.log(`${i + 1}. Index:`, JSON.stringify(index, null, 2));
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkIndexes();