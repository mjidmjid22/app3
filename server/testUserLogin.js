const axios = require('axios');
const API_URL = 'http://192.168.0.114:5000';

async function testUserLogin() {
  try {
    console.log('Testing user login with ID card 283...');
    const response = await axios.post(`${API_URL}/users/login`, {
      idCardNumber: '283',
      password: '283'
    });
    console.log('✅ User login successful!');
    console.log('User data:', response.data);
    
    // Test getting receipts for this user
    console.log('\nTesting receipts for user...');
    const receiptsResponse = await axios.get(`${API_URL}/receipts/worker/${response.data._id}`);
    console.log('✅ Receipts retrieved!');
    console.log('Receipts count:', receiptsResponse.data.length);
    if (receiptsResponse.data.length > 0) {
      console.log('Sample receipt:', receiptsResponse.data[0]);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
    console.log('Full error:', error.response || error);
  }
}

async function testAllUsers() {
  const userIds = ['283', '2333', '232111'];
  
  for (const id of userIds) {
    console.log(`\n--- Testing user ${id} ---`);
    try {
      const response = await axios.post(`${API_URL}/users/login`, {
        idCardNumber: id,
        password: id
      });
      console.log(`✅ User ${id} login successful!`);
      console.log('User data:', response.data);
    } catch (error) {
      console.log(`❌ User ${id} login failed:`, error.response?.data || error.message);
    }
  }
}

console.log('=== Testing Individual User ===');
testUserLogin().then(() => {
  console.log('\n=== Testing All Users ===');
  return testAllUsers();
});