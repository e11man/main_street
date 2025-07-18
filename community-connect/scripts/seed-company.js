/**
 * Seed Company Data Script
 * -----------------------
 * 
 * This script creates a dummy company account for testing purposes.
 * Run this script with: node scripts/seed-company.js
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '.env.local' });

async function seedCompany() {
  try {
    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('mainStreetOpportunities');
    const companiesCollection = db.collection('companies');
    
    // Check if test company already exists
    const existingCompany = await companiesCollection.findOne({ email: 'testcompany@example.com' });
    
    if (existingCompany) {
      console.log('Test company already exists. Skipping creation.');
    } else {
      // Create a dummy company
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const dummyCompany = {
        name: 'Test Company Inc.',
        email: 'testcompany@example.com',
        password: hashedPassword,
        description: 'A test company for demonstration purposes',
        website: 'https://testcompany.example.com',
        phone: '555-123-4567',
        opportunities: [], // Array to store opportunity IDs created by this company
        chatNotificationFrequency: 'immediate',
        createdAt: new Date(),
        approved: true
      };
      
      const result = await companiesCollection.insertOne(dummyCompany);
      console.log(`Test company created with ID: ${result.insertedId}`);
      console.log('Login credentials:');
      console.log('Email: testcompany@example.com');
      console.log('Password: password123');
    }
    
    await client.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error seeding company data:', error);
  }
}

seedCompany();