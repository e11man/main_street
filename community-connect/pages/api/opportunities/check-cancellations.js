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

        // Get list of signed up users (handle both old numeric and new ObjectId formats)
        const opportunityIdNum = opportunity.id; // Old format
        const opportunityIdStr = opportunity._id.toString(); // New format
        
        const signedUpUsers = await usersCollection.find({
          $or: [
            { commitments: opportunityIdNum }, // Old numeric format
            { commitments: opportunityIdStr }, // New ObjectId string format
            { commitments: opportunity._id } // ObjectId format
          ]
        }).toArray();

        console.log(`Found ${signedUpUsers.length} users signed up for cancelled opportunity: ${opportunity.title}`);

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

        // Remove the opportunity from users' commitments and track metrics
        let usersUpdated = 0;
        for (const user of signedUpUsers) {
          // Remove commitment from user (handle all ID formats)
          const result = await usersCollection.updateOne(
            { _id: user._id },
            { 
              $pull: { 
                commitments: { 
                  $in: [opportunityIdNum, opportunityIdStr, opportunity._id].filter(Boolean)
                }
              }
            }
          );
          
          if (result.modifiedCount > 0) {
            usersUpdated++;
          }
        }

        // Update metrics to remove hours for cancelled signups
        if (usersUpdated > 0) {
          try {
            const metricsCollection = db.collection('metrics');
            
            // Calculate hours from arrival and departure times
            const hoursPerUser = calculateHoursFromTimes(opportunity.arrivalTime, opportunity.departureTime);
            const totalHoursToRemove = hoursPerUser * usersUpdated;
            
            console.log(`Removing ${totalHoursToRemove} hours from metrics due to cancellation of ${opportunity.title} (${usersUpdated} users affected)`);
            
            await metricsCollection.updateOne(
              { _id: 'main' },
              { 
                $inc: { hoursServed: -totalHoursToRemove },
                $set: { lastUpdated: new Date() }
              }
            );
          } catch (metricsError) {
            console.error('Error updating metrics during cancellation:', metricsError);
            // Don't fail the entire operation if metrics update fails
          }
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