import clientPromise from './mongodb';
import { ObjectId } from 'mongodb';
import { sendChatNotificationEmail } from './emailUtils';

/**
 * Notification Job System
 * 
 * This system handles batched notifications for organizations that have set
 * notification frequencies other than 'immediate' or 'never'.
 * 
 * The system should be run as a cron job or scheduled task to process
 * pending notifications at regular intervals.
 */

/**
 * Processes pending notifications for organizations with batched notification settings
 * @param {string} frequency - The notification frequency to process ('5min' or '30min')
 */
export async function processBatchedNotifications(frequency) {
  try {
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    
    const pendingNotificationsCollection = db.collection('pendingNotifications');
    const emailNotificationsCollection = db.collection('emailNotifications');
    const companiesCollection = db.collection('companies');
    const opportunitiesCollection = db.collection('opportunities');
    const chatMessagesCollection = db.collection('chatMessages');
    
    // Calculate the time window for this batch
    const now = new Date();
    let windowStart;
    
    if (frequency === '5min') {
      windowStart = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
    } else if (frequency === '30min') {
      windowStart = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes ago
    } else {
      throw new Error(`Invalid frequency: ${frequency}`);
    }
    
    // Find organizations with this notification frequency
    const organizations = await companiesCollection.find({
      chatNotificationFrequency: frequency
    }).toArray();
    
    console.log(`Processing ${frequency} notifications for ${organizations.length} organizations`);
    
    for (const organization of organizations) {
      try {
        // Get all opportunities for this organization
        const opportunities = await opportunitiesCollection.find({
          organizationId: organization._id
        }).toArray();
        
        for (const opportunity of opportunities) {
          // Get all chat messages in the time window for this opportunity
          const recentMessages = await chatMessagesCollection.find({
            opportunityId: opportunity._id,
            timestamp: { $gte: windowStart },
            senderId: { $ne: organization._id } // Exclude messages from the organization itself
          }).toArray();
          
          if (recentMessages.length === 0) {
            continue; // No new messages in this window
          }
          
          // Check if we've already sent a notification for this organization/opportunity in this window
          const lastNotification = await emailNotificationsCollection.findOne({
            opportunityId: opportunity._id,
            recipientEmail: organization.email.toLowerCase().trim(),
            lastSentAt: { $gte: windowStart }
          });
          
          if (lastNotification) {
            continue; // Already sent notification in this window
          }
          
          // Prepare notification content
          const messageCount = recentMessages.length;
          const latestMessage = recentMessages[recentMessages.length - 1];
          
          // Get sender information for the latest message
          let senderName = 'A volunteer';
          if (latestMessage.senderType === 'user') {
            const usersCollection = db.collection('users');
            const sender = await usersCollection.findOne({ _id: latestMessage.senderId });
            if (sender) {
              senderName = sender.name;
            }
          }
          
          // Send batched notification
          const notificationResult = await sendChatNotificationEmail(
            {
              email: organization.email,
              name: organization.name,
              type: 'company'
            },
            opportunity,
            senderName,
            `You have ${messageCount} new message${messageCount > 1 ? 's' : ''} in the chat for "${opportunity.title}".`
          );
          
          if (notificationResult.success) {
            // Record that notification was sent
            await emailNotificationsCollection.updateOne(
              {
                opportunityId: opportunity._id,
                recipientEmail: organization.email.toLowerCase().trim()
              },
              {
                $set: {
                  lastSentAt: now,
                  batchFrequency: frequency,
                  messageCount: messageCount
                }
              },
              { upsert: true }
            );
            
            console.log(`Sent ${frequency} batched notification to ${organization.email} for opportunity ${opportunity.title}`);
          } else {
            console.error(`Failed to send ${frequency} batched notification to ${organization.email}:`, notificationResult.error);
          }
        }
      } catch (error) {
        console.error(`Error processing ${frequency} notifications for organization ${organization.email}:`, error);
      }
    }
    
    console.log(`Completed processing ${frequency} notifications`);
    
  } catch (error) {
    console.error(`Error in processBatchedNotifications for ${frequency}:`, error);
    throw error;
  }
}

/**
 * Processes all batched notifications (5min and 30min)
 * This function should be called by a cron job or scheduled task
 */
export async function processAllBatchedNotifications() {
  try {
    console.log('Starting batched notification processing...');
    
    // Process 5-minute notifications
    await processBatchedNotifications('5min');
    
    // Process 30-minute notifications
    await processBatchedNotifications('30min');
    
    console.log('Completed all batched notification processing');
    
  } catch (error) {
    console.error('Error processing all batched notifications:', error);
    throw error;
  }
}

/**
 * Cleanup old notification records
 * Removes notification records older than 7 days to keep the database clean
 */
export async function cleanupOldNotificationRecords() {
  try {
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    
    const emailNotificationsCollection = db.collection('emailNotifications');
    const pendingNotificationsCollection = db.collection('pendingNotifications');
    
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Clean up old email notification records
    const emailResult = await emailNotificationsCollection.deleteMany({
      lastSentAt: { $lt: sevenDaysAgo }
    });
    
    // Clean up old pending notification records
    const pendingResult = await pendingNotificationsCollection.deleteMany({
      createdAt: { $lt: sevenDaysAgo }
    });
    
    console.log(`Cleaned up ${emailResult.deletedCount} old email notification records`);
    console.log(`Cleaned up ${pendingResult.deletedCount} old pending notification records`);
    
  } catch (error) {
    console.error('Error cleaning up old notification records:', error);
    throw error;
  }
}