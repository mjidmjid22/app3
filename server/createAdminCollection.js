const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGO_URI = 'mongodb+srv://manteauverte:DE3mTIEfjf2ktcuV@cluster0.i5x7ktk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Define admin schema
const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true, default: 'Admin' },
  dateCreated: { type: Date, default: Date.now },
  lastLogin: { type: Date },
});

const Admin = mongoose.model('Admin', AdminSchema);

async function createAdminCollection() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin already exists in admin collection');
      return;
    }

    // Create admin user
    const email = 'admin@example.com';
    const password = 'password';
    const name = 'System Administrator';

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({
      email: email,
      passwordHash: passwordHash,
      name: name,
      role: 'Admin'
    });

    await newAdmin.save();
    console.log('✅ Admin created successfully in admin collection!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 Name:', name);

    // Remove admin from users collection if it exists
    const UserSchema = new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      passwordHash: { type: String, required: true },
      role: { type: String, required: true, enum: ['Worker', 'Supervisor', 'Admin'] },
    });
    const User = mongoose.model('User', UserSchema);

    const adminInUsers = await User.findOne({ email: 'admin@example.com' });
    if (adminInUsers) {
      await User.deleteOne({ email: 'admin@example.com' });
      console.log('🗑️ Removed admin from users collection');
    }

    console.log('\n🎉 Admin collection setup complete!');

  } catch (error) {
    console.error('❌ Error creating admin collection:', error);
  } finally {
    mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

createAdminCollection();