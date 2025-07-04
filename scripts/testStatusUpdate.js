const axios = require('axios');

const API_URL = 'http://192.168.0.114:5000';

async function testStatusUpdate() {
  try {
    console.log('1. Getting all workers...');
    const workers = await axios.get(`${API_URL}/workers`);
    console.log('Workers:', workers.data.map(w => ({
      id: w._id,
      name: `${w.firstName} ${w.lastName}`,
      isChecked: w.isChecked,
      isPaid: w.isPaid
    })));
    
    if (workers.data.length > 0) {
      const firstWorker = workers.data[0];
      console.log(`\n2. Updating worker ${firstWorker.firstName} ${firstWorker.lastName}...`);
      
      // Toggle isChecked status
      const updateResult = await axios.post(`${API_URL}/workers/update/${firstWorker._id}`, {
        isChecked: !firstWorker.isChecked
      });
      console.log('Update result:', updateResult.data);
      
      console.log('\n3. Getting workers again to verify update...');
      const updatedWorkers = await axios.get(`${API_URL}/workers`);
      const updatedWorker = updatedWorkers.data.find(w => w._id === firstWorker._id);
      console.log('Updated worker:', {
        id: updatedWorker._id,
        name: `${updatedWorker.firstName} ${updatedWorker.lastName}`,
        isChecked: updatedWorker.isChecked,
        isPaid: updatedWorker.isPaid
      });
    }
    
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testStatusUpdate();