/**
 * Seed Organization Data Script
 * -----------------------
 * 
 * This script creates a dummy organization account for testing purposes.
 * Run this script with: node scripts/seed-organization.js
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '.env.local' });

async function seedOrganization() {
  try {
    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('mainStreetOpportunities');
    const organizationsCollection = db.collection('companies');
    
    // Check if test organization already exists
    const existingOrganization = await organizationsCollection.findOne({ email: 'testorganization@example.com' });
    
    if (existingOrganization) {
      console.log('Test organization already exists. Skipping creation.');
    } else {
      // Create a dummy organization
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const dummyOrganization = {
        name: 'Test Organization Inc.',
        email: 'testorganization@example.com',
        password: hashedPassword,
        description: 'A test organization for demonstration purposes',
        website: 'https://testorganization.example.com',
        phone: '555-123-4567',
        opportunities: [], // Array to store opportunity IDs created by this organization
        chatNotificationFrequency: 'immediate',
        createdAt: new Date(),
        approved: true
      };
      
      const result = await organizationsCollection.insertOne(dummyOrganization);
      console.log(`Test organization created with ID: ${result.insertedId}`);
      console.log('Login credentials:');
      console.log('Email: testorganization@example.com');
      console.log('Password: password123');
    }
    
    await client.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error seeding organization data:', error);
  }
}

seedOrganization();