import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, action } = req.body; // action can be 'assign' or 'remove'

    if (!userId || !action || !['assign', 'remove'].includes(action)) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const usersCollection = db.collection('users');

    // Find the user
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user role
    const newRole = action === 'assign' ? 'pa' : 'user';
    
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { role: newRole } }
    );

    return res.status(200).json({
      message: `Successfully ${action === 'assign' ? 'assigned PA role to' : 'removed PA role from'} ${user.name}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: newRole,
        dorm: user.dorm
      }
    });

  } catch (error) {
    console.error('Error managing PA role:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}