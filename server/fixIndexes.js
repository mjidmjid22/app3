const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

async function fixIndexes() {
  try {
    await new Promise(resolve => {
      mongoose.connection.once('open', resolve);
    });
    
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collection = db.collection('workers');
    
    console.log('\nCurrent indexes:');
    const indexes = await collection.indexes();
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. Index:`, JSON.stringify(index, null, 2));
    });
    
    // Drop the email index since workers don't have email
    console.log('\nDropping email index...');
    try {
      await collection.dropIndex('email_1');
      console.log('Email index dropped successfully');
    } catch (error) {
      console.log('Email index drop failed:', error.message);
    }
    
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

fixIndexes();