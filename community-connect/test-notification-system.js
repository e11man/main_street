/**
 * Test Script for Chat Notification System
 * 
 * This script tests the complete chat notification system including:
 * - User and organization notification preferences
 * - Immediate, 5-minute, and 30-minute notification frequencies
 * - Email sending functionality
 * - Database operations
 */

const axios = require('axios');
const { ObjectId } = require('mongodb');
const clientPromise = require('./lib/mongodb');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';

// Test data
const testData = {
  users: [
    {
      name: 'Test User 1',
      email: 'user1@test.com',
      password: 'testpass123',
      chatNotificationFrequency: 'immediate'
    },
    {
      name: 'Test User 2', 
      email: 'user2@test.com',
      password: 'testpass123',
      chatNotificationFrequency: '5min'
    },
    {
      name: 'Test User 3',
      email: 'user3@test.com', 
      password: 'testpass123',
      chatNotificationFrequency: '30min'
    },
    {
      name: 'Test User 4',
      email: 'user4@test.com',
      password: 'testpass123', 
      chatNotificationFrequency: 'never'
    }
  ],
  organizations: [
    {
      name: 'Test Organization 1',
      email: 'org1@test.com',
      password: 'testpass123',
      chatNotificationFrequency: 'immediate'
    },
    {
      name: 'Test Organization 2',
      email: 'org2@test.com', 
      password: 'testpass123',
      chatNotificationFrequency: '5min'
    },
    {
      name: 'Test Organization 3',
      email: 'org3@test.com',
      password: 'testpass123',
      chatNotificationFrequency: '30min'
    },
    {
      name: 'Test Organization 4',
      email: 'org4@test.com',
      password: 'testpass123',
      chatNotificationFrequency: 'never'
    }
  ]
};

class NotificationSystemTester {
  constructor() {
    this.testResults = [];
    this.client = null;
    this.db = null;
  }

