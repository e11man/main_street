import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { hash } from 'bcryptjs';
import { protectRoute } from '../../../lib/authUtils';

async function originalAdminHandler(req, res) {
  try {
    // Only allow the original admin to access this endpoint
    if (req.user?.email !== 'admin@admin.com') {
      return res.status(403).json({ error: 'Access denied. Only the original admin can access this endpoint.' });
    }

    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const usersCollection = db.collection('users');

    if (req.method === 'GET') {
      // Get original admin info
      const originalAdmin = await usersCollection.findOne({ 
        email: 'admin@admin.com',
        isOriginalAdmin: true 
      });
      
      if (!originalAdmin) {
        return res.status(404).json({ error: 'Original admin not found' });
      }

      const { password: _, ...adminWithoutPassword } = originalAdmin;
      return res.status(200).json(adminWithoutPassword);
    }

    if (req.method === 'PUT') {
      // Update original admin info
      const { name, currentPassword, newPassword } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      // Find the original admin
      const originalAdmin = await usersCollection.findOne({ 
        email: 'admin@admin.com',
        isOriginalAdmin: true 
      });

      if (!originalAdmin) {
        return res.status(404).json({ error: 'Original admin not found' });
      }

      const updateData = {
        name,
        updatedAt: new Date()
      };

      // If changing password, validate current password and hash new one
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ error: 'Current password is required to set a new password' });
        }

        const { compare } = require('bcryptjs');
        const passwordMatch = await compare(currentPassword, originalAdmin.password);
        if (!passwordMatch) {
          return res.status(401).json({ error: 'Current password is incorrect' });
        }

        updateData.password = await hash(newPassword, 10);
      }

      // Update the original admin
      await usersCollection.updateOne(
        { 
          email: 'admin@admin.com',
          isOriginalAdmin: true 
        },
        { $set: updateData }
      );

      // Return updated admin info (without password)
      const updatedAdmin = await usersCollection.findOne({ 
        email: 'admin@admin.com',
        isOriginalAdmin: true 
      });
      
      const { password: _, ...adminWithoutPassword } = updatedAdmin;
      return res.status(200).json(adminWithoutPassword);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Original admin API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default protectRoute(originalAdminHandler, ['admin']);