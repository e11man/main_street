import { ObjectId } from 'mongodb';
import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, chatNotificationFrequency } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!chatNotificationFrequency) {
      return res.status(400).json({ error: 'Chat notification frequency is required' });
    }

    // Validate notification frequency
    const validFrequencies = ['never', 'immediate', '5min', '30min'];
    if (!validFrequencies.includes(chatNotificationFrequency)) {
      return res.status(400).json({ error: 'Invalid notification frequency' });
    }

    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const usersCollection = db.collection('users');

    // Update user's notification settings
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { chatNotificationFrequency } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get updated user data
    const updatedUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
    const { password: _, ...userWithoutPassword } = updatedUser;

    return res.status(200).json({
      success: true,
      message: 'Notification settings updated successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Error updating notification settings:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}