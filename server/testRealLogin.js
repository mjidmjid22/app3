const axios = require('axios');
const API_URL = 'http://192.168.0.114:5000';

async function testLogin() {
  try {
    console.log('Testing user login with ID card 283...');
    const response = await axios.post(`${API_URL}/users/login`, {
      idCardNumber: '283',
      password: '283'
    });
    console.log('✅ Login successful!');
    console.log('User data:', response.data);
    
    // Test getting receipts for this user
    console.log('\nTesting receipts for user...');
    const receiptsResponse = await axios.get(`${API_URL}/receipts/worker/${response.data._id}`);
    console.log('✅ Receipts retrieved!');
    console.log('Receipts count:', receiptsResponse.data.length);
    console.log('Sample receipt:', receiptsResponse.data[0] || 'No receipts found');
    
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data || error.message);
  }
}

testLogin();