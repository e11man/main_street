import { compare } from 'bcryptjs'; // Removed hash as it's not used here
import clientPromise from '../../../lib/mongodb';
import { generateToken } from '../../../lib/authUtils'; // Import JWT utility
// ObjectId is not used in this specific file after changes.

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
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const usersCollection = db.collection('users');

    // Find admin user
    // Simplified query: username must match email and isAdmin must be true.
    // Removed the hardcoded 'admin@admin.com' OR condition for better security.
    const admin = await usersCollection.findOne({ 
      email: username, // Assuming admin username is their email
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

    // Generate JWT
    const tokenPayload = {
      adminId: admin._id.toString(), // Ensure ID is a string
      email: admin.email,
      role: 'admin',
    };
    const token = generateToken(tokenPayload);

    // Set token in an HttpOnly cookie
    res.setHeader('Set-Cookie', `authToken=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
    // Max-Age is 1 day (in seconds), adjust as needed. SameSite=Lax is a good default. Secure only in prod.

    // Return success, optionally include some non-sensitive admin info if needed by client
    return res.status(200).json({
      message: 'Admin login successful',
      admin: { // Example: only send back non-sensitive info
        email: admin.email,
        name: admin.name || 'Admin' // if admin has a name field
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}