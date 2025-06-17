import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const blockedEmailsCollection = db.collection('blockedEmails');

    if (req.method === 'GET') {
      // Get all blocked emails
      const blockedEmails = await blockedEmailsCollection.find({}).toArray();
      return res.status(200).json(blockedEmails);
    }

    if (req.method === 'POST') {
      // Add a new blocked email
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Check if email is already blocked
      const existingBlock = await blockedEmailsCollection.findOne({ email });
      if (existingBlock) {
        return res.status(409).json({ error: 'Email is already blocked' });
      }

      // Create new blocked email entry
      const newBlockedEmail = {
        email,
        createdAt: new Date()
      };

      const result = await blockedEmailsCollection.insertOne(newBlockedEmail);
      return res.status(201).json({ ...newBlockedEmail, _id: result.insertedId });
    }

    if (req.method === 'DELETE') {
      // Remove a blocked email
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID is required' });
      }

      const result = await blockedEmailsCollection.deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Blocked email not found' });
      }

      return res.status(200).json({ message: 'Blocked email removed successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Blocked emails API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}