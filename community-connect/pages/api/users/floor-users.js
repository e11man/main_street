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
    let query = { _id: { $ne: new ObjectId(userId) } }; // Always exclude the requesting user
    
    // Add search functionality if provided
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex }
      ];
    }

    // If a specific dorm is requested, filter by that dorm only
    if (dorm) {
      query.dorm = dorm;
    }

    // Get all users matching the query
    const allUsers = await usersCollection.find(query).toArray();

    // Sort users: dorm users first (if not searching by specific dorm), then others alphabetically
    let sortedUsers;
    if (!dorm && requestingUser.dorm) {
      // Separate users into dorm users and others
      const dormUsers = allUsers.filter(user => user.dorm === requestingUser.dorm);
      const otherUsers = allUsers.filter(user => user.dorm !== requestingUser.dorm);
      
      // Sort each group alphabetically by name
      dormUsers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      otherUsers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      
      // Combine: dorm users first, then others
      sortedUsers = [...dormUsers, ...otherUsers];
    } else {
      // Just sort alphabetically if searching specific dorm or no dorm info
      sortedUsers = allUsers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    // Remove sensitive data and return user info
    const safeUsers = sortedUsers.map(user => ({
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