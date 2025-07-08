import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { protectRoute } from '../../../../lib/authUtils';

async function userHandler(req, res) {
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
      // Check if trying to delete the original admin
      const targetUser = await usersCollection.findOne({ _id: new ObjectId(id) });
      if (targetUser?.isOriginalAdmin) {
        return res.status(403).json({ error: 'The original admin account cannot be deleted' });
      }

      // Delete user
      const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({ message: 'User deleted successfully' });
    }

    if (req.method === 'PUT') {
      // Check if trying to modify the original admin
      const targetUser = await usersCollection.findOne({ _id: new ObjectId(id) });
      if (targetUser?.isOriginalAdmin) {
        return res.status(403).json({ error: 'The original admin account cannot be modified through this endpoint. Use admin-specific endpoints only.' });
      }

      // Update specific user
      const { name, email, commitments, dorm, wing } = req.body;

      if (!name || !email) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const updateData = {
        name,
        email,
        dorm: dorm || '',
        wing: wing || '',
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
      return res.status(200).json({ ...userWithoutPassword, _id: userWithoutPassword._id.toString() });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Admin user API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default protectRoute(userHandler, ['admin']);