/**
 * API Endpoint for Admin Company Management
 * -----------------------------
 * 
 * This API endpoint connects to MongoDB and provides admin functionality for managing companies.
 * 
 * ENDPOINT USAGE:
 * - DELETE /api/admin/companies/[id]: Deletes a company by ID
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
  
  // Return 405 for unsupported methods
  return res.status(405).json({ error: 'Method not allowed' });
}