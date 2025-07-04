const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017/mantaevert";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();

    const database = client.db('mantaevert');
    const users = database.collection('users');

    // Create a new admin user
    const adminUser = {
      email: 'admin@mantaevert.com',
      password: 'admin', // In a real app, this should be hashed
      name: 'Admin User',
      role: 'Admin',
      status: 'Active',
      department: 'Administration',
      dateCreated: new Date(),
      dailyRate: 0,
    };

    const result = await users.insertOne(adminUser);
    console.log(`New admin user created with the following id: ${result.insertedId}`);

  } finally {
    await client.close();
  }
}

run().catch(console.dir);
