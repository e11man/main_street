import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const pendingOrganizationsCollection = db.collection('pendingCompanies');

    if (req.method === 'GET') {
      // Get all pending organizations
      const pendingOrganizations = await pendingOrganizationsCollection.find({}).toArray();
      return res.status(200).json(pendingOrganizations);
    }

    if (req.method === 'POST' && req.query.approve === 'true') {
      // Approve a pending organization
      const { organizationId } = req.body;

      if (!organizationId) {
        return res.status(400).json({ error: 'Organization ID is required' });
      }

      // Find the pending organization
      const pendingOrganization = await pendingOrganizationsCollection.findOne({ _id: new ObjectId(organizationId) });
      if (!pendingOrganization) {
        return res.status(404).json({ error: 'Pending organization not found' });
      }

      // Move the organization to the organizations collection
      const organizationsCollection = db.collection('companies');
      const { _id, ...organizationData } = pendingOrganization;
      
      // Set approved to true
      organizationData.approved = true;
      
      const result = await organizationsCollection.insertOne(organizationData);
      
      // Delete from pending organizations
      await pendingOrganizationsCollection.deleteOne({ _id: new ObjectId(organizationId) });

      return res.status(200).json({ message: 'Organization approved successfully' });
    }

    if (req.method === 'DELETE') {
      // Reject a pending organization
      const { organizationId } = req.body;

      if (!organizationId) {
        return res.status(400).json({ error: 'Organization ID is required' });
      }

      const result = await pendingOrganizationsCollection.deleteOne({ _id: new ObjectId(organizationId) });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Pending organization not found' });
      }

      return res.status(200).json({ message: 'Organization rejected successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Pending organizations API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}