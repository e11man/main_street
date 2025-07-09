import { sendChatNotifications } from '../lib/emailUtils';
import clientPromise from '../lib/mongodb';
import { ObjectId } from 'mongodb';

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn()
  }))
}));

// Mock MongoDB client
jest.mock('../lib/mongodb');

describe('Chat Email Notifications', () => {
  let mockClient, mockDb, mockCollections;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup mock MongoDB collections
    mockCollections = {
      opportunities: {
        findOne: jest.fn()
      },
      companies: {
        findOne: jest.fn()
      },
      users: {
        find: jest.fn(() => ({
          toArray: jest.fn()
        }))
      },
      emailNotifications: {
        findOne: jest.fn(),
        updateOne: jest.fn()
      }
    };
    
    mockDb = {
      collection: jest.fn((name) => mockCollections[name])
    };
    
    mockClient = {
      db: jest.fn(() => mockDb)
    };
    
    clientPromise.mockResolvedValue(mockClient);
  });

  describe('sendChatNotifications', () => {
    const mockOpportunityId = new ObjectId().toString();
    const mockSenderEmail = 'sender@example.com';
    const mockSenderName = 'Test Sender';
    const mockMessage = 'This is a test message for the chat notification system.';

    it('should send emails to all participants except sender', async () => {
      // Setup mock data
      const mockOpportunity = {
        _id: new ObjectId(mockOpportunityId),
        title: 'Test Opportunity',
        companyId: new ObjectId().toString(),
        date: new Date(),
        location: 'Test Location'
      };

      const mockCompany = {
        _id: new ObjectId(mockOpportunity.companyId),
        name: 'Test Company',
        email: 'company@example.com'
      };

      const mockUsers = [
        {
          _id: new ObjectId(),
          name: 'User One',
          email: 'user1@example.com',
          commitments: [new ObjectId(mockOpportunityId)]
        },
        {
          _id: new ObjectId(),
          name: 'User Two', 
          email: 'user2@example.com',
          commitments: [new ObjectId(mockOpportunityId)]
        }
      ];

      // Mock database responses
      mockCollections.opportunities.findOne.mockResolvedValue(mockOpportunity);
      mockCollections.companies.findOne.mockResolvedValue(mockCompany);
      mockCollections.users.find().toArray.mockResolvedValue(mockUsers);
      mockCollections.emailNotifications.findOne.mockResolvedValue(null); // No rate limiting
      mockCollections.emailNotifications.updateOne.mockResolvedValue({});

      // Mock successful email sending
      const nodemailer = require('nodemailer');
      const mockTransporter = nodemailer.createTransport();
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      // Execute function
      const result = await sendChatNotifications(
        mockOpportunityId,
        mockSenderEmail,
        mockSenderName,
        mockMessage
      );

      // Verify results
      expect(result.success).toBe(true);
      expect(result.emailsSent).toBe(3); // Company + 2 users
      expect(result.rateLimited).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.participants).toHaveLength(3);

      // Verify database calls
      expect(mockCollections.opportunities.findOne).toHaveBeenCalledWith({
        _id: new ObjectId(mockOpportunityId)
      });
      expect(mockCollections.companies.findOne).toHaveBeenCalledWith({
        _id: new ObjectId(mockOpportunity.companyId)
      });
      expect(mockCollections.users.find).toHaveBeenCalledWith({
        commitments: { $in: [new ObjectId(mockOpportunityId)] }
      });

      // Verify emails were sent
      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(3);
    });

    it('should exclude sender from email notifications', async () => {
      // UPDATED: company sender will now also receive email
      const mockOpportunity = {
        _id: new ObjectId(mockOpportunityId),
        title: 'Test Opportunity',
        companyId: new ObjectId().toString()
      };

      const mockCompany = {
        _id: new ObjectId(mockOpportunity.companyId),
        name: 'Test Company',
        email: mockSenderEmail // Sender is the company
      };

      const mockUsers = [
        {
          _id: new ObjectId(),
          name: 'User One',
          email: 'user1@example.com',
          commitments: [new ObjectId(mockOpportunityId)]
        }
      ];

      mockCollections.opportunities.findOne.mockResolvedValue(mockOpportunity);
      mockCollections.companies.findOne.mockResolvedValue(mockCompany);
      mockCollections.users.find().toArray.mockResolvedValue(mockUsers);
      mockCollections.emailNotifications.findOne.mockResolvedValue(null);
      mockCollections.emailNotifications.updateOne.mockResolvedValue({});

      const nodemailer = require('nodemailer');
      const mockTransporter = nodemailer.createTransport();
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      const result = await sendChatNotifications(
        mockOpportunityId,
        mockSenderEmail,
        mockSenderName,
        mockMessage,
        'organization'
      );

      // Should now send to both the company (sender) and the user
      expect(result.success).toBe(true);
      expect(result.emailsSent).toBe(2);
      expect(result.participants).toHaveLength(2);
      const companyParticipant = result.participants.find(p => p.email === mockSenderEmail);
      expect(companyParticipant).toBeDefined();
    });

    it('should respect rate limiting (30 minutes)', async () => {
      const mockOpportunity = {
        _id: new ObjectId(mockOpportunityId),
        title: 'Test Opportunity',
        companyId: new ObjectId().toString()
      };

      const mockCompany = {
        _id: new ObjectId(mockOpportunity.companyId),
        name: 'Test Company',
        email: 'company@example.com'
      };

      const mockUsers = [
        {
          _id: new ObjectId(),
          name: 'User One',
          email: 'user1@example.com',
          commitments: [new ObjectId(mockOpportunityId)]
        }
      ];

      mockCollections.opportunities.findOne.mockResolvedValue(mockOpportunity);
      mockCollections.companies.findOne.mockResolvedValue(mockCompany);
      mockCollections.users.find().toArray.mockResolvedValue(mockUsers);
      
      // Mock rate limiting - recent notification found
      const recentNotification = {
        opportunityId: new ObjectId(mockOpportunityId),
        recipientEmail: 'company@example.com',
        lastSentAt: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
      };
      
      mockCollections.emailNotifications.findOne
        .mockResolvedValueOnce(recentNotification) // Company is rate limited
        .mockResolvedValueOnce(null); // User is not rate limited
      
      mockCollections.emailNotifications.updateOne.mockResolvedValue({});

      const nodemailer = require('nodemailer');
      const mockTransporter = nodemailer.createTransport();
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      const result = await sendChatNotifications(
        mockOpportunityId,
        mockSenderEmail,
        mockSenderName,
        mockMessage
      );

      // Should send to user but not company (rate limited)
      expect(result.success).toBe(true);
      expect(result.emailsSent).toBe(1);
      expect(result.rateLimited).toBe(1);
      expect(result.failed).toBe(0);
      
      // Check participant statuses
      const companyParticipant = result.participants.find(p => p.email === 'company@example.com');
      const userParticipant = result.participants.find(p => p.email === 'user1@example.com');
      
      expect(companyParticipant.status).toBe('rate_limited');
      expect(userParticipant.status).toBe('sent');
    });

    it('should handle email sending failures gracefully', async () => {
      const mockOpportunity = {
        _id: new ObjectId(mockOpportunityId),
        title: 'Test Opportunity',
        companyId: new ObjectId().toString()
      };

      const mockCompany = {
        _id: new ObjectId(mockOpportunity.companyId),
        name: 'Test Company',
        email: 'company@example.com'
      };

      mockCollections.opportunities.findOne.mockResolvedValue(mockOpportunity);
      mockCollections.companies.findOne.mockResolvedValue(mockCompany);
      mockCollections.users.find().toArray.mockResolvedValue([]);
      mockCollections.emailNotifications.findOne.mockResolvedValue(null);
      mockCollections.emailNotifications.updateOne.mockResolvedValue({});

      // Mock email sending failure
      const nodemailer = require('nodemailer');
      const mockTransporter = nodemailer.createTransport();
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP connection failed'));

      const result = await sendChatNotifications(
        mockOpportunityId,
        mockSenderEmail,
        mockSenderName,
        mockMessage
      );

      expect(result.success).toBe(true);
      expect(result.emailsSent).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.participants[0].status).toBe('failed');
    });

    it('should handle missing opportunity gracefully', async () => {
      mockCollections.opportunities.findOne.mockResolvedValue(null);

      const result = await sendChatNotifications(
        mockOpportunityId,
        mockSenderEmail,
        mockSenderName,
        mockMessage
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Opportunity not found');
    });

    it('should handle no participants gracefully', async () => {
      const mockOpportunity = {
        _id: new ObjectId(mockOpportunityId),
        title: 'Test Opportunity',
        companyId: new ObjectId().toString()
      };

      mockCollections.opportunities.findOne.mockResolvedValue(mockOpportunity);
      mockCollections.companies.findOne.mockResolvedValue(null); // No company
      mockCollections.users.find().toArray.mockResolvedValue([]); // No users

      const result = await sendChatNotifications(
        mockOpportunityId,
        mockSenderEmail,
        mockSenderName,
        mockMessage
      );

      expect(result.success).toBe(true);
      expect(result.emailsSent).toBe(0);
      expect(result.participants).toHaveLength(0);
    });

    it('should truncate long messages in email preview', async () => {
      const longMessage = 'A'.repeat(150); // 150 characters
      
      const mockOpportunity = {
        _id: new ObjectId(mockOpportunityId),
        title: 'Test Opportunity',
        companyId: new ObjectId().toString()
      };

      const mockCompany = {
        _id: new ObjectId(mockOpportunity.companyId),
        name: 'Test Company',
        email: 'company@example.com'
      };

      mockCollections.opportunities.findOne.mockResolvedValue(mockOpportunity);
      mockCollections.companies.findOne.mockResolvedValue(mockCompany);
      mockCollections.users.find().toArray.mockResolvedValue([]);
      mockCollections.emailNotifications.findOne.mockResolvedValue(null);
      mockCollections.emailNotifications.updateOne.mockResolvedValue({});

      const nodemailer = require('nodemailer');
      const mockTransporter = nodemailer.createTransport();
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      await sendChatNotifications(
        mockOpportunityId,
        mockSenderEmail,
        mockSenderName,
        longMessage
      );

      // Check that the email was sent with truncated message
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('A'.repeat(100)) // Should be truncated to 100 chars
        })
      );
    });

    it('should record email notifications sent', async () => {
      const mockOpportunity = {
        _id: new ObjectId(mockOpportunityId),
        title: 'Test Opportunity',
        companyId: new ObjectId().toString()
      };

      const mockCompany = {
        _id: new ObjectId(mockOpportunity.companyId),
        name: 'Test Company',
        email: 'company@example.com'
      };

      mockCollections.opportunities.findOne.mockResolvedValue(mockOpportunity);
      mockCollections.companies.findOne.mockResolvedValue(mockCompany);
      mockCollections.users.find().toArray.mockResolvedValue([]);
      mockCollections.emailNotifications.findOne.mockResolvedValue(null);
      mockCollections.emailNotifications.updateOne.mockResolvedValue({});

      const nodemailer = require('nodemailer');
      const mockTransporter = nodemailer.createTransport();
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      await sendChatNotifications(
        mockOpportunityId,
        mockSenderEmail,
        mockSenderName,
        mockMessage
      );

      // Verify that notification was recorded
      expect(mockCollections.emailNotifications.updateOne).toHaveBeenCalledWith(
        {
          opportunityId: new ObjectId(mockOpportunityId),
          recipientEmail: 'company@example.com'
        },
        {
          $set: {
            lastSentAt: expect.any(Date)
          }
        },
        { upsert: true }
      );
    });

    it('should only notify organization owner when admin sends as host', async () => {
      const mockOpportunity = {
        _id: new ObjectId(mockOpportunityId),
        title: 'Test Opportunity',
        companyId: new ObjectId().toString()
      };

      const mockCompany = {
        _id: new ObjectId(mockOpportunity.companyId),
        name: 'Test Company',
        email: 'company@example.com'
      };

      const mockUsers = [
        {
          _id: new ObjectId(),
          name: 'User One',
          email: 'user1@example.com',
          commitments: [new ObjectId(mockOpportunityId)]
        },
        {
          _id: new ObjectId(),
          name: 'User Two',
          email: 'user2@example.com',
          commitments: [new ObjectId(mockOpportunityId)]
        }
      ];

      mockCollections.opportunities.findOne.mockResolvedValue(mockOpportunity);
      mockCollections.companies.findOne.mockResolvedValue(mockCompany);
      mockCollections.users.find().toArray.mockResolvedValue(mockUsers);
      mockCollections.emailNotifications.findOne.mockResolvedValue(null);
      mockCollections.emailNotifications.updateOne.mockResolvedValue({});

      const nodemailer = require('nodemailer');
      const mockTransporter = nodemailer.createTransport();
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      // Admin sending as host
      const result = await sendChatNotifications(
        mockOpportunityId,
        'admin@example.com', // Admin email
        'Admin User',
        mockMessage,
        'admin_as_host' // Admin sender type
      );

      // Should only send to company, not to users
      expect(result.success).toBe(true);
      expect(result.emailsSent).toBe(1);
      expect(result.participants).toHaveLength(1);
      
      const companyParticipant = result.participants.find(p => p.email === 'company@example.com');
      expect(companyParticipant).toBeDefined();
      expect(companyParticipant.type).toBe('company');
      
      // Verify no emails were sent to users
      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'company@example.com'
        })
      );
    });

    it('should notify all committed users when company sends message', async () => {
      const mockOpportunity = {
        _id: new ObjectId(mockOpportunityId),
        title: 'Test Opportunity',
        companyId: new ObjectId().toString()
      };

      const mockCompany = {
        _id: new ObjectId(mockOpportunity.companyId),
        name: 'Test Company',
        email: 'company@example.com'
      };

      const mockUsers = [
        {
          _id: new ObjectId(),
          name: 'User One',
          email: 'user1@example.com',
          commitments: [new ObjectId(mockOpportunityId)]
        },
        {
          _id: new ObjectId(),
          name: 'User Two',
          email: 'user2@example.com',
          commitments: [new ObjectId(mockOpportunityId)]
        }
      ];

      mockCollections.opportunities.findOne.mockResolvedValue(mockOpportunity);
      mockCollections.companies.findOne.mockResolvedValue(mockCompany);
      mockCollections.users.find().toArray.mockResolvedValue(mockUsers);
      mockCollections.emailNotifications.findOne.mockResolvedValue(null);
      mockCollections.emailNotifications.updateOne.mockResolvedValue({});

      const nodemailer = require('nodemailer');
      const mockTransporter = nodemailer.createTransport();
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      // Company sending message
      const result = await sendChatNotifications(
        mockOpportunityId,
        'company@example.com', // Company email
        'Test Company',
        mockMessage,
        'organization' // Company sender type
      );

      // Should send to all committed users, but not to company (same sender)
      expect(result.success).toBe(true);
      expect(result.emailsSent).toBe(2);
      expect(result.participants).toHaveLength(2);
      
      const userParticipants = result.participants.filter(p => p.type === 'user');
      expect(userParticipants).toHaveLength(2);
      
      // Verify emails were sent to users only
      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(2);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user1@example.com'
        })
      );
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user2@example.com'
        })
      );
    });
  });
});