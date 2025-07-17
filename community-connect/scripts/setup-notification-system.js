/**
 * Setup Script for Chat Notification System
 * 
 * This script helps set up and verify the notification system configuration.
 * It checks environment variables, database connections, and creates necessary collections.
 * 
 * Usage: node scripts/setup-notification-system.js
 */

import clientPromise from '../lib/mongodb.js';
import { ObjectId } from 'mongodb';

async function checkEnvironmentVariables() {
  console.log('=== Checking Environment Variables ===');
  
  const requiredVars = [
    'EMAIL_USER',
    'EMAIL_PASS',
    'MONGODB_URI'
  ];
  
  const optionalVars = [
    'ADMIN_NOTIFICATION_KEY'
  ];
  
  let allGood = true;
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      console.error(`❌ Missing required environment variable: ${varName}`);
      allGood = false;
    } else {
      console.log(`✅ ${varName}: ${process.env[varName].substring(0, 10)}...`);
    }
  }
  
  for (const varName of optionalVars) {
    if (!process.env[varName]) {
      console.log(`⚠️  Missing optional environment variable: ${varName} (will use default)`);
    } else {
      console.log(`✅ ${varName}: ${process.env[varName].substring(0, 10)}...`);
    }
  }
  
  if (!allGood) {
    console.error('\n❌ Please set all required environment variables in your .env.local file');
    return false;
  }
  
  console.log('\n✅ All environment variables are properly configured');
  return true;
}

async function checkDatabaseConnection() {
  console.log('\n=== Checking Database Connection ===');
  
  try {
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    
    // Test the connection
    await db.command({ ping: 1 });
    console.log('✅ MongoDB connection successful');
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    return null;
  }
}

async function checkCollections(db) {
  console.log('\n=== Checking Database Collections ===');
  
  const requiredCollections = [
    'companies',
    'users',
    'opportunities',
    'chatMessages',
    'emailNotifications'
  ];
  
  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map(col => col.name);
  
  for (const collectionName of requiredCollections) {
    if (collectionNames.includes(collectionName)) {
      console.log(`✅ Collection exists: ${collectionName}`);
    } else {
      console.log(`⚠️  Collection missing: ${collectionName} (will be created automatically)`);
    }
  }
}

async function updateExistingOrganizations(db) {
  console.log('\n=== Updating Existing Organizations ===');
  
  const companiesCollection = db.collection('companies');
  
  // Find organizations without notification frequency
  const organizationsWithoutFrequency = await companiesCollection.find({
    chatNotificationFrequency: { $exists: false }
  }).toArray();
  
  if (organizationsWithoutFrequency.length === 0) {
    console.log('✅ All organizations already have notification frequency set');
    return;
  }
  
  console.log(`Found ${organizationsWithoutFrequency.length} organizations without notification frequency`);
  
  // Update them to use 'immediate' as default
  const result = await companiesCollection.updateMany(
    { chatNotificationFrequency: { $exists: false } },
    { $set: { chatNotificationFrequency: 'immediate' } }
  );
  
  console.log(`✅ Updated ${result.modifiedCount} organizations with default notification frequency`);
}

async function createIndexes(db) {
  console.log('\n=== Creating Database Indexes ===');
  
  try {
    // Create indexes for better performance
    const emailNotificationsCollection = db.collection('emailNotifications');
    
    await emailNotificationsCollection.createIndex(
      { opportunityId: 1, recipientEmail: 1, lastSentAt: 1 },
      { name: 'notification_rate_limit' }
    );
    
    await emailNotificationsCollection.createIndex(
      { lastSentAt: 1 },
      { name: 'notification_cleanup' }
    );
    
    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
  }
}

async function testEmailConfiguration() {
  console.log('\n=== Testing Email Configuration ===');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️  Email configuration not available, skipping test');
    return false;
  }
  
  try {
    // Import nodemailer dynamically to avoid issues if not installed
    const nodemailer = await import('nodemailer');
    
    const transporter = nodemailer.default.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    // Test the connection
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Email configuration test failed:', error.message);
    return false;
  }
}

async function generateAdminKey() {
  console.log('\n=== Admin Key Generation ===');
  
  if (!process.env.ADMIN_NOTIFICATION_KEY) {
    const crypto = await import('crypto');
    const adminKey = crypto.randomBytes(32).toString('hex');
    
    console.log('Generated admin key for notification processing:');
    console.log(`ADMIN_NOTIFICATION_KEY=${adminKey}`);
    console.log('\n⚠️  Please add this to your .env.local file');
    console.log('⚠️  Keep this key secure and do not commit it to version control');
  } else {
    console.log('✅ Admin key is already configured');
  }
}

async function showNextSteps() {
  console.log('\n=== Next Steps ===');
  console.log('1. Add the ADMIN_NOTIFICATION_KEY to your .env.local file (if not already done)');
  console.log('2. Set up cron jobs for batched notifications:');
  console.log('   */5 * * * * cd /path/to/community-connect && node scripts/notification-cron.js 5min');
  console.log('   */30 * * * * cd /path/to/community-connect && node scripts/notification-cron.js 30min');
  console.log('3. Test the system: node scripts/test-notification-system.js');
  console.log('4. Monitor logs for any issues');
  console.log('\n✅ Notification system setup complete!');
}

async function main() {
  try {
    console.log('🚀 Setting up Chat Notification System...\n');
    
    // Check environment variables
    const envOk = await checkEnvironmentVariables();
    if (!envOk) {
      process.exit(1);
    }
    
    // Check database connection
    const db = await checkDatabaseConnection();
    if (!db) {
      process.exit(1);
    }
    
    // Check collections
    await checkCollections(db);
    
    // Update existing organizations
    await updateExistingOrganizations(db);
    
    // Create indexes
    await createIndexes(db);
    
    // Test email configuration
    await testEmailConfiguration();
    
    // Generate admin key if needed
    await generateAdminKey();
    
    // Show next steps
    await showNextSteps();
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run the setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as setupNotificationSystem };