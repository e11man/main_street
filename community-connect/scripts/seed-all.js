/**
 * Complete Database Seeding Script
 * --------------------------------
 * 
 * This script populates the MongoDB database with sample data including:
 * - Opportunities
 * - Companies
 * - Users
 * - Admin accounts
 * 
 * All passwords are set to 'test' for development purposes.
 * 
 * Usage: node scripts/seed-all.js
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });

// Get MongoDB connection string from environment variables
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('Please define the MONGODB_URI environment variable in .env.local');
  process.exit(1);
}

// Sample opportunities data
const opportunitiesData = [
  {
    "id": 1,
    "category": "community",
    "priority": "High Priority",
    "title": "Volunteer at the Local Food Bank",
    "description": "Assist in sorting and distributing food to families in need. Help us combat hunger in our community and make a direct impact.",
    "date": "July 15, 2025",
    "spotsFilled": 5,
    "spotsTotal": 10,
    "companyId": "community-helpers",
    "createdAt": new Date(),
    "approved": true
  },
  {
    "id": 2,
    "category": "education",
    "priority": "Medium Priority",
    "title": "Tutor Elementary Students",
    "description": "Provide academic support to young learners in math and reading. Make a positive impact on their educational journey.",
    "date": "August 20, 2025",
    "spotsFilled": 3,
    "spotsTotal": 8,
    "companyId": "education-first",
    "createdAt": new Date(),
    "approved": true
  },
  {
    "id": 3,
    "category": "environment",
    "priority": "Medium Priority",
    "title": "Campus Green Cleanup",
    "description": "Join us for a campus cleanup day to beautify our surroundings. Help maintain a healthy environment for everyone.",
    "date": "September 5, 2025",
    "spotsFilled": 7,
    "spotsTotal": 15,
    "companyId": "green-earth",
    "createdAt": new Date(),
    "approved": true
  },
  {
    "id": 4,
    "category": "health",
    "priority": "High Priority",
    "title": "University Health Fair",
    "description": "Support health professionals at our annual health fair. Help promote wellness and provide information to attendees.",
    "date": "October 12, 2025",
    "spotsFilled": 20,
    "spotsTotal": 25,
    "companyId": "health-matters",
    "createdAt": new Date(),
    "approved": true
  },
  {
    "id": 5,
    "category": "fundraising",
    "priority": "Medium Priority",
    "title": "Organize a Charity Run",
    "description": "Help plan and execute a charity run to raise funds for a local cause. Contribute to a successful fundraising event.",
    "date": "November 18, 2025",
    "spotsFilled": 12,
    "spotsTotal": 20,
    "companyId": "community-helpers",
    "createdAt": new Date(),
    "approved": true
  },
  {
    "id": 6,
    "category": "environment",
    "priority": "High Priority",
    "title": "Environmental Conservation Project",
    "description": "Participate in a project focused on environmental conservation. Help protect and preserve our natural resources.",
    "date": "December 1, 2025",
    "spotsFilled": 8,
    "spotsTotal": 12,
    "companyId": "green-earth",
    "createdAt": new Date(),
    "approved": true
  },
  {
    "id": 7,
    "category": "community",
    "priority": "Medium Priority",
    "title": "Senior Center Activities",
    "description": "Engage with seniors through games, reading, and conversation. Bring joy and companionship to elderly community members.",
    "date": "January 10, 2026",
    "spotsFilled": 4,
    "spotsTotal": 12,
    "companyId": "community-helpers",
    "createdAt": new Date(),
    "approved": true
  },
  {
    "id": 8,
    "category": "education",
    "priority": "High Priority",
    "title": "Digital Literacy Workshop",
    "description": "Teach basic computer skills to adults in the community. Help bridge the digital divide and empower learners.",
    "date": "February 14, 2026",
    "spotsFilled": 6,
    "spotsTotal": 10,
    "companyId": "education-first",
    "createdAt": new Date(),
    "approved": true
  }
];

// Sample companies data
const companiesData = [
  {
    "_id": "community-helpers",
    "name": "Community Helpers Inc.",
    "email": "contact@communityhelpers.org",
    "password": "", // Will be hashed
    "description": "Dedicated to strengthening communities through volunteer opportunities and social impact initiatives.",
    "website": "https://communityhelpers.org",
    "phone": "555-123-4567",
    "opportunities": [],
    "createdAt": new Date(),
    "approved": true
  },
  {
    "_id": "education-first",
    "name": "Education First Foundation",
    "email": "info@educationfirst.org",
    "password": "", // Will be hashed
    "description": "Promoting educational excellence and literacy in underserved communities.",
    "website": "https://educationfirst.org",
    "phone": "555-234-5678",
    "opportunities": [],
    "createdAt": new Date(),
    "approved": true
  },
  {
    "_id": "green-earth",
    "name": "Green Earth Initiative",
    "email": "hello@greenearth.org",
    "password": "", // Will be hashed
    "description": "Environmental conservation and sustainability through community action and education.",
    "website": "https://greenearth.org",
    "phone": "555-345-6789",
    "opportunities": [],
    "createdAt": new Date(),
    "approved": true
  },
  {
    "_id": "health-matters",
    "name": "Health Matters Collective",
    "email": "support@healthmatters.org",
    "password": "", // Will be hashed
    "description": "Promoting community health and wellness through education and preventive care initiatives.",
    "website": "https://healthmatters.org",
    "phone": "555-456-7890",
    "opportunities": [],
    "createdAt": new Date(),
    "approved": true
  }
];

// Sample users data
const usersData = [
  {
    "name": "John Smith",
    "email": "john.smith@email.com",
    "password": "", // Will be hashed
    "commitments": [],
    "createdAt": new Date()
  },
  {
    "name": "Sarah Johnson",
    "email": "sarah.johnson@email.com",
    "password": "", // Will be hashed
    "commitments": [],
    "createdAt": new Date()
  },
  {
    "name": "Mike Davis",
    "email": "mike.davis@email.com",
    "password": "", // Will be hashed
    "commitments": [],
    "createdAt": new Date()
  },
  {
    "name": "Emily Wilson",
    "email": "emily.wilson@email.com",
    "password": "", // Will be hashed
    "commitments": [],
    "createdAt": new Date()
  },
  {
    "name": "David Brown",
    "email": "david.brown@email.com",
    "password": "", // Will be hashed
    "commitments": [],
    "createdAt": new Date()
  }
];

// Admin user data
const adminData = {
  "username": "admin",
  "password": "", // Will be hashed
  "role": "admin",
  "createdAt": new Date()
};

async function seedAllData() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('mainStreetOpportunities');
    
    // Hash password for all accounts (using 'test' as password)
    const hashedPassword = await bcrypt.hash('test', 10);
    
    // Update passwords in data
    companiesData.forEach(company => company.password = hashedPassword);
    usersData.forEach(user => user.password = hashedPassword);
    adminData.password = hashedPassword;

    // Clear existing data
    console.log('Clearing existing data...');
    await db.collection('opportunities').deleteMany({});
    await db.collection('companies').deleteMany({});
    await db.collection('users').deleteMany({});
    await db.collection('admins').deleteMany({});

    // Seed opportunities
    console.log('Seeding opportunities...');
    const opportunitiesResult = await db.collection('opportunities').insertMany(opportunitiesData);
    console.log(`${opportunitiesResult.insertedCount} opportunities inserted`);

    // Seed companies
    console.log('Seeding companies...');
    const companiesResult = await db.collection('companies').insertMany(companiesData);
    console.log(`${companiesResult.insertedCount} companies inserted`);

    // Seed users
    console.log('Seeding users...');
    const usersResult = await db.collection('users').insertMany(usersData);
    console.log(`${usersResult.insertedCount} users inserted`);

    // Seed admin
    console.log('Seeding admin...');
    const adminResult = await db.collection('admins').insertOne(adminData);
    console.log(`Admin user created with ID: ${adminResult.insertedId}`);

    console.log('\n=== SEEDING COMPLETE ===');
    console.log('\nLogin Credentials (all passwords are "test"):');
    console.log('\nAdmin:');
    console.log('  Username: admin');
    console.log('  Password: test');
    console.log('\nCompanies:');
    companiesData.forEach(company => {
      console.log(`  ${company.name}: ${company.email}`);
    });
    console.log('\nUsers:');
    usersData.forEach(user => {
      console.log(`  ${user.name}: ${user.email}`);
    });
    console.log('\nAll passwords: test');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
    console.log('\nDatabase connection closed');
  }
}

// Execute the seeding function
seedAllData();