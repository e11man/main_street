import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { sendBulkGroupSignupNotifications, sendGroupSignupNotification } from '../../../lib/email';

// Helper function to calculate hours from arrival and departure times
function calculateHoursFromTimes(arrivalTime, departureTime) {
  if (!arrivalTime || !departureTime) {
    return 0;
  }

  try {
    // Parse times (format: "HH:MM" or "H:MM")
    const [arrivalHour, arrivalMin] = arrivalTime.split(':').map(num => parseInt(num));
    const [departureHour, departureMin] = departureTime.split(':').map(num => parseInt(num));
    
    // Convert to minutes for easier calculation
    const arrivalMinutes = arrivalHour * 60 + arrivalMin;
    let departureMinutes = departureHour * 60 + departureMin;
    
    // Handle case where departure is the next day (e.g., arrival 23:00, departure 01:00)
    if (departureMinutes < arrivalMinutes) {
      departureMinutes += 24 * 60; // Add 24 hours
    }
    
    // Calculate difference in minutes and convert to hours
    const diffMinutes = departureMinutes - arrivalMinutes;
    const hours = diffMinutes / 60;
    
    // Round to 1 decimal place and ensure reasonable bounds (0.5 to 12 hours)
    const roundedHours = Math.round(hours * 10) / 10;
    return Math.max(0.5, Math.min(12, roundedHours));
  } catch (error) {
    console.error('Error calculating hours from times:', error, { arrivalTime, departureTime });
    return 0;
  }
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { paUserId, opportunityId, userIds, includeSelf } = req.body;

    // Validate input
    if (!paUserId || !opportunityId || (!userIds || !Array.isArray(userIds) || userIds.length === 0) && !includeSelf) {
      return res.status(400).json({ error: 'Must provide userIds array or set includeSelf to true' });
    }

    const totalUsers = (userIds ? userIds.length : 0) + (includeSelf ? 1 : 0);
    if (totalUsers > 10) {
      return res.status(400).json({ error: 'Cannot sign up more than 10 users at once (including yourself)' });
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

    // Get the opportunity - handle both old numeric IDs and new MongoDB ObjectIds
    let opportunity;
    const opportunityIdNum = parseInt(opportunityId);
    
    // First try to find by numeric id (for older opportunities)
    if (!isNaN(opportunityIdNum)) {
      opportunity = await opportunitiesCollection.findOne({ id: opportunityIdNum });
    }
    
    // If not found and opportunityId looks like MongoDB ObjectId, try _id
    if (!opportunity && ObjectId.isValid(opportunityId)) {
      opportunity = await opportunitiesCollection.findOne({ _id: new ObjectId(opportunityId) });
    }
    
    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    // Check available spots
    const totalSpots = opportunity.spotsTotal || opportunity.totalSpots || 0;
    const filledSpots = opportunity.spotsFilled || 0;
    const availableSpots = totalSpots - filledSpots;

    if (totalUsers > availableSpots) {
      return res.status(400).json({ 
        error: `Not enough spots available. Requested: ${totalUsers}, Available: ${availableSpots}` 
      });
    }

    // Validate all users exist and check for existing commitments
    let users = [];
    if (userIds && userIds.length > 0) {
      users = await usersCollection.find({ 
        _id: { $in: userIds.map(id => new ObjectId(id)) } 
      }).toArray();

      if (users.length !== userIds.length) {
        return res.status(400).json({ error: 'One or more users not found' });
      }
    }

    // Include PA user if includeSelf is true
    let allUsersToSignUp = [...users];
    if (includeSelf) {
      allUsersToSignUp.push(paUser);
    }

    // Check for existing commitments and commitment limits
    const conflictUsers = [];
    const maxCommitmentUsers = [];

    for (const user of allUsersToSignUp) {
      const commitments = user.commitments || [];
      
      // Check if user already committed to this opportunity
      // Handle both numeric and ObjectId string formats
      const committedToThisOpportunity = commitments.some(commitment => {
        return commitment == opportunityIdNum || 
               commitment == opportunityId || 
               commitment.toString() == opportunityId;
      });
      
      if (committedToThisOpportunity) {
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
    const signedUpUsers = [];

    // Sign up all users (including PA if includeSelf is true)
    for (const user of allUsersToSignUp) {
      try {
        // Add commitment to user
        // Store the ID in the same format as the opportunity
        let commitmentId;
        if (opportunity.id) {
          // Old format - store as number
          commitmentId = opportunity.id;
        } else {
          // New format - store as ObjectId string
          commitmentId = opportunity._id.toString();
        }
        
        await usersCollection.updateOne(
          { _id: new ObjectId(user._id) },
          { $push: { commitments: commitmentId } }
        );

        // Get updated user info
        const updatedUser = await usersCollection.findOne({ _id: new ObjectId(user._id) });
        const { password: _, ...userWithoutPassword } = updatedUser;
        
        results.push({
          success: true,
          user: userWithoutPassword
        });
        
        signedUpUsers.push(userWithoutPassword);
        successCount++;
      } catch (error) {
        console.error(`Error signing up user ${user._id}:`, error);
        results.push({
          success: false,
          userId: user._id,
          error: 'Failed to sign up user'
        });
      }
    }

    // Update opportunity spots filled
    if (successCount > 0) {
      let updateFilter;
      if (opportunity.id) {
        // Old numeric ID format
        updateFilter = { id: opportunity.id };
      } else {
        // New MongoDB ObjectId format
        updateFilter = { _id: opportunity._id };
      }
      
      await opportunitiesCollection.updateOne(
        updateFilter,
        { $inc: { spotsFilled: successCount } }
      );

      // Update metrics for hours served (add hours for each successful signup)
      try {
        const metricsCollection = db.collection('metrics');
        
        // Calculate hours from arrival and departure times
        const hoursPerUser = calculateHoursFromTimes(opportunity.arrivalTime, opportunity.departureTime);
        const totalHours = hoursPerUser * successCount;
        
        console.log(`Adding ${totalHours} hours to metrics for ${successCount} users in group signup for opportunity: ${opportunity.title}`);
        
        await metricsCollection.updateOne(
          { _id: 'main' },
          { 
            $inc: { hoursServed: totalHours },
            $set: { lastUpdated: new Date() }
          }
        );
      } catch (metricsError) {
        console.error('Error updating metrics in group signup:', metricsError);
        // Don't fail the entire operation if metrics update fails
      }
    }

    // Send email notifications to successfully signed up users
    let emailResults = [];
    if (signedUpUsers.length > 0) {
      try {
        // Get the organization information for the opportunity
        const organizationsCollection = db.collection('companies');
        const organization = await organizationsCollection.findOne({ _id: new ObjectId(opportunity.organizationId) });
        
        // Enrich opportunity with organization details
        const enrichedOpportunity = {
          ...opportunity,
          organizationName: organization?.name,
        organizationEmail: organization?.email,
        organizationPhone: organization?.phone,
        organizationWebsite: organization?.website
        };

        emailResults = await sendBulkGroupSignupNotifications(
          signedUpUsers, 
          enrichedOpportunity, 
          {
            _id: paUser._id,
            name: paUser.name,
            email: paUser.email
          }
        );
        
        console.log('Email notifications sent:', emailResults);
      } catch (emailError) {
        console.error('Error sending email notifications:', emailError);
        // Don't fail the entire request if email fails
      }
    }

    return res.status(200).json({
      message: `Successfully signed up ${successCount} out of ${totalUsers} users`,
      results: results,
      emailResults: emailResults,
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