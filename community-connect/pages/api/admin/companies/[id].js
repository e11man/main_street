/**
 * API Endpoint for Admin Company Management
 * -----------------------------
 * 
 * This API endpoint connects to MongoDB and provides admin functionality for managing companies.
 * 
 * ENDPOINT USAGE:
 * - DELETE /api/admin/companies/[id]: Deletes a company by ID
 * - PUT /api/admin/companies/[id]: Updates a company by ID
 */

import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  // Connect to MongoDB
  const client = await clientPromise;
  const db = client.db('mainStreetOpportunities');
  const companiesCollection = db.collection('companies');
  
  // Get company ID from the URL
  const { id } = req.query;
  
  // Handle DELETE request (delete company)
  if (req.method === 'DELETE') {
    try {
      // Validate company ID
      if (!id || !ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid company ID' });
      }
      
      // Delete company from database
      const result = await companiesCollection.deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Company not found' });
      }
      
      return res.status(200).json({ message: 'Company deleted successfully' });
    } catch (error) {
      console.error('Error deleting company:', error);
      return res.status(500).json({ error: 'Failed to delete company' });
    }
  }
  
  // Handle PUT request (update company)
  if (req.method === 'PUT') {
    try {
      // Validate company ID
      if (!id || !ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid company ID' });
      }
      
      const { name, website, phone, description } = req.body;
      
      // Prepare update data
      const updateData = {};
      if (name) updateData.name = name;
      if (website !== undefined) updateData.website = website;
      if (phone !== undefined) updateData.phone = phone;
      if (description !== undefined) updateData.description = description;
      
      // Update company in database
      const result = await companiesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Company not found' });
      }
      
      // Get updated company data
      const updatedCompany = await companiesCollection.findOne({ _id: new ObjectId(id) });
      const { password: _, ...companyWithoutPassword } = updatedCompany;
      
      return res.status(200).json(companyWithoutPassword);
    } catch (error) {
      console.error('Error updating company:', error);
      return res.status(500).json({ error: 'Failed to update company' });
    }
  }
  
  // Return 405 for unsupported methods
  return res.status(405).json({ error: 'Method not allowed' });
}