  async initialize() {
    console.log('🔧 Initializing test environment...');
    
    try {
      this.client = await clientPromise;
      this.db = this.client.db('mainStreetOpportunities');
      console.log('✅ Database connection established');
    } catch (error) {
      console.error('❌ Failed to connect to database:', error);
      throw error;
    }
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async testStep(stepName, testFunction) {
    this.log(`Testing: ${stepName}`);
    try {
      const result = await testFunction();
      this.testResults.push({ step: stepName, success: true, result });
      this.log(`✅ ${stepName} - PASSED`, 'success');
      return result;
    } catch (error) {
      this.testResults.push({ step: stepName, success: false, error: error.message });
      this.log(`❌ ${stepName} - FAILED: ${error.message}`, 'error');
      throw error;
    }
  }

  async createTestUsers() {
    const usersCollection = this.db.collection('users');
    const createdUsers = [];

    for (const userData of testData.users) {
      // Check if user already exists
      const existingUser = await usersCollection.findOne({ email: userData.email });
      if (existingUser) {
        createdUsers.push(existingUser);
        continue;
      }

      // Create new user
      const newUser = {
        name: userData.name,
        email: userData.email,
        password: userData.password, // In real app, this would be hashed
        approved: true,
        chatNotificationFrequency: userData.chatNotificationFrequency,
        commitments: [],
        createdAt: new Date()
      };

      const result = await usersCollection.insertOne(newUser);
      newUser._id = result.insertedId;
      createdUsers.push(newUser);
    }

    return createdUsers;
  }

  async createTestOrganizations() {
    const companiesCollection = this.db.collection('companies');
    const createdOrgs = [];

    for (const orgData of testData.organizations) {
      // Check if organization already exists
      const existingOrg = await companiesCollection.findOne({ email: orgData.email });
      if (existingOrg) {
        createdOrgs.push(existingOrg);
        continue;
      }

      // Create new organization
      const newOrg = {
        name: orgData.name,
        email: orgData.email,
        password: orgData.password, // In real app, this would be hashed
        approved: true,
        chatNotificationFrequency: orgData.chatNotificationFrequency,
        createdAt: new Date()
      };

      const result = await companiesCollection.insertOne(newOrg);
      newOrg._id = result.insertedId;
      createdOrgs.push(newOrg);
    }

    return createdOrgs;
  }

  async createTestOpportunity(organizationId) {
    const opportunitiesCollection = this.db.collection('opportunities');
    
    const opportunity = {
      title: 'Test Opportunity for Notifications',
      description: 'This is a test opportunity to verify notification functionality',
      category: 'Test',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      arrivalTime: '09:00',
      departureTime: '17:00',
      location: 'Test Location',
      organizationId: organizationId,
      totalSpots: 10,
      spotsFilled: 0,
      createdAt: new Date()
    };

    const result = await opportunitiesCollection.insertOne(opportunity);
    opportunity._id = result.insertedId;
    return opportunity;
  }

  async addUserCommitments(users, opportunity) {
    const usersCollection = this.db.collection('users');
    
    for (const user of users) {
      await usersCollection.updateOne(
        { _id: user._id },
        { $push: { commitments: opportunity._id } }
      );
    }
  }

  async createTestChatMessages(opportunityId, senderId, senderType, messageCount = 1) {
    const chatMessagesCollection = this.db.collection('chatMessages');
    const messages = [];

    for (let i = 0; i < messageCount; i++) {
      const message = {
        opportunityId: opportunityId,
        senderId: senderId,
        senderType: senderType,
        message: `Test message ${i + 1} from ${senderType}`,
        timestamp: new Date(),
        createdAt: new Date()
      };

      const result = await chatMessagesCollection.insertOne(message);
      message._id = result.insertedId;
      messages.push(message);
    }

    return messages;
  }

  async testNotificationPreferences() {
    this.log('Testing notification preference storage and retrieval...');

    // Test user notification preferences
    const usersCollection = this.db.collection('users');
    const testUser = await usersCollection.findOne({ email: 'user1@test.com' });
    
    if (!testUser || testUser.chatNotificationFrequency !== 'immediate') {
      throw new Error('User notification preference not set correctly');
    }

    // Test organization notification preferences
    const companiesCollection = this.db.collection('companies');
    const testOrg = await companiesCollection.findOne({ email: 'org1@test.com' });
    
    if (!testOrg || testOrg.chatNotificationFrequency !== 'immediate') {
      throw new Error('Organization notification preference not set correctly');
    }

    return { users: testUser, organizations: testOrg };
  }

  async testImmediateNotifications() {
    this.log('Testing immediate notifications...');

    const usersCollection = this.db.collection('users');
    const companiesCollection = this.db.collection('companies');
    const emailNotificationsCollection = this.db.collection('emailNotifications');

    // Get immediate notification users and organizations
    const immediateUsers = await usersCollection.find({ 
      chatNotificationFrequency: 'immediate' 
    }).toArray();
    
    const immediateOrgs = await companiesCollection.find({ 
      chatNotificationFrequency: 'immediate' 
    }).toArray();

    if (immediateUsers.length === 0) {
      throw new Error('No users with immediate notifications found');
    }

    if (immediateOrgs.length === 0) {
      throw new Error('No organizations with immediate notifications found');
    }

    return { immediateUsers, immediateOrgs };
  }

  async testBatchedNotifications() {
    this.log('Testing batched notifications (5min and 30min)...');

    const usersCollection = this.db.collection('users');
    const companiesCollection = this.db.collection('companies');

    // Test 5-minute notifications
    const fiveMinUsers = await usersCollection.find({ 
      chatNotificationFrequency: '5min' 
    }).toArray();
    
    const fiveMinOrgs = await companiesCollection.find({ 
      chatNotificationFrequency: '5min' 
    }).toArray();

    // Test 30-minute notifications
    const thirtyMinUsers = await usersCollection.find({ 
      chatNotificationFrequency: '30min' 
    }).toArray();
    
    const thirtyMinOrgs = await companiesCollection.find({ 
      chatNotificationFrequency: '30min' 
    }).toArray();

    return {
      fiveMin: { users: fiveMinUsers, organizations: fiveMinOrgs },
      thirtyMin: { users: thirtyMinUsers, organizations: thirtyMinOrgs }
    };
  }

  async testNeverNotifications() {
    this.log('Testing "never" notification setting...');

    const usersCollection = this.db.collection('users');
    const companiesCollection = this.db.collection('companies');

    const neverUsers = await usersCollection.find({ 
      chatNotificationFrequency: 'never' 
    }).toArray();
    
    const neverOrgs = await companiesCollection.find({ 
      chatNotificationFrequency: 'never' 
    }).toArray();

    if (neverUsers.length === 0) {
      throw new Error('No users with "never" notifications found');
    }

    if (neverOrgs.length === 0) {
      throw new Error('No organizations with "never" notifications found');
    }

    return { neverUsers, neverOrgs };
  }

  async testEmailNotificationSystem() {
    this.log('Testing email notification system...');

    // Test the notification processing endpoint
    try {
      const response = await axios.post(`${BASE_URL}/api/admin/process-notifications`);
      
      if (response.status !== 200) {
        throw new Error(`Notification processing failed with status ${response.status}`);
      }

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`API call failed: ${error.response.status} - ${error.response.data.error}`);
      }
      throw error;
    }
  }

  async testNotificationFrequencyUpdate() {
    this.log('Testing notification frequency updates...');

    const usersCollection = this.db.collection('users');
    const companiesCollection = this.db.collection('companies');

    // Test updating user notification frequency
    const testUser = await usersCollection.findOne({ email: 'user1@test.com' });
    await usersCollection.updateOne(
      { _id: testUser._id },
      { $set: { chatNotificationFrequency: '5min' } }
    );

    const updatedUser = await usersCollection.findOne({ _id: testUser._id });
    if (updatedUser.chatNotificationFrequency !== '5min') {
      throw new Error('User notification frequency update failed');
    }

    // Test updating organization notification frequency
    const testOrg = await companiesCollection.findOne({ email: 'org1@test.com' });
    await companiesCollection.updateOne(
      { _id: testOrg._id },
      { $set: { chatNotificationFrequency: '30min' } }
    );

    const updatedOrg = await companiesCollection.findOne({ _id: testOrg._id });
    if (updatedOrg.chatNotificationFrequency !== '30min') {
      throw new Error('Organization notification frequency update failed');
    }

    return { updatedUser, updatedOrg };
  }

  async cleanup() {
    this.log('Cleaning up test data...');

    const usersCollection = this.db.collection('users');
    const companiesCollection = this.db.collection('companies');
    const opportunitiesCollection = this.db.collection('opportunities');
    const chatMessagesCollection = this.db.collection('chatMessages');
    const emailNotificationsCollection = this.db.collection('emailNotifications');

    // Clean up test users
    for (const userData of testData.users) {
      await usersCollection.deleteOne({ email: userData.email });
    }

    // Clean up test organizations
    for (const orgData of testData.organizations) {
      await companiesCollection.deleteOne({ email: orgData.email });
    }

    // Clean up test opportunities
    await opportunitiesCollection.deleteMany({ 
      title: 'Test Opportunity for Notifications' 
    });

    // Clean up test chat messages
    await chatMessagesCollection.deleteMany({ 
      message: { $regex: /^Test message/ } 
    });

    // Clean up test email notifications
    await emailNotificationsCollection.deleteMany({
      recipientEmail: { 
        $in: [
          ...testData.users.map(u => u.email),
          ...testData.organizations.map(o => o.email)
        ]
      }
    });

    this.log('✅ Cleanup completed');
  }

  async runAllTests() {
    console.log('🚀 Starting Chat Notification System Tests\n');

    try {
      await this.initialize();

      // Create test data
      await this.testStep('Create Test Users', () => this.createTestUsers());
      await this.testStep('Create Test Organizations', () => this.createTestOrganizations());
      
      const testOrgs = await this.testStep('Get Test Organizations', async () => {
        const companiesCollection = this.db.collection('companies');
        return await companiesCollection.find({ 
          email: { $in: testData.organizations.map(o => o.email) } 
        }).toArray();
      });

      const testUsers = await this.testStep('Get Test Users', async () => {
        const usersCollection = this.db.collection('users');
        return await usersCollection.find({ 
          email: { $in: testData.users.map(u => u.email) } 
        }).toArray();
      });

      // Create test opportunity
      const opportunity = await this.testStep('Create Test Opportunity', () => 
        this.createTestOpportunity(testOrgs[0]._id)
      );

      // Add user commitments
      await this.testStep('Add User Commitments', () => 
        this.addUserCommitments(testUsers, opportunity)
      );

      // Create test chat messages
      await this.testStep('Create Test Chat Messages', () => 
        this.createTestChatMessages(opportunity._id, testUsers[0]._id, 'user', 3)
      );

      // Test notification preferences
      await this.testStep('Test Notification Preferences', () => 
        this.testNotificationPreferences()
      );

      // Test immediate notifications
      await this.testStep('Test Immediate Notifications', () => 
        this.testImmediateNotifications()
      );

      // Test batched notifications
      await this.testStep('Test Batched Notifications', () => 
        this.testBatchedNotifications()
      );

      // Test never notifications
      await this.testStep('Test Never Notifications', () => 
        this.testNeverNotifications()
      );

      // Test notification frequency updates
      await this.testStep('Test Notification Frequency Updates', () => 
        this.testNotificationFrequencyUpdate()
      );

      // Test email notification system
      await this.testStep('Test Email Notification System', () => 
        this.testEmailNotificationSystem()
      );

      // Print summary
      console.log('\n📊 Test Results Summary:');
      console.log('========================');
      
      const passed = this.testResults.filter(r => r.success).length;
      const failed = this.testResults.filter(r => !r.success).length;
      
      console.log(`✅ Passed: ${passed}`);
      console.log(`❌ Failed: ${failed}`);
      console.log(`📈 Success Rate: ${((passed / this.testResults.length) * 100).toFixed(1)}%`);

      if (failed > 0) {
        console.log('\n❌ Failed Tests:');
        this.testResults.filter(r => !r.success).forEach(result => {
          console.log(`  - ${result.step}: ${result.error}`);
        });
      }

      console.log('\n🎉 All tests completed!');

    } catch (error) {
      console.error('\n💥 Test suite failed:', error);
      throw error;
    } finally {
      // Cleanup
      await this.cleanup();
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new NotificationSystemTester();
  
  tester.runAllTests()
    .then(() => {
      console.log('\n✅ Test suite completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = NotificationSystemTester;