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
      console.log(`\n2. Current status of ${firstWorker.firstName} ${firstWorker.lastName}:`);
      console.log('isChecked:', firstWorker.isChecked);
      console.log('isPaid:', firstWorker.isPaid);
      
      console.log(`\n3. Updating isChecked to true...`);
      
      // Toggle isChecked status to true
      const updateResult = await axios.post(`${API_URL}/workers/update/${firstWorker._id}`, {
        isChecked: true
      });
      console.log('Update response:', updateResult.data);
      
      console.log('\n4. Getting workers again to verify update...');
      const updatedWorkers = await axios.get(`${API_URL}/workers`);
      const updatedWorker = updatedWorkers.data.find(w => w._id === firstWorker._id);
      console.log('Updated worker status:', {
        id: updatedWorker._id,
        name: `${updatedWorker.firstName} ${updatedWorker.lastName}`,
        isChecked: updatedWorker.isChecked,
        isPaid: updatedWorker.isPaid
      });
      
      console.log('\n5. Now updating isPaid to true...');
      const updateResult2 = await axios.post(`${API_URL}/workers/update/${firstWorker._id}`, {
        isPaid: true
      });
      console.log('Update response 2:', updateResult2.data);
      
      console.log('\n6. Final verification...');
      const finalWorkers = await axios.get(`${API_URL}/workers`);
      const finalWorker = finalWorkers.data.find(w => w._id === firstWorker._id);
      console.log('Final worker status:', {
        id: finalWorker._id,
        name: `${finalWorker.firstName} ${finalWorker.lastName}`,
        isChecked: finalWorker.isChecked,
        isPaid: finalWorker.isPaid
      });
    }
    
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testStatusUpdate();