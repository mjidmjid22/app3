const axios = require('axios');

const API_URL = 'http://192.168.0.114:5000';

async function testAPI() {
  try {
    console.log('1. Getting all workers...');
    const workers = await axios.get(`${API_URL}/workers`);
    console.log('Workers:', workers.data);
    
    console.log('\n2. Checking if ID 2333 exists...');
    const checkResult = await axios.get(`${API_URL}/workers/check-id/2333`);
    console.log('Check result:', checkResult.data);
    
    console.log('\n3. Trying to add worker with ID 2333...');
    const addResult = await axios.post(`${API_URL}/workers/add`, {
      firstName: 'Test',
      lastName: 'User',
      idCardNumber: '2333',
      dailyRate: 100,
      position: 'Tester',
      startDate: '2025-07-02T18:44:03.751Z'
    });
    console.log('Add result:', addResult.data);
    
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testAPI();