const axios = require('axios');
const API_URL = 'http://192.168.0.114:5000';

async function testAdminLogin() {
  try {
    console.log('Testing admin login...');
    const response = await axios.post(`${API_URL}/admin/login`, {
      email: 'admin@example.com',
      password: 'password'
    });
    console.log('✅ Admin login successful!');
    console.log('Admin data:', response.data);
  } catch (error) {
    console.log('❌ Admin login failed:', error.response?.data || error.message);
  }
}

testAdminLogin();