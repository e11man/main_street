/**
 * API Endpoint for Admin Organization Management
 * -----------------------------
 * 
 * This API endpoint connects to MongoDB and provides admin functionality for managing organizations.
 * 
 * ENDPOINT USAGE:
 * - DELETE /api/admin/organizations/[id]: Deletes an organization by ID
 * - PUT /api/admin/organizations/[id]: Updates an organization by ID
 */

import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  // Connect to MongoDB
  const client = await clientPromise;
  const db = client.db('mainStreetOpportunities');
  const organizationsCollection = db.collection('companies');
  
  // Get organization ID from the URL
  const { id } = req.query;
  
  // Handle DELETE request (delete organization)
  if (req.method === 'DELETE') {
    try {
      // Validate organization ID
      if (!id || !ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid organization ID' });
      }
      
      // Delete organization from database
      const result = await organizationsCollection.deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Organization not found' });
      }
      
      return res.status(200).json({ message: 'Organization deleted successfully' });
    } catch (error) {
      console.error('Error deleting organization:', error);
      return res.status(500).json({ error: 'Failed to delete organization' });
    }
  }
  
  // Handle PUT request (update organization)
  if (req.method === 'PUT') {
    try {
      // Validate organization ID
      if (!id || !ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid organization ID' });
      }
      
      const { name, website, phone, description } = req.body;
      
      // Prepare update data
      const updateData = {};
      if (name) updateData.name = name;
      if (website !== undefined) updateData.website = website;
      if (phone !== undefined) updateData.phone = phone;
      if (description !== undefined) updateData.description = description;
      
      // Update organization in database
      const result = await organizationsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Organization not found' });
      }
      
      // Get updated organization data
      const updatedOrganization = await organizationsCollection.findOne({ _id: new ObjectId(id) });
      const { password: _, ...organizationWithoutPassword } = updatedOrganization;
      
      return res.status(200).json(organizationWithoutPassword);
    } catch (error) {
      console.error('Error updating organization:', error);
      return res.status(500).json({ error: 'Failed to update organization' });
    }
  }
  
  // Return 405 for unsupported methods
  return res.status(405).json({ error: 'Method not allowed' });
}