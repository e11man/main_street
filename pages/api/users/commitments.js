import { ObjectId } from 'mongodb';
import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const usersCollection = db.collection('users');
    const opportunitiesCollection = db.collection('opportunities');
    const companiesCollection = db.collection('companies');

    // Get user with commitments
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.commitments || user.commitments.length === 0) {
      return res.status(200).json([]);
    }

    // Get all opportunities that the user has committed to
    const commitments = [];
    
    for (const commitmentId of user.commitments) {
      let opportunity = null;
      
      // Try to find opportunity by different ID formats
      if (typeof commitmentId === 'number' || !isNaN(parseInt(commitmentId))) {
        // Try numeric ID first
        opportunity = await opportunitiesCollection.findOne({ id: parseInt(commitmentId) });
      }
      
      if (!opportunity && ObjectId.isValid(commitmentId)) {
        // Try ObjectId if it's a valid ObjectId string
        opportunity = await opportunitiesCollection.findOne({ _id: new ObjectId(commitmentId) });
      }
      
      if (opportunity) {
        // Get organization name
        let organizationName = 'Unknown Organization';
        if (opportunity.organizationId) {
          const organization = await companiesCollection.findOne({ _id: new ObjectId(opportunity.organizationId) });
          if (organization) {
            organizationName = organization.name;
          }
        }
        
        commitments.push({
          _id: opportunity._id,
          title: opportunity.title,
          description: opportunity.description,
          category: opportunity.category,
          date: opportunity.date,
          arrivalTime: opportunity.arrivalTime,
          departureTime: opportunity.departureTime,
          location: opportunity.location,
          organizationName: organizationName,
          totalSpots: opportunity.totalSpots || opportunity.spotsTotal,
          spotsFilled: opportunity.spotsFilled || 0
        });
      }
    }

    // Sort commitments by date (earliest first)
    commitments.sort((a, b) => new Date(a.date) - new Date(b.date));

    return res.status(200).json(commitments);

  } catch (error) {
    console.error('Error fetching user commitments:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}