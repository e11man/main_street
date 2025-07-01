import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paUserId, opportunityId, searchTerm = '' } = req.query;

    // Validate input
    if (!paUserId) {
      return res.status(400).json({ error: 'PA User ID is required' });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const usersCollection = db.collection('users');
    const opportunitiesCollection = db.collection('opportunities');

    // Verify PA exists and has PA role
    const paUser = await usersCollection.findOne({ _id: new ObjectId(paUserId) });
    if (!paUser) {
      return res.status(404).json({ error: 'PA user not found' });
    }

    if (paUser.role !== 'pa') {
      return res.status(403).json({ error: 'User does not have PA permissions' });
    }

    // Get opportunity details if specified (to check existing participants)
    let opportunity = null;
    let existingParticipants = [];
    if (opportunityId) {
      opportunity = await opportunitiesCollection.findOne({ 
        $or: [
          { id: parseInt(opportunityId) },
          { _id: new ObjectId(opportunityId) }
        ]
      });
      
      if (opportunity) {
        const opportunityIdNum = opportunity.id || parseInt(opportunityId);
        // Get users who are already committed to this opportunity
        const committedUsers = await usersCollection.find({
          commitments: { $in: [opportunityIdNum, opportunityId.toString()] }
        }).toArray();
        existingParticipants = committedUsers.map(user => user._id.toString());
      }
    }

    // Build search query
    let searchQuery = {
      role: { $ne: 'pa' }, // Exclude other PAs
      _id: { $nin: existingParticipants.map(id => new ObjectId(id)) } // Exclude already committed users
    };

    // Add search term filter if provided
    if (searchTerm.trim()) {
      const searchRegex = new RegExp(searchTerm.trim(), 'i');
      searchQuery.$or = [
        { name: searchRegex },
        { email: searchRegex }
      ];
    }

    // Get all users matching search criteria
    const allUsers = await usersCollection.find(searchQuery, {
      projection: { 
        name: 1, 
        email: 1, 
        dorm: 1, 
        commitments: 1,
        _id: 1 
      }
    }).toArray();

    // Filter out users who already have 2 commitments
    const availableUsers = allUsers.filter(user => 
      !user.commitments || user.commitments.length < 2
    );

    // Sort users: same dorm first, then others
    const recommendations = availableUsers.sort((a, b) => {
      // Users from same dorm as PA get priority
      const aFromSameDorm = a.dorm === paUser.dorm ? 1 : 0;
      const bFromSameDorm = b.dorm === paUser.dorm ? 1 : 0;
      
      if (aFromSameDorm !== bFromSameDorm) {
        return bFromSameDorm - aFromSameDorm; // Same dorm first
      }
      
      // Within same priority level, sort by name
      return a.name.localeCompare(b.name);
    });

    // Add recommendation reason and format response
    const formattedRecommendations = recommendations.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      dorm: user.dorm,
      commitmentCount: user.commitments ? user.commitments.length : 0,
      isFromSameDorm: user.dorm === paUser.dorm,
      recommendationReason: user.dorm === paUser.dorm 
        ? `Same dorm (${user.dorm})`
        : user.dorm 
          ? `Different dorm (${user.dorm})`
          : 'No dorm specified'
    }));

    return res.status(200).json({
      total: formattedRecommendations.length,
      paInfo: {
        name: paUser.name,
        dorm: paUser.dorm
      },
      users: formattedRecommendations.slice(0, 50) // Limit to first 50 results
    });

  } catch (error) {
    console.error('Error getting user recommendations:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}