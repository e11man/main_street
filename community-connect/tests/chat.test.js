import handler from '../pages/api/chat/messages';
import clientPromise from '../lib/mongodb';
import { ObjectId } from 'mongodb';

// Mock the MongoDB client
jest.mock('../lib/mongodb');

describe('/api/chat/messages API Endpoint', () => {
  let client;
  let db;
  let collection;

  beforeAll(async () => {
    client = {
      db: jest.fn(() => db),
    };
    db = {
      collection: jest.fn(() => collection),
    };
    collection = {
      insertOne: jest.fn(),
      find: jest.fn(() => ({
        sort: jest.fn(() => ({
          toArray: jest.fn(),
        })),
      })),
    };
    clientPromise.mockResolvedValue(client);
  });

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('POST /api/chat/messages', () => {
    it('should create a new message and return 201', async () => {
      const mockOpportunityId = new ObjectId();
      const mockSenderId = new ObjectId();
      const mockMessage = {
        _id: new ObjectId(),
        opportunityId: mockOpportunityId,
        senderId: mockSenderId,
        senderType: 'user',
        message: 'Hello world',
        timestamp: new Date(),
      };
      // To return the full document, mock findOne after insertOne
      collection.insertOne.mockResolvedValueOnce({ insertedId: mockMessage._id });
      collection.findOne.mockResolvedValueOnce(mockMessage);

      const req = {
        method: 'POST',
        body: {
          opportunityId: mockOpportunityId.toString(),
          senderId: mockSenderId.toString(), // User's actual ID
          senderType: 'user',
          message: 'Hello world',
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
        setHeader: jest.fn(),
        end: jest.fn(),
      };

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockMessage);
      expect(collection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          opportunityId: mockOpportunityId,
          senderId: mockSenderId,
          senderType: 'user',
          message: 'Hello world',
        })
      );
    });

    it('should return 400 if opportunityId is missing for POST', async () => {
      const req = {
        method: 'POST',
        body: {
          senderId: new ObjectId().toString(),
          senderType: 'user',
          message: 'No opp id'
        },
      };
      const res = { status: jest.fn(() => res), json: jest.fn() };
      await handler(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing required fields: opportunityId, senderType, message' });
    });

    it('should return 400 if senderId is missing for senderType user/organization', async () => {
      const req = {
        method: 'POST',
        body: {
          opportunityId: new ObjectId().toString(),
          senderType: 'user',
          message: 'No sender id'
        },
      };
      const res = { status: jest.fn(() => res), json: jest.fn() };
      await handler(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing senderId for user or organization' });
    });

    it('should create a message for admin_as_host if actualSenderId is provided', async () => {
      const mockOpportunityId = new ObjectId();
      const mockCompanyId = new ObjectId(); // This will be the senderId in the message
      const mockAdminId = new ObjectId(); // This is the actualSenderId
      const mockChatMessage = {
        _id: new ObjectId(),
        opportunityId: mockOpportunityId,
        senderId: mockCompanyId, // Message appears from company
        senderType: 'admin_as_host',
        message: 'Admin says hello as host',
        timestamp: new Date(),
      };

      collection.insertOne.mockResolvedValueOnce({ insertedId: mockChatMessage._id });
      collection.findOne.mockResolvedValueOnce(mockChatMessage);

      const req = {
        method: 'POST',
        body: {
          opportunityId: mockOpportunityId.toString(),
          senderId: mockCompanyId.toString(), // Company ID
          senderType: 'admin_as_host',
          message: 'Admin says hello as host',
          actualSenderId: mockAdminId.toString(), // Admin's own ID
        },
      };
      const res = { status: jest.fn(() => res), json: jest.fn() };
      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockChatMessage);
      expect(collection.insertOne).toHaveBeenCalledWith(expect.objectContaining({
        senderId: mockCompanyId,
        senderType: 'admin_as_host',
      }));
    });

    it('should return 400 if actualSenderId is missing for senderType admin_as_host', async () => {
      const req = {
        method: 'POST',
        body: {
          opportunityId: new ObjectId().toString(),
          senderId: new ObjectId().toString(), // Company ID
          senderType: 'admin_as_host',
          message: 'No actual sender id',
          // actualSenderId is missing
        },
      };
      const res = { status: jest.fn(() => res), json: jest.fn() };
      await handler(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing actualSenderId for admin_as_host type' });
    });
  });

  describe('GET /api/chat/messages', () => {
    it('should return messages for an opportunityId and status 200', async () => {
      const mockOpportunityId = new ObjectId();
      const mockMessages = [
        { _id: new ObjectId(), opportunityId: mockOpportunityId, message: 'Hi', timestamp: new Date() },
        { _id: new ObjectId(), opportunityId: mockOpportunityId, message: 'There', timestamp: new Date() },
      ];

      // Ensure the mock setup for find, sort, and toArray is correct
      const toArrayMock = jest.fn().mockResolvedValueOnce(mockMessages);
      const sortMock = jest.fn(() => ({ toArray: toArrayMock }));
      collection.find = jest.fn(() => ({ sort: sortMock }));


      const req = {
        method: 'GET',
        query: { opportunityId: mockOpportunityId.toString() },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockMessages);
      expect(collection.find).toHaveBeenCalledWith({ opportunityId: mockOpportunityId });
      expect(sortMock).toHaveBeenCalledWith({ timestamp: 1 });
      expect(toArrayMock).toHaveBeenCalled();
    });

    it('should return 400 if opportunityId is missing', async () => {
      const req = {
        method: 'GET',
        query: {}, // Missing opportunityId
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing opportunityId query parameter' });
    });
  });

  describe('Unsupported HTTP methods', () => {
    it('should return 405 for PUT request', async () => {
      const req = { method: 'PUT' };
      const res = {
        status: jest.fn(() => res),
        setHeader: jest.fn(),
        end: jest.fn(),
      };
      await handler(req, res);
      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.setHeader).toHaveBeenCalledWith('Allow', ['GET', 'POST']);
      expect(res.end).toHaveBeenCalledWith('Method PUT Not Allowed');
    });
  });

  describe('Error Handling', () => {
    it('should return 500 if database operation fails for POST', async () => {
      collection.insertOne.mockRejectedValueOnce(new Error('DB error'));
      const req = {
        method: 'POST',
        body: {
          opportunityId: new ObjectId().toString(),
          senderId: new ObjectId().toString(),
          senderType: 'user',
          message: 'Test message',
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };
      await handler(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    it('should return 500 if database operation fails for GET', async () => {
      collection.find = jest.fn(() => ({
        sort: jest.fn(() => ({
          toArray: jest.fn().mockRejectedValueOnce(new Error('DB error')),
        })),
      }));
      const req = {
        method: 'GET',
        query: { opportunityId: new ObjectId().toString() },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };
      await handler(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
});
