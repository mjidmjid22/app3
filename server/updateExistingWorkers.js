const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

async function updateExistingWorkers() {
  try {
    await new Promise(resolve => {
      mongoose.connection.once('open', resolve);
    });
    
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collection = db.collection('workers');
    
    console.log('\nUpdating existing workers to include status fields...');
    
    // Update all workers that don't have the new status fields
    const updateResult = await collection.updateMany(
      {
        $or: [
          { isChecked: { $exists: false } },
          { isPaid: { $exists: false } }
        ]
      },
      {
        $set: {
          isChecked: false,
          isPaid: false
        }
      }
    );
    
    console.log('Update result:', updateResult);
    console.log(`Updated ${updateResult.modifiedCount} workers`);
    
    console.log('\nFinal workers with status fields:');
    const allWorkers = await collection.find({}).toArray();
    allWorkers.forEach((worker, index) => {
      console.log(`${index + 1}. ${worker.firstName} ${worker.lastName} - Checked: ${worker.isChecked}, Paid: ${worker.isPaid}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

updateExistingWorkers();