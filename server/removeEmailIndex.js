const { MongoClient } = require('mongodb');
require('dotenv').config();

async function removeEmailIndex() {
  const client = new MongoClient(process.env.MONGO_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // List current indexes
    const indexes = await usersCollection.indexes();
    console.log('Current indexes:');
    indexes.forEach(index => {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
    });
    
    // Try to drop the email index if it exists
    try {
      await usersCollection.dropIndex('email_1');
      console.log('Successfully dropped email_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('email_1 index does not exist');
      } else {
        console.log('Error dropping email_1 index:', error.message);
      }
    }
    
    // List indexes after dropping
    const indexesAfter = await usersCollection.indexes();
    console.log('\nIndexes after dropping email index:');
    indexesAfter.forEach(index => {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

removeEmailIndex();