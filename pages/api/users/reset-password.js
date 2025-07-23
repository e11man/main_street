import clientPromise from '../../../lib/mongodb';
import { hash } from 'bcrypt';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, verificationCode, newPassword } = req.body;

    // Validate input
    if (!email || !verificationCode || !newPassword) {
      return res.status(400).json({ error: 'Email, verification code, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const usersCollection = db.collection('users');
    const passwordResetCollection = db.collection('passwordReset');

    // Find reset request
    const resetData = await passwordResetCollection.findOne({ email: normalizedEmail });

    if (!resetData) {
      return res.status(404).json({ error: 'Password reset request not found. Please request a new reset code.' });
    }

    // Check if code has expired
    if (new Date() > new Date(resetData.codeExpiresAt)) {
      // Delete expired reset request
      await passwordResetCollection.deleteOne({ email: normalizedEmail });
      return res.status(400).json({ error: 'Verification code has expired. Please request a new reset code.' });
    }

    // Verify code
    if (resetData.verificationCode !== verificationCode) {
      return res.status(400).json({ error: 'Invalid verification code.' });
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 12);

    // Update user password
    const updateResult = await usersCollection.updateOne(
      { _id: new ObjectId(resetData.userId) },
      { $set: { password: hashedPassword } }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete reset request
    await passwordResetCollection.deleteOne({ email: normalizedEmail });

    return res.status(200).json({ message: 'Password has been successfully reset. You can now log in with your new password.' });

  } catch (error) {
    console.error('Error in reset password:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}