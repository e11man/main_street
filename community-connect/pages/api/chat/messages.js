import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const chatCollection = db.collection('chatMessages');

    if (req.method === 'POST') {
      const { opportunityId, senderId, senderType, message } = req.body;

      if (!opportunityId || !senderId || !senderType || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const newMessage = {
        opportunityId: new ObjectId(opportunityId),
        senderId: new ObjectId(senderId),
        senderType, // "user" or "organization"
        message,
        timestamp: new Date(),
      };

      const result = await chatCollection.insertOne(newMessage);
      res.status(201).json(result.ops[0]);
    } else if (req.method === 'GET') {
      const { opportunityId } = req.query;

      if (!opportunityId) {
        return res.status(400).json({ error: 'Missing opportunityId query parameter' });
      }

      const messages = await chatCollection
        .find({ opportunityId: new ObjectId(opportunityId) })
        .sort({ timestamp: 1 }) // Sort by oldest first
        .toArray();

      res.status(200).json(messages);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
