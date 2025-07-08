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
 * @param {string} senderType - The type of the sender (e.g., 'user', 'organization')
 * @returns {Promise<Array>} - Array of participants with their email addresses
 */
async function getChatParticipants(opportunityId, senderEmail, senderType) {
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
    
    if (company && company.email && (company.email.toLowerCase().trim() !== senderEmail.toLowerCase().trim() || senderType === 'organization')) {
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
  const isCompanyRecipient = participant.type === 'company';

  const plainBodyLines = [
    `Hi ${participant.name},`,
    '',
    `You have a new message in the chat for "${opportunity.title}"${isCompanyRecipient ? '' : ` from ${senderName}`}.`,
  ];

  if (!isCompanyRecipient) {
    plainBodyLines.push('', `Message: ${messagePreview}${messagePreview.length >= 100 ? '...' : ''}`);
  }

  plainBodyLines.push('', 'Login to Community Connect to view the full conversation and reply.', '', 'Best regards,', 'Community Connect Team');

  const textBody = plainBodyLines.join('\n');

  // HTML Version – mirrors the verification-code e-mail style
  let htmlContent = `<div style="font-family: Arial, sans-serif; line-height: 1.6;">`;
  htmlContent += `<h2 style=\"color: #333;\">New Chat Message</h2>`;
  htmlContent += `<p>Hi ${participant.name},</p>`;
  htmlContent += `<p>You have a new message in the chat for <strong>\"${opportunity.title}\"</strong>${isCompanyRecipient ? '' : ` from <strong>${senderName}</strong>`}.</p>`;

  if (!isCompanyRecipient) {
    htmlContent += `<p style=\"font-style: italic; color: #555;\">\"${messagePreview}${messagePreview.length >= 100 ? '...' : ''}\"</p>`;
  }

  htmlContent += `<p>Please log in to Community Connect to view and reply.</p>`;
  htmlContent += `<hr style=\"border: none; border-top: 1px solid #eee;\" />`;
  htmlContent += `<p style=\"font-size: 0.9em; color: #777;\">Community Connect<br />Connecting volunteers with opportunities.</p>`;

  if (!isCompanyRecipient) {
    htmlContent += `<p style=\"font-size: 0.8em; color: #999;\">Note: To prevent spam, you'll only receive one email notification every 30 minutes per chat.</p>`;
  }

  htmlContent += `</div>`;

  const mailOptions = {
    from: `"Community Connect" <${process.env.EMAIL_USER}>`,
    to: participant.email,
    subject: `New Message in ${opportunity.title} Chat`,
    text: textBody,
    html: htmlContent
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
 * @param {string} senderType - The type of the sender (e.g., 'user', 'organization')
 * @returns {Promise<Object>} - Results of email sending
 */
export async function sendChatNotifications(opportunityId, senderEmail, senderName, message, senderType) {
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
    const participants = await getChatParticipants(opportunityId, senderEmail, senderType);
    
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
