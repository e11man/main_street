import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { protectRoute } from '../../../lib/authUtils';

async function promoteUserHandler(req, res) {
  try {
    if (req.method !== 'PUT') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ error: 'Missing userId or role' });
    }

    // Validate role - only allow promotion to PA for now
    const allowedRoles = ['user', 'PA', 'admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Allowed roles: user, PA, admin' });
    }

    // Only original admin can promote another user to admin role
    if (role === 'admin' && req.user?.email !== 'admin@admin.com') {
      return res.status(403).json({ error: 'Only the original admin can promote a user to admin' });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const usersCollection = db.collection('users');

    // Check if user exists
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user role
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          role: role,
          isPA: role === 'PA',
          isAdmin: role === 'admin',
          updatedAt: new Date()
        } 
      }
    );

    // Get updated user (without password)
    const updatedUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
    const { password: _, ...userWithoutPassword } = updatedUser;

    return res.status(200).json({
      message: `User successfully promoted to ${role}`,
      user: { ...userWithoutPassword, _id: userWithoutPassword._id.toString() }
    });

  } catch (error) {
    console.error('Error promoting user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default protectRoute(promoteUserHandler, ['admin']);