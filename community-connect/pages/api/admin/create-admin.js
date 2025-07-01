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
    const usersCollection = db.collection('users');

    // Check if admin already exists
    const existingAdmin = await usersCollection.findOne({ 
      email: 'admin@admin.com',
      isAdmin: true 
    });
    if (existingAdmin) {
      // Update existing admin password
      const hashedPassword = await hash(password, 10);
      await usersCollection.updateOne(
        { email: 'admin@admin.com', isAdmin: true },
        { $set: { password: hashedPassword } }
      );
      return res.status(200).json({ message: 'Admin user password updated successfully' });
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Create admin user
    const adminUser = {
      name: 'Admin',
      email: 'admin@admin.com',
      password: hashedPassword,
      role: 'admin',
      isAdmin: true,
      createdAt: new Date()
    };

    const result = await usersCollection.insertOne(adminUser);
    return res.status(201).json({ 
      message: 'Admin user created successfully',
      id: result.insertedId 
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}