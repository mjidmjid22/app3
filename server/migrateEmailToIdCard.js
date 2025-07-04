const { MongoClient } = require('mongodb');
require('dotenv').config();

async function migrateEmailToIdCard() {
  const client = new MongoClient(process.env.MONGO_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // Find all users with email field
    const usersWithEmail = await usersCollection.find({ email: { $exists: true } }).toArray();
    console.log(`Found ${usersWithEmail.length} users with email field`);
    
    for (const user of usersWithEmail) {
      // Extract ID card number from email (remove @worker.local)
      const idCardNumber = user.email.replace('@worker.local', '');
      
      // Update the user document
      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: { idCardNumber: idCardNumber },
          $unset: { email: "" }
        }
      );
      
      console.log(`Updated user ${user._id}: email "${user.email}" -> idCardNumber "${idCardNumber}"`);
    }
    
    console.log('Migration completed successfully');
    
    // Verify the migration
    const updatedUsers = await usersCollection.find({}).toArray();
    console.log('\nUpdated users:');
    updatedUsers.forEach(user => {
      console.log(`ID: ${user._id}, idCardNumber: ${user.idCardNumber}, role: ${user.role}`);
    });
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.close();
  }
}

migrateEmailToIdCard();