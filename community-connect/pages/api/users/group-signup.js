import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { paUserId, opportunityId, userIds } = req.body;

    // Validate input
    if (!paUserId || !opportunityId || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'Missing required fields: paUserId, opportunityId, and userIds array' });
    }

    if (userIds.length > 10) {
      return res.status(400).json({ error: 'Cannot sign up more than 10 users at once' });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const usersCollection = db.collection('users');
    const opportunitiesCollection = db.collection('opportunities');

    // Verify PA user
    const paUser = await usersCollection.findOne({ _id: new ObjectId(paUserId) });
    if (!paUser) {
      return res.status(404).json({ error: 'PA user not found' });
    }

    if (!paUser.isPA && !paUser.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Only PAs and admins can perform group signups' });
    }

    // Get the opportunity
    const opportunity = await opportunitiesCollection.findOne({ id: parseInt(opportunityId) });
    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    // Check available spots
    const totalSpots = opportunity.spotsTotal || opportunity.totalSpots || 0;
    const filledSpots = opportunity.spotsFilled || 0;
    const availableSpots = totalSpots - filledSpots;

    if (userIds.length > availableSpots) {
      return res.status(400).json({ 
        error: `Not enough spots available. Requested: ${userIds.length}, Available: ${availableSpots}` 
      });
    }

    // Validate all users exist and check for existing commitments
    const users = await usersCollection.find({ 
      _id: { $in: userIds.map(id => new ObjectId(id)) } 
    }).toArray();

    if (users.length !== userIds.length) {
      return res.status(400).json({ error: 'One or more users not found' });
    }

    // Check for existing commitments and commitment limits
    const conflictUsers = [];
    const maxCommitmentUsers = [];
    const opportunityIdNum = parseInt(opportunityId);

    for (const user of users) {
      const commitments = user.commitments || [];
      
      // Check if user already committed to this opportunity
      if (commitments.includes(opportunityIdNum) || commitments.includes(opportunityId)) {
        conflictUsers.push(user.name);
      }
      
      // Check if user already has maximum commitments (2)
      if (commitments.length >= 2) {
        maxCommitmentUsers.push(user.name);
      }
    }

    if (conflictUsers.length > 0) {
      return res.status(409).json({ 
        error: `The following users are already signed up for this opportunity: ${conflictUsers.join(', ')}` 
      });
    }

    if (maxCommitmentUsers.length > 0) {
      return res.status(400).json({ 
        error: `The following users already have the maximum number of commitments (2): ${maxCommitmentUsers.join(', ')}` 
      });
    }

    // Perform group signup
    const results = [];
    let successCount = 0;

    for (const userId of userIds) {
      try {
        // Add commitment to user
        await usersCollection.updateOne(
          { _id: new ObjectId(userId) },
          { $push: { commitments: opportunityIdNum } }
        );

        // Get updated user info
        const updatedUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
        const { password: _, ...userWithoutPassword } = updatedUser;
        
        results.push({
          success: true,
          user: userWithoutPassword
        });
        
        successCount++;
      } catch (error) {
        console.error(`Error signing up user ${userId}:`, error);
        results.push({
          success: false,
          userId: userId,
          error: 'Failed to sign up user'
        });
      }
    }

    // Update opportunity spots filled
    if (successCount > 0) {
      await opportunitiesCollection.updateOne(
        { id: parseInt(opportunityId) },
        { $inc: { spotsFilled: successCount } }
      );
    }

    return res.status(200).json({
      message: `Successfully signed up ${successCount} out of ${userIds.length} users`,
      results: results,
      opportunityId: opportunityId,
      paUser: {
        _id: paUser._id,
        name: paUser.name,
        email: paUser.email
      }
    });

  } catch (error) {
    console.error('Error performing group signup:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}