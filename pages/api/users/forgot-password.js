import clientPromise from '../../../lib/mongodb';
import { sendPasswordResetEmail } from '../../../lib/emailUtils';

// Helper function to generate a random 6-digit code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const usersCollection = db.collection('users');
    const passwordResetCollection = db.collection('passwordReset');

    // Check if user exists
    const user = await usersCollection.findOne({ email: normalizedEmail });
    if (!user) {
      // For security, don't reveal if email exists or not
      return res.status(200).json({ 
        message: 'If an account with this email exists, a password reset code has been sent.' 
      });
    }

    // Check if there's an existing reset request
    const existingReset = await passwordResetCollection.findOne({ email: normalizedEmail });
    
    // Check 2-minute rate limit
    if (existingReset && existingReset.lastCodeSentAt) {
      const timeSinceLastCode = new Date() - new Date(existingReset.lastCodeSentAt);
      const twoMinutesInMs = 2 * 60 * 1000; // 2 minutes in milliseconds

      if (timeSinceLastCode < twoMinutesInMs) {
        const remainingTime = Math.ceil((twoMinutesInMs - timeSinceLastCode) / 1000); // seconds
        return res.status(429).json({ 
          error: `Please wait ${remainingTime} seconds before requesting a new code.`,
          remainingTime: remainingTime
        });
      }
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const codeExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration
    const lastCodeSentAt = new Date();

    // Store or update reset request
    await passwordResetCollection.updateOne(
      { email: normalizedEmail },
      {
        $set: {
          email: normalizedEmail,
          verificationCode,
          codeExpiresAt,
          lastCodeSentAt,
          userId: user._id
        }
      },
      { upsert: true }
    );

    // Send password reset email
    try {
      await sendPasswordResetEmail(normalizedEmail, verificationCode);
      return res.status(200).json({
        message: 'If an account with this email exists, a password reset code has been sent. Please check your inbox and junk/spam folder.'
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      return res.status(500).json({ error: 'Failed to send password reset email. Please try again.' });
    }

  } catch (error) {
    console.error('Error in forgot password:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}