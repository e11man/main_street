import { compare, hash } from 'bcryptjs';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }

  try {
    // Check if using environment variables for local development
    const envAdminEmail = process.env.ADMIN_EMAIL;
    const envAdminPassword = process.env.ADMIN_PASSWORD;
    
    if (envAdminEmail && envAdminPassword && 
        username === envAdminEmail && 
        password === envAdminPassword) {
      // Local environment admin login successful
      return res.status(200).json({ message: 'Login successful' });
    }
    
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const usersCollection = db.collection('users');

    // Find admin user (using email field since that's what we created)
    const admin = await usersCollection.findOne({ 
      $or: [
        { email: username },
        { email: 'admin@admin.com' }
      ],
      isAdmin: true 
    });
    
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare passwords
    const passwordMatch = await compare(password, admin.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Return success (no sensitive data)
    return res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}