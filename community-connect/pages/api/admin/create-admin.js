import { hash } from 'bcryptjs';
import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }

  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const adminsCollection = db.collection('admins');

    // Check if admin already exists
    const existingAdmin = await adminsCollection.findOne({ username });
    if (existingAdmin) {
      return res.status(200).json({ message: 'Admin user already exists' });
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Create admin user
    const adminUser = {
      username,
      password: hashedPassword,
      createdAt: new Date()
    };

    const result = await adminsCollection.insertOne(adminUser);
    return res.status(201).json({ 
      message: 'Admin user created successfully',
      id: result.insertedId 
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}