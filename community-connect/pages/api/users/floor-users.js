import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId, dorm, search } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const usersCollection = db.collection('users');

    // Get the requesting user to verify they are PA
    const requestingUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!requestingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!requestingUser.isPA && !requestingUser.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Only PAs and admins can access this endpoint' });
    }

    // Build query for users
    let query = {};
    
    if (dorm) {
      // If specific dorm is requested, filter by that dorm
      query.dorm = dorm;
    } else if (requestingUser.dorm) {
      // Otherwise, default to PA's own dorm/floor
      query.dorm = requestingUser.dorm;
    }

    // Add search functionality
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex }
      ];
    }

    // Get users from the same floor/dorm (excluding the requesting user)
    const floorUsers = await usersCollection.find({
      ...query,
      _id: { $ne: new ObjectId(userId) } // Exclude the requesting user
    }).toArray();

    // Remove sensitive data and return user info
    const safeUsers = floorUsers.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      dorm: user.dorm,
      role: user.role || 'user',
      isPA: user.isPA || false,
      commitments: user.commitments || []
    }));

    return res.status(200).json(safeUsers);

  } catch (error) {
    console.error('Error fetching floor users:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}