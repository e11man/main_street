import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const usersCollection = db.collection('users');

    if (req.method === 'DELETE') {
      // Delete user
      const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({ message: 'User deleted successfully' });
    }

    if (req.method === 'PUT') {
      // Update specific user
      const { name, email, commitments, dorm } = req.body;

      if (!name || !email) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const updateData = {
        name,
        email,
        dorm: dorm || '',
        commitments: commitments || []
      };

      const result = await usersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const updatedUser = await usersCollection.findOne({ _id: new ObjectId(id) });
      const { password: _, ...userWithoutPassword } = updatedUser;
      return res.status(200).json(userWithoutPassword);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Admin user API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}