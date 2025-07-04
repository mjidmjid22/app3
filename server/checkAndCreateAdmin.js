const axios = require('axios');
const API_URL = 'http://192.168.0.114:5000';

async function checkAndCreateAdmin() {
  try {
    console.log('Checking existing admin accounts...');
    const response = await axios.get(`${API_URL}/admin`);
    console.log('✅ Admins found:', response.data.length);
    
    if (response.data.length > 0) {
      response.data.forEach((admin, index) => {
        console.log(`Admin ${index + 1}:`, {
          id: admin._id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        });
      });
    } else {
      console.log('No admins found, creating default admin...');
      
      // Create a default admin account
      await axios.post(`${API_URL}/admin/add`, {
        email: 'admin@mantaevert.com',
        password: 'admin123',
        name: 'System Administrator'
      });
      
      console.log('✅ Default admin created!');
      console.log('Email: admin@mantaevert.com');
      console.log('Password: admin123');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('Admin endpoint not found. Creating default admin...');
      try {
        await axios.post(`${API_URL}/admin/add`, {
          email: 'admin@mantaevert.com',
          password: 'admin123',
          name: 'System Administrator'
        });
        console.log('✅ Default admin created!');
      } catch (createError) {
        console.log('❌ Failed to create admin:', createError.response?.data || createError.message);
      }
    }
  }
}

checkAndCreateAdmin();