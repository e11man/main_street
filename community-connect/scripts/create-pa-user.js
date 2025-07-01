require('dotenv').config({ path: '.env.local' });
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

async function createPAUser() {
  try {
    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('mainStreetOpportunities');
    const usersCollection = db.collection('users');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('pa123', 10);
    
    // Check if PA user already exists
    const existingPA = await usersCollection.findOne({ email: 'pa@taylor.edu' });
    
    if (existingPA) {
      console.log('PA user already exists, updating password and role...');
      await usersCollection.updateOne(
        { email: 'pa@taylor.edu' },
        { 
          $set: { 
            password: hashedPassword,
            role: 'pa'
          } 
        }
      );
      console.log('PA user updated successfully');
    } else {
      // Create PA user
      const paUser = {
        name: 'Test PA',
        email: 'pa@taylor.edu',
        password: hashedPassword,
        dorm: 'Berg',
        role: 'pa',
        commitments: [],
        createdAt: new Date()
      };
      
      const result = await usersCollection.insertOne(paUser);
      console.log('PA user created successfully with ID:', result.insertedId);
    }
    
    console.log('PA User Details:');
    console.log('Email: pa@taylor.edu');
    console.log('Password: pa123');
    console.log('Role: pa');
    console.log('Dorm: Berg');
    
    await client.close();
  } catch (error) {
    console.error('Error creating PA user:', error);
  }
}

createPAUser();