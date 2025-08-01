import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { hash } from 'bcryptjs';
import { protectRoute } from '../../../lib/authUtils'; // Import protectRoute

async function usersHandler(req, res) { // Renamed original handler
  try {
    // req.user is available here if protectRoute was successful
    // console.log('Authenticated admin user:', req.user);

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const usersCollection = db.collection('users');

    if (req.method === 'GET') {
      // Get all users
      const users = await usersCollection.find({}).toArray();
      // Remove passwords from response and convert _id to string for frontend compatibility
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return { ...userWithoutPassword, _id: user._id.toString() };
      });
      return res.status(200).json(usersWithoutPasswords);
    }

    if (req.method === 'POST') {
      // Create new user
      const { name, email, password, dorm } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if user already exists
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await hash(password, 10);

      // Create new user
      const newUser = {
        name,
        email,
        password: hashedPassword,
        dorm: dorm || '',
        commitments: [],
        createdAt: new Date()
      };

      const result = await usersCollection.insertOne(newUser);
      const { password: _, ...userWithoutPassword } = newUser;
      return res.status(201).json({ ...userWithoutPassword, _id: result.insertedId.toString() });
    }

    if (req.method === 'PUT') {
      // Update user
      const { _id, name, email, password, commitments, dorm } = req.body;

      if (!_id || !name || !email) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if trying to modify the original admin
      const targetUser = await usersCollection.findOne({ _id: new ObjectId(_id) });
      if (targetUser?.isOriginalAdmin && req.user?.email !== 'admin@admin.com') {
        return res.status(403).json({ error: 'Only the original admin can modify their own account' });
      }

      const updateData = {
        name,
        email,
        dorm: dorm || '',
        commitments: commitments || []
      };

      // If password is provided, hash it and include in update
      if (password) {
        updateData.password = await hash(password, 10);
      }

      await usersCollection.updateOne(
        { _id: new ObjectId(_id) },
        { $set: updateData }
      );

      const updatedUser = await usersCollection.findOne({ _id: new ObjectId(_id) });
      const { password: _, ...userWithoutPassword } = updatedUser;
      return res.status(200).json({ ...userWithoutPassword, _id: userWithoutPassword._id.toString() });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Admin users API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Wrap the handler with protectRoute, requiring 'admin' role
export default protectRoute(usersHandler, ['admin']);