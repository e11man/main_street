/**
 * API Endpoint for User Password Update
 * ------------------------------------
 * 
 * This API endpoint handles password updates for authenticated users.
 * 
 * ENDPOINT USAGE:
 * - PUT /api/users/update-password: Updates user password
 */

import clientPromise from '../../../lib/mongodb';
import { hash, compare } from 'bcrypt';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, currentPassword, newPassword } = req.body;

    // Validate input
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('main_street');
    const usersCollection = db.collection('users');

    // Find user
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await hash(newPassword, 12);

    // Update password in database
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { password: hashedNewPassword } }
    );

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}