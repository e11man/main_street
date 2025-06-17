import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const pendingUsersCollection = db.collection('pendingUsers');

    if (req.method === 'GET') {
      // Get all pending users
      const pendingUsers = await pendingUsersCollection.find({}).toArray();
      return res.status(200).json(pendingUsers);
    }

    if (req.method === 'POST' && req.query.approve === 'true') {
      // Approve a pending user
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Find the pending user
      const pendingUser = await pendingUsersCollection.findOne({ _id: new ObjectId(userId) });
      if (!pendingUser) {
        return res.status(404).json({ error: 'Pending user not found' });
      }

      // Move the user to the users collection
      const usersCollection = db.collection('users');
      const { _id, ...userData } = pendingUser;
      
      const result = await usersCollection.insertOne(userData);
      
      // Delete from pending users
      await pendingUsersCollection.deleteOne({ _id: new ObjectId(userId) });

      return res.status(200).json({ message: 'User approved successfully' });
    }

    if (req.method === 'DELETE') {
      // Reject a pending user
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const result = await pendingUsersCollection.deleteOne({ _id: new ObjectId(userId) });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Pending user not found' });
      }

      return res.status(200).json({ message: 'User rejected successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Pending users API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}