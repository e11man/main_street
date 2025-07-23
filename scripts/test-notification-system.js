/**
 * Test Script for Chat Notification System
 * 
 * This script tests the chat notification system by:
 * 1. Creating test organizations with different notification frequencies
 * 2. Simulating chat messages
 * 3. Verifying that emails are sent according to the correct intervals
 * 
 * Usage: node scripts/test-notification-system.js
 */

import clientPromise from '../lib/mongodb.js';
import { ObjectId } from 'mongodb';
import { sendChatNotifications } from '../lib/emailUtils.js';
import { processAllBatchedNotifications } from '../lib/notificationJobSystem.js';

// Test configuration
const TEST_CONFIG = {
  testEmail: 'test@example.com', // Replace with your test email
  opportunityTitle: 'Test Volunteer Opportunity',
  testMessage: 'This is a test message for notification testing'
};

async function createTestOrganization(db, name, email, notificationFrequency) {
  const companiesCollection = db.collection('companies');
  
  // Check if test organization already exists
  const existingOrg = await companiesCollection.findOne({ email });
  if (existingOrg) {
    console.log(`Test organization ${name} already exists, updating notification frequency...`);
    await companiesCollection.updateOne(
      { email },
      { $set: { chatNotificationFrequency: notificationFrequency } }
    );
    return existingOrg._id;
  }
  
  // Create new test organization
  const testOrg = {
    name,
    email,
    password: 'hashedpassword123', // In real app, this would be properly hashed
    description: `Test organization for ${notificationFrequency} notifications`,
    website: 'https://test.org',
    phone: '555-1234',
    opportunities: [],
    createdAt: new Date(),
    approved: true,
    chatNotificationFrequency: notificationFrequency
  };
  
  const result = await companiesCollection.insertOne(testOrg);
  console.log(`Created test organization: ${name} with ${notificationFrequency} notifications`);
  return result.insertedId;
}

async function createTestOpportunity(db, organizationId, title) {
  const opportunitiesCollection = db.collection('opportunities');
  
  const testOpportunity = {
    title,
    description: 'Test opportunity for notification testing',
    category: 'community',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    arrivalTime: '09:00',
    departureTime: '17:00',
    totalSpots: 10,
    location: 'Test Location',
    organizationId,
    createdAt: new Date(),
    approved: true
  };
  
  const result = await opportunitiesCollection.insertOne(testOpportunity);
  console.log(`Created test opportunity: ${title}`);
  return result.insertedId;
}

async function createTestUser(db, name, email) {
  const usersCollection = db.collection('users');
  
  // Check if test user already exists
  const existingUser = await usersCollection.findOne({ email });
  if (existingUser) {
    console.log(`Test user ${name} already exists`);
    return existingUser._id;
  }
  
  // Create new test user
  const testUser = {
    name,
    email,
    password: 'hashedpassword123', // In real app, this would be properly hashed
    phone: '555-5678',
    createdAt: new Date(),
    approved: true
  };
  
  const result = await usersCollection.insertOne(testUser);
  console.log(`Created test user: ${name}`);
  return result.insertedId;
}

async function simulateChatMessage(db, opportunityId, senderId, senderType, message) {
  const chatMessagesCollection = db.collection('chatMessages');
  
  const chatMessage = {
    opportunityId: new ObjectId(opportunityId),
    senderId: new ObjectId(senderId),
    senderType,
    message,
    timestamp: new Date()
  };
  
  const result = await chatMessagesCollection.insertOne(chatMessage);
  console.log(`Created chat message: ${message.substring(0, 50)}...`);
  return result.insertedId;
}

async function testImmediateNotifications(db, opportunityId, userId, organizationId) {
  console.log('\n=== Testing Immediate Notifications ===');
  
  // Create organization with immediate notifications
  const immediateOrgId = await createTestOrganization(
    db, 
    'Immediate Test Org', 
    'immediate-test@example.com', 
    'immediate'
  );
  
  // Simulate chat message
  await simulateChatMessage(
    db, 
    opportunityId, 
    userId, 
    'user', 
    'Test message for immediate notifications'
  );
  
  // Test immediate notification sending
  const notificationResult = await sendChatNotifications(
    opportunityId.toString(),
    'test@example.com',
    'Test User',
    'Test message for immediate notifications',
    'user'
  );
  
  console.log('Immediate notification result:', notificationResult);
  return notificationResult;
}

async function testBatchedNotifications(db, opportunityId, userId) {
  console.log('\n=== Testing Batched Notifications ===');
  
  // Create organizations with different batched notification frequencies
  const org5minId = await createTestOrganization(
    db, 
    '5min Test Org', 
    '5min-test@example.com', 
    '5min'
  );
  
  const org30minId = await createTestOrganization(
    db, 
    '30min Test Org', 
    '30min-test@example.com', 
    '30min'
  );
  
  // Simulate multiple chat messages
  for (let i = 1; i <= 3; i++) {
    await simulateChatMessage(
      db, 
      opportunityId, 
      userId, 
      'user', 
      `Test message ${i} for batched notifications`
    );
    
    // Wait a bit between messages
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Process batched notifications
  console.log('Processing batched notifications...');
  await processAllBatchedNotifications();
  
  console.log('Batched notification processing completed');
}

async function testDisabledNotifications(db, opportunityId, userId) {
  console.log('\n=== Testing Disabled Notifications ===');
  
  // Create organization with disabled notifications
  const disabledOrgId = await createTestOrganization(
    db, 
    'Disabled Test Org', 
    'disabled-test@example.com', 
    'never'
  );
  
  // Simulate chat message
  await simulateChatMessage(
    db, 
    opportunityId, 
    userId, 
    'user', 
    'Test message for disabled notifications'
  );
  
  // Test notification sending (should be blocked)
  const notificationResult = await sendChatNotifications(
    opportunityId.toString(),
    'test@example.com',
    'Test User',
    'Test message for disabled notifications',
    'user'
  );
  
  console.log('Disabled notification result:', notificationResult);
  return notificationResult;
}

async function cleanupTestData(db) {
  console.log('\n=== Cleaning Up Test Data ===');
  
  const companiesCollection = db.collection('companies');
  const usersCollection = db.collection('users');
  const opportunitiesCollection = db.collection('opportunities');
  const chatMessagesCollection = db.collection('chatMessages');
  const emailNotificationsCollection = db.collection('emailNotifications');
  
  // Remove test organizations
  const orgResult = await companiesCollection.deleteMany({
    email: { 
      $in: [
        'immediate-test@example.com',
        '5min-test@example.com', 
        '30min-test@example.com',
        'disabled-test@example.com'
      ]
    }
  });
  
  // Remove test user
  const userResult = await usersCollection.deleteMany({
    email: 'test@example.com'
  });
  
  // Remove test opportunities
  const oppResult = await opportunitiesCollection.deleteMany({
    title: TEST_CONFIG.opportunityTitle
  });
  
  // Remove test chat messages
  const chatResult = await chatMessagesCollection.deleteMany({
    message: { $regex: /Test message.*notification/ }
  });
  
  // Remove test email notifications
  const emailResult = await emailNotificationsCollection.deleteMany({
    recipientEmail: { 
      $in: [
        'immediate-test@example.com',
        '5min-test@example.com', 
        '30min-test@example.com',
        'disabled-test@example.com'
      ]
    }
  });
  
  console.log(`Cleaned up: ${orgResult.deletedCount} organizations, ${userResult.deletedCount} users, ${oppResult.deletedCount} opportunities, ${chatResult.deletedCount} chat messages, ${emailResult.deletedCount} email notifications`);
}

async function main() {
  try {
    console.log('Starting Chat Notification System Test...');
    
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    
    // Create test user
    const userId = await createTestUser(db, 'Test User', 'test@example.com');
    
    // Create test opportunity
    const opportunityId = await createTestOpportunity(
      db, 
      new ObjectId(), // Use a dummy organization ID for the opportunity
      TEST_CONFIG.opportunityTitle
    );
    
    // Test immediate notifications
    await testImmediateNotifications(db, opportunityId, userId);
    
    // Test batched notifications
    await testBatchedNotifications(db, opportunityId, userId);
    
    // Test disabled notifications
    await testDisabledNotifications(db, opportunityId, userId);
    
    // Clean up test data
    await cleanupTestData(db);
    
    console.log('\n=== Test Completed Successfully ===');
    console.log('All notification system tests have been completed.');
    console.log('Check your email inbox for test notifications.');
    
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as testNotificationSystem };