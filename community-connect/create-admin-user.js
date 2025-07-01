const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function createAdmin() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('mainStreetOpportunities');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Check if admin already exists
    const existingAdmin = await db.collection('users').findOne({ email: 'admin@admin.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists, updating password...');
      await db.collection('users').updateOne(
        { email: 'admin@admin.com' },
        { $set: { password: hashedPassword } }
      );
      console.log('Admin password updated successfully');
      await client.close();
      return;
    }
    
    // Insert admin user
    const result = await db.collection('users').insertOne({
      name: 'Admin',
      email: 'admin@admin.com',
      password: hashedPassword,
      role: 'admin',
      isAdmin: true,
      createdAt: new Date()
    });
    
    console.log('Admin user created successfully with ID:', result.insertedId);
    await client.close();
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdmin();