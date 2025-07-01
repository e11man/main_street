/**
 * API Endpoint for Automated Opportunity Cancellation Check
 * ---------------------------------------------------------
 * 
 * This endpoint is designed to be called by a cron job at 10 PM daily.
 * It checks all opportunities scheduled for the next day and cancels
 * those with fewer than 6 registered volunteers.
 * 
 * ENDPOINT USAGE:
 * - POST /api/opportunities/check-cancellations
 */

import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { sendCancellationNotifications } from '../../../lib/email';

export default async function handler(req, res) {
  // Only allow POST requests (for cron job security)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const opportunitiesCollection = db.collection('opportunities');
    const usersCollection = db.collection('users');
    const companiesCollection = db.collection('companies');

    // Get tomorrow's date in YYYY-MM-DD format
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDateString = tomorrow.toISOString().split('T')[0];

    console.log(`Checking for cancellations for date: ${tomorrowDateString}`);

    // Find all opportunities scheduled for tomorrow
    const tomorrowOpportunities = await opportunitiesCollection.find({
      date: tomorrowDateString,
      cancelled: { $ne: true } // Not already cancelled
    }).toArray();

    console.log(`Found ${tomorrowOpportunities.length} opportunities for tomorrow`);

    const cancellationResults = [];

    for (const opportunity of tomorrowOpportunities) {
      const signedUpCount = opportunity.spotsFilled || 0;
      
      if (signedUpCount < 6) {
        console.log(`Cancelling opportunity: ${opportunity.title} (${signedUpCount} signups)`);
        
        // Mark opportunity as cancelled
        await opportunitiesCollection.updateOne(
          { _id: opportunity._id },
          { 
            $set: { 
              cancelled: true, 
              cancelledAt: new Date(),
              cancellationReason: `Insufficient signups (${signedUpCount} of minimum 6)`
            } 
          }
        );

        // Get list of signed up users
        const signedUpUsers = await usersCollection.find({
          'commitments.opportunityId': opportunity._id.toString()
        }).toArray();

        // Get company information
        let company = null;
        if (opportunity.companyId) {
          try {
            const companyObjectId = typeof opportunity.companyId === 'string' 
              ? new ObjectId(opportunity.companyId) 
              : opportunity.companyId;
            company = await companiesCollection.findOne({ _id: companyObjectId });
          } catch (error) {
            console.error('Error fetching company:', error);
          }
        }

        // Remove the opportunity from users' commitments
        for (const user of signedUpUsers) {
          await usersCollection.updateOne(
            { _id: user._id },
            { $pull: { commitments: { opportunityId: opportunity._id.toString() } } }
          );
        }

        // Send cancellation notifications
        try {
          const emailResults = await sendCancellationNotifications(
            signedUpUsers,
            opportunity,
            company
          );
          
          cancellationResults.push({
            opportunityId: opportunity._id,
            title: opportunity.title,
            signupCount: signedUpCount,
            cancelled: true,
            notificationsSent: emailResults.length,
            successfulNotifications: emailResults.filter(r => r.success).length
          });
        } catch (error) {
          console.error('Error sending cancellation notifications:', error);
          cancellationResults.push({
            opportunityId: opportunity._id,
            title: opportunity.title,
            signupCount: signedUpCount,
            cancelled: true,
            notificationError: error.message
          });
        }
      } else {
        console.log(`Opportunity ${opportunity.title} has sufficient signups (${signedUpCount})`);
        cancellationResults.push({
          opportunityId: opportunity._id,
          title: opportunity.title,
          signupCount: signedUpCount,
          cancelled: false,
          reason: 'Sufficient signups'
        });
      }
    }

    return res.status(200).json({
      success: true,
      dateChecked: tomorrowDateString,
      totalOpportunities: tomorrowOpportunities.length,
      results: cancellationResults,
      cancelledCount: cancellationResults.filter(r => r.cancelled).length
    });

  } catch (error) {
    console.error('Cancellation check error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}