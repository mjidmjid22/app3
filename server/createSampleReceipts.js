const axios = require('axios');
const API_URL = 'http://192.168.0.114:5000';

async function createSampleReceipts() {
  try {
    // Get all users first
    const usersResponse = await axios.get(`${API_URL}/users`);
    const users = usersResponse.data;
    console.log('Found users:', users.length);
    
    for (const user of users) {
      console.log(`Creating receipts for user: ${user.idCardNumber} (${user._id})`);
      
      // Create 3-4 receipts for each user for the current month
      const currentDate = new Date();
      const receipts = [
        {
          workerId: user._id,
          hoursWorked: 8,
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
          total: 120,
          description: 'Regular work day',
          isPaid: true
        },
        {
          workerId: user._id,
          hoursWorked: 8,
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 2),
          total: 120,
          description: 'Regular work day',
          isPaid: true
        },
        {
          workerId: user._id,
          hoursWorked: 10,
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 3),
          total: 150,
          description: 'Work day with overtime',
          isPaid: false
        },
        {
          workerId: user._id,
          hoursWorked: 8,
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4),
          total: 120,
          description: 'Regular work day',
          isPaid: false
        }
      ];
      
      for (const receipt of receipts) {
        try {
          await axios.post(`${API_URL}/receipts/add`, receipt);
          console.log(`  ✅ Created receipt for ${receipt.date.toDateString()}`);
        } catch (error) {
          console.log(`  ❌ Failed to create receipt:`, error.response?.data || error.message);
        }
      }
    }
    
    console.log('\n✅ Sample receipts creation completed!');
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

createSampleReceipts();