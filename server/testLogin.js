const axios = require('axios');

const API_URL = 'http://192.168.0.114:5000';

async function testLogin() {
  try {
    console.log('Testing login endpoint...');
    const response = await axios.post(`${API_URL}/users/login`, {
      email: 'admin@example.com',
      password: 'password'
    });
    
    console.log('Login successful!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Login failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Full error:', error.message);
  }
}

testLogin();