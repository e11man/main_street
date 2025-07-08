import nodemailer from 'nodemailer';
import clientPromise from './mongodb';
import { ObjectId } from 'mongodb';

// Ensure environment variables are set
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("EMAIL_USER or EMAIL_PASS environment variables are not set. Email functionality will not work.");
  // Depending on strictness, you might want to throw an error here in a production environment
  // throw new Error("Email server credentials are not configured.");
}

const transporter = nodemailer.createTransport({
  service: 'gmail', // Or your email provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends a verification email to the user.
 * @param {string} toEmail - The recipient's email address.
 * @param {string} code - The verification code.
 * @returns {Promise<void>}
 * @throws {Error} If sending email fails.
 */
export async function sendVerificationEmail(toEmail, code) {
  const mailOptions = {
    from: `"Community Connect" <${process.env.EMAIL_USER}>`, // Sender address
    to: toEmail, // List of receivers
    subject: 'Verify Your Email Address for Community Connect', // Subject line
    text: `Welcome to Community Connect! Your verification code is: ${code}\n\nThis code will expire in 15 minutes.`, // Plain text body
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">Welcome to Community Connect!</h2>
        <p>Thank you for signing up. Please use the following verification code to complete your registration:</p>
        <p style="font-size: 24px; font-weight: bold; color: #007bff;">${code}</p>
        <p>This code will expire in <strong>15 minutes</strong>.</p>
        <p>If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 0.9em; color: #777;">
          Community Connect<br />
          Connecting volunteers with opportunities.
        </p>
      </div>
    `, // HTML body
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent: %s', info.messageId);
    // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info)); // Uncomment for testing with ethereal.email
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email.'); // Propagate error to be handled by caller
  }
}

/**
 * Checks if a user should receive an email notification based on rate limiting (30 minutes)
 * @param {string} opportunityId - The opportunity ID
 * @param {string} recipientEmail - The recipient's email address
 * @returns {Promise<boolean>} - True if email should be sent, false if rate limited
 */
async function shouldSendEmailNotification(opportunityId, recipientEmail) {
  try {
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const emailNotificationsCollection = db.collection('emailNotifications');

    // Check if user has been notified within the last 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    const recentNotification = await emailNotificationsCollection.findOne({
      opportunityId: new ObjectId(opportunityId),
      recipientEmail: recipientEmail.toLowerCase().trim(),
      lastSentAt: { $gte: thirtyMinutesAgo }
    });

    return !recentNotification;
  } catch (error) {
    console.error('Error checking email notification rate limit:', error);
    // Default to allowing email if rate limit check fails
    return true;
  }
}

/**
 * Records that an email notification was sent
 * @param {string} opportunityId - The opportunity ID
 * @param {string} recipientEmail - The recipient's email address
 */
async function recordEmailNotificationSent(opportunityId, recipientEmail) {
  try {
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const emailNotificationsCollection = db.collection('emailNotifications');

    await emailNotificationsCollection.updateOne(
      {
        opportunityId: new ObjectId(opportunityId),
        recipientEmail: recipientEmail.toLowerCase().trim()
      },
      {
        $set: {
          lastSentAt: new Date()
        }
      },
      { upsert: true }
    );
  } catch (error) {
    console.error('Error recording email notification:', error);
    // Non-critical error, don't throw
  }
}

/**
 * Gets all participants for a specific chat opportunity
 * @param {string} opportunityId - The opportunity ID
 * @param {string} senderEmail - The sender's email (to exclude from notifications)
 * @returns {Promise<Array>} - Array of participants with their email addresses
 */
async function getChatParticipants(opportunityId, senderEmail) {
  try {
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    
    // Get the opportunity to find the company
    const opportunitiesCollection = db.collection('opportunities');
    const opportunity = await opportunitiesCollection.findOne({ _id: new ObjectId(opportunityId) });
    
    if (!opportunity) {
      console.error('Opportunity not found:', opportunityId);
      return [];
    }

    const participants = [];
    
    // Get company information
    const companiesCollection = db.collection('companies');
    const company = await companiesCollection.findOne({ _id: new ObjectId(opportunity.companyId) });
    
    if (company && company.email && company.email.toLowerCase().trim() !== senderEmail.toLowerCase().trim()) {
      participants.push({
        email: company.email,
        name: company.name,
        type: 'company'
      });
    }

    // Get users who have committed to this opportunity
    const usersCollection = db.collection('users');
    const users = await usersCollection.find({ 
      commitments: { $in: [new ObjectId(opportunityId)] }
    }).toArray();

    users.forEach(user => {
      if (user.email && user.email.toLowerCase().trim() !== senderEmail.toLowerCase().trim()) {
        participants.push({
          email: user.email,
          name: user.name,
          type: 'user'
        });
      }
    });

    return participants;
  } catch (error) {
    console.error('Error getting chat participants:', error);
    return [];
  }
}

/**
 * Sends a chat notification email to a recipient
 * @param {Object} participant - The participant to send to
 * @param {Object} opportunity - The opportunity details
 * @param {string} senderName - The name of the message sender
 * @param {string} messagePreview - Preview of the message (first 100 chars)
 * @returns {Promise<boolean>} - True if email was sent successfully
 */
async function sendChatNotificationEmail(participant, opportunity, senderName, messagePreview) {
  // NEW: simplified template for business/company recipients
  const isCompanyRecipient = participant.type === 'company';

  const baseText = `Hi ${participant.name},\n\nYou have a new message in the chat for "${opportunity.title}".\n\nLogin to Community Connect to view the full conversation and reply.\n\nBest regards,\nCommunity Connect Team`;

  const mailOptions = {
    from: `"Community Connect" <${process.env.EMAIL_USER}>`,
    to: participant.email,
    subject: `New Message in ${opportunity.title} Chat`,
    text: isCompanyRecipient ? baseText : `Hi ${participant.name},\n\nYou have a new message in the chat for "${opportunity.title}" from ${senderName}.\n\nMessage: ${messagePreview}\n\nLogin to Community Connect to view the full conversation and reply.\n\nBest regards,\nCommunity Connect Team`,
    html: isCompanyRecipient ? `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">New Chat Notification</h2>
        <p>You have a new message in the chat for "${opportunity.title}".</p>
        <p>Please log in to Community Connect to view and reply.</p>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 0.9em; color: #777;">
          Community Connect<br />
          Connecting volunteers with opportunities.
        </p>
      </div>
    ` : `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">💬 New Chat Message</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Community Connect</p>
        </div>
        <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333; margin-top: 0;">Hi ${participant.name}!</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            You have a new message in the chat for <strong>"${opportunity.title}"</strong> from <strong>${senderName}</strong>.
          </p>
          <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 5px;">
            <h3 style="color: #333; margin-top: 0; margin-bottom: 10px;">📝 Message Preview</h3>
            <p style="color: #555; font-style: italic; margin: 0;">"${messagePreview}${messagePreview.length >= 100 ? '...' : ''}"</p>
          </div>
          <div style="background: #e8f4f8; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">📅 Opportunity Details</h3>
            <p style="margin: 5px 0; color: #555;"><strong>Event:</strong> ${opportunity.title}</p>
            ${opportunity.date ? `<p style="margin: 5px 0; color: #555;"><strong>Date:</strong> ${new Date(opportunity.date).toLocaleDateString()}</p>` : ''}
            ${opportunity.location ? `<p style="margin: 5px 0; color: #555;"><strong>Location:</strong> ${opportunity.location}</p>` : ''}
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #666; margin-bottom: 20px;">Login to Community Connect to view the full conversation and reply.</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              View Chat 💬
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 0.9em; color: #777; text-align: center; margin: 0;">
            <strong>Community Connect</strong><br />
            Connecting volunteers with opportunities.<br />
            <em>You're receiving this because you're participating in this opportunity's chat.</em>
          </p>
          <p style="font-size: 0.8em; color: #999; text-align: center; margin: 15px 0 0 0;">
            Note: To prevent spam, you'll only receive one email notification every 30 minutes per chat.
          </p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Chat notification email sent to ${participant.email}: %s`, info.messageId);
    return true;
  } catch (error) {
    console.error(`Error sending chat notification email to ${participant.email}:`, error);
    return false;
  }
}

/**
 * Sends chat notification emails to all participants with rate limiting
 * @param {string} opportunityId - The opportunity ID
 * @param {string} senderEmail - The sender's email (to exclude from notifications)
 * @param {string} senderName - The sender's name
 * @param {string} message - The message content
 * @returns {Promise<Object>} - Results of email sending
 */
export async function sendChatNotifications(opportunityId, senderEmail, senderName, message) {
  try {
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    
    // Get opportunity details
    const opportunitiesCollection = db.collection('opportunities');
    const opportunity = await opportunitiesCollection.findOne({ _id: new ObjectId(opportunityId) });
    
    if (!opportunity) {
      console.error('Opportunity not found for chat notifications:', opportunityId);
      return { success: false, error: 'Opportunity not found' };
    }

    // Get all participants
    const participants = await getChatParticipants(opportunityId, senderEmail);
    
    if (participants.length === 0) {
      console.log('No participants found for chat notifications');
      return { success: true, emailsSent: 0, participants: [] };
    }

    const results = {
      success: true,
      emailsSent: 0,
      rateLimited: 0,
      failed: 0,
      participants: []
    };

    // Prepare message preview (first 100 characters)
    const messagePreview = message.length > 100 ? message.substring(0, 100) : message;

    // Send emails to eligible participants
    for (const participant of participants) {
      try {
        // Check rate limiting
        const shouldSend = await shouldSendEmailNotification(opportunityId, participant.email);
        
        if (!shouldSend) {
          console.log(`Rate limited: ${participant.email} for opportunity ${opportunityId}`);
          results.rateLimited++;
          results.participants.push({
            email: participant.email,
            name: participant.name,
            type: participant.type,
            status: 'rate_limited'
          });
          continue;
        }

        // Send email
        const emailSent = await sendChatNotificationEmail(participant, opportunity, senderName, messagePreview);
        
        if (emailSent) {
          // Record that email was sent
          await recordEmailNotificationSent(opportunityId, participant.email);
          results.emailsSent++;
          results.participants.push({
            email: participant.email,
            name: participant.name,
            type: participant.type,
            status: 'sent'
          });
        } else {
          results.failed++;
          results.participants.push({
            email: participant.email,
            name: participant.name,
            type: participant.type,
            status: 'failed'
          });
        }
      } catch (error) {
        console.error(`Error processing chat notification for ${participant.email}:`, error);
        results.failed++;
        results.participants.push({
          email: participant.email,
          name: participant.name,
          type: participant.type,
          status: 'error'
        });
      }
    }

    console.log(`Chat notifications completed: ${results.emailsSent} sent, ${results.rateLimited} rate limited, ${results.failed} failed`);
    return results;

  } catch (error) {
    console.error('Error sending chat notifications:', error);
    return { success: false, error: error.message };
  }
}

// Example usage (for testing purposes, you might run this with node directly):
// (async () => {
//   if (process.env.NODE_ENV !== 'production') { // Avoid running in prod
//     try {
//       // Ensure you have .env.local with EMAIL_USER and EMAIL_PASS for this test
//       // You might need to temporarily export them if running this file directly
//       // e.g. export $(cat .env.local | xargs)
//       console.log(`Attempting to send test email to ${process.env.EMAIL_USER}...`)
//       await sendVerificationEmail(process.env.EMAIL_USER, '123456');
//       console.log("Test email sent successfully (check your inbox/spam).");
//     } catch (e) {
//       console.error("Test email failed:", e);
//     }
//   }
// })();
