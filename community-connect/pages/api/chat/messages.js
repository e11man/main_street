import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { sendChatNotifications } from '../../../lib/emailUtils';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const chatCollection = db.collection('chatMessages');

    if (req.method === 'POST') {
      const { opportunityId, senderId, senderType, message, actualSenderId } = req.body;

      if (!opportunityId || !senderType || !message) {
        return res.status(400).json({ error: 'Missing required fields: opportunityId, senderType, message' });
      }

      // Validate senderId based on senderType
      if (senderType !== 'admin_as_host' && !senderId) {
        return res.status(400).json({ error: 'Missing senderId for user or organization' });
      }
      if (senderType === 'admin_as_host' && !actualSenderId) {
        return res.status(400).json({ error: 'Missing actualSenderId for admin_as_host type' });
      }

      let finalSenderId;
      if (senderType === 'admin_as_host') {
        // For admin_as_host, the 'senderId' in the message should be the company's ID (opportunity's companyId).
        // The 'actualSenderId' (admin's ID) can be stored for audit if needed, or just used for validation.
        // For simplicity here, we'll assume the frontend sends the correct companyId as senderId when admin sends as host.
        // If opportunity object is not directly available here, this might need adjustment or rely on frontend sending companyId.
        // Let's assume opportunityId is for the opportunity, and senderId is the ID of who is *appearing* to send.
        if (!senderId) return res.status(400).json({ error: 'senderId (companyId) is required when admin is sending as host.' });
        finalSenderId = new ObjectId(senderId); // This would be the companyId
      } else {
        finalSenderId = new ObjectId(senderId);
      }

      const newMessage = {
        opportunityId: new ObjectId(opportunityId),
        senderId: finalSenderId, // This is who the message appears from (user or company)
        senderType, // "user", "organization", or "admin_as_host" (or just "organization" if admin posts as them)
        message,
        timestamp: new Date(),
      };

      // If admin is sending, we might want to log which admin sent it.
      // For now, senderType: "admin_as_host" can imply an admin action.
      // Or, if senderType remains "organization", the frontend logic for admin sending would set senderId to companyId.

      const result = await chatCollection.insertOne(newMessage);
      // result.ops was deprecated. insertOne returns insertedId in result.
      // To return the full document, we might need to fetch it if not available directly,
      // or construct it. For now, let's assume `result.ops[0]` works or adjust if needed.
      // A more robust way:
      const insertedMessage = await chatCollection.findOne({ _id: result.insertedId });

      // Send email notifications to all participants (excluding the sender)
      let emailNotificationResults = null;
      let emailNotificationError = null;

      try {
        // Get sender information for email notifications
        let senderEmail = '';
        let senderName = '';

        if (senderType === 'user') {
          const usersCollection = db.collection('users');
          const sender = await usersCollection.findOne({ _id: finalSenderId });
          if (sender) {
            senderEmail = sender.email;
            senderName = sender.name;
          }
        } else if (senderType === 'organization' || senderType === 'admin_as_host') {
          const companiesCollection = db.collection('companies');
          const sender = await companiesCollection.findOne({ _id: finalSenderId });
          if (sender) {
            senderEmail = sender.email;
            senderName = sender.name;
          }
          
          // If admin is sending as host, use admin's name but company's email context
          if (senderType === 'admin_as_host') {
            senderName = 'Admin (on behalf of ' + senderName + ')';
          }
        }

        // Send email notifications if we have sender information
        if (senderEmail && senderName) {
          emailNotificationResults = await sendChatNotifications(
            opportunityId, 
            senderEmail, 
            senderName, 
            message,
            senderType // pass senderType for participant logic
          );
          
          console.log('Chat email notifications result:', emailNotificationResults);
          
          // Only include detailed results if there are issues or for debugging
          if (emailNotificationResults.failed > 0 || 
              emailNotificationResults.invalidEmails > 0 || 
              !emailNotificationResults.success) {
            insertedMessage.emailNotificationResults = emailNotificationResults;
          } else {
            // Simplified results for successful sends
            insertedMessage.emailNotificationResults = {
              success: true,
              emailsSent: emailNotificationResults.emailsSent,
              rateLimited: emailNotificationResults.rateLimited
            };
          }
        } else {
          console.warn('Could not determine sender information for email notifications');
          emailNotificationError = 'Could not determine sender information';
        }
      } catch (emailError) {
        // Email notifications should not fail the chat message posting
        console.error('Error sending chat email notifications:', emailError);
        emailNotificationError = emailError.message;
      }

      // Add email status to response
      if (emailNotificationError) {
        insertedMessage.emailNotificationError = emailNotificationError;
      }

      res.status(201).json(insertedMessage);
    } else if (req.method === 'GET') {
      const { opportunityId } = req.query;

      if (!opportunityId) {
        return res.status(400).json({ error: 'Missing opportunityId query parameter' });
      }

      const messages = await chatCollection
        .find({ opportunityId: new ObjectId(opportunityId) })
        .sort({ timestamp: 1 }) // Sort by oldest first
        .toArray();

      res.status(200).json(messages);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
