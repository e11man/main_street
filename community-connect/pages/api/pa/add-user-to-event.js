import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { sendEventAddedNotificationEmail } from '../../../lib/emailUtils';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paUserId, userEmail, opportunityId } = req.body;

    // Validate input
    if (!paUserId || !userEmail || !opportunityId) {
      return res.status(400).json({ error: 'Missing required fields' });
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

    // Find the user to be added (by email)
    const normalizedEmail = userEmail.toLowerCase().trim();
    const targetUser = await usersCollection.findOne({ email: normalizedEmail });
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found with the provided email' });
    }

    // Find the opportunity
    const opportunity = await opportunitiesCollection.findOne({ 
      $or: [
        { id: parseInt(opportunityId) },
        { _id: new ObjectId(opportunityId) }
      ]
    });
    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    // Check if opportunity is already full
    const totalSpots = opportunity.spotsTotal || opportunity.totalSpots || 0;
    const filledSpots = opportunity.spotsFilled || 0;
    if (filledSpots >= totalSpots) {
      return res.status(400).json({ error: 'This opportunity is already full' });
    }

    // Convert opportunityId to number for consistent comparison
    const opportunityIdNum = opportunity.id || parseInt(opportunityId);

    // Check if user already has this commitment
    if (targetUser.commitments) {
      for (let i = 0; i < targetUser.commitments.length; i++) {
        if (targetUser.commitments[i] == opportunityId || targetUser.commitments[i] == opportunityIdNum) {
          return res.status(409).json({ 
            error: 'User is already committed to this opportunity'
          });
        }
      }
    }

    // Check if user already has 2 commitments
    if (targetUser.commitments && targetUser.commitments.length >= 2) {
      return res.status(400).json({ 
        error: 'User already has the maximum number of commitments (2)'
      });
    }

    // Add commitment to user's commitments array
    const commitments = targetUser.commitments || [];
    commitments.push(opportunityIdNum);

    // Update user in database
    await usersCollection.updateOne(
      { _id: targetUser._id },
      { $set: { commitments: commitments } }
    );

    // Increment the spotsFilled count in the opportunity
    await opportunitiesCollection.updateOne(
      { $or: [{ id: opportunityIdNum }, { _id: opportunity._id }] },
      { $inc: { spotsFilled: 1 } }
    );

    // Send email notification to the user
    try {
      await sendEventAddedNotificationEmail(
        targetUser.email,
        targetUser.name,
        opportunity,
        paUser.name
      );
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the request if email fails, but log it
    }

    // Return success response
    return res.status(200).json({
      message: `Successfully added ${targetUser.name} to ${opportunity.title}`,
      user: {
        name: targetUser.name,
        email: targetUser.email,
        commitments: commitments
      },
      opportunity: {
        title: opportunity.title,
        spotsFilled: filledSpots + 1,
        spotsTotal: totalSpots
      }
    });

  } catch (error) {
    console.error('Error adding user to event:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}