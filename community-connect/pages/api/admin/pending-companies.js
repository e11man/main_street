import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const pendingCompaniesCollection = db.collection('pendingCompanies');

    if (req.method === 'GET') {
      // Get all pending companies
      const pendingCompanies = await pendingCompaniesCollection.find({}).toArray();
      return res.status(200).json(pendingCompanies);
    }

    if (req.method === 'POST' && req.query.approve === 'true') {
      // Approve a pending company
      const { companyId } = req.body;

      if (!companyId) {
        return res.status(400).json({ error: 'Company ID is required' });
      }

      // Find the pending company
      const pendingCompany = await pendingCompaniesCollection.findOne({ _id: new ObjectId(companyId) });
      if (!pendingCompany) {
        return res.status(404).json({ error: 'Pending company not found' });
      }

      // Move the company to the companies collection
      const companiesCollection = db.collection('companies');
      const { _id, ...companyData } = pendingCompany;
      
      // Set approved to true
      companyData.approved = true;
      
      const result = await companiesCollection.insertOne(companyData);
      
      // Delete from pending companies
      await pendingCompaniesCollection.deleteOne({ _id: new ObjectId(companyId) });

      return res.status(200).json({ message: 'Company approved successfully' });
    }

    if (req.method === 'DELETE') {
      // Reject a pending company
      const { companyId } = req.body;

      if (!companyId) {
        return res.status(400).json({ error: 'Company ID is required' });
      }

      const result = await pendingCompaniesCollection.deleteOne({ _id: new ObjectId(companyId) });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Pending company not found' });
      }

      return res.status(200).json({ message: 'Company rejected successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Pending companies API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}