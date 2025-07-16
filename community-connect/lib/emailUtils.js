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
 * Sends a password reset email to the user.
 * @param {string} toEmail - The recipient's email address.
 * @param {string} code - The verification code.
 * @returns {Promise<void>}
 * @throws {Error} If sending email fails.
 */
export async function sendPasswordResetEmail(toEmail, code) {
  const mailOptions = {
    from: `"Community Connect" <${process.env.EMAIL_USER}>`, // Sender address
    to: toEmail, // List of receivers
    subject: 'Reset Your Password - Community Connect', // Subject line
    text: `You requested a password reset for your Community Connect account. Your verification code is: ${code}\n\nThis code will expire in 15 minutes.\n\nIf you did not request this password reset, please ignore this email.`, // Plain text body
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested a password reset for your Community Connect account. Please use the following verification code to reset your password:</p>
        <p style="font-size: 24px; font-weight: bold; color: #dc2626;">${code}</p>
        <p>This code will expire in <strong>15 minutes</strong>.</p>
        <p style="color: #dc2626; font-weight: bold;">If you did not request this password reset, please ignore this email and your password will remain unchanged.</p>
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
    console.log('Password reset email sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email.'); // Propagate error to be handled by caller
  }
}

/**
 * Checks if a user should receive an email notification based on rate limiting and organization preferences
 * @param {string} opportunityId - The opportunity ID
 * @param {string} recipientEmail - The recipient's email address
 * @param {string} recipientType - The type of recipient ('user' or 'company')
 * @returns {Promise<boolean>} - True if email should be sent, false if rate limited or disabled
 */
async function shouldSendEmailNotification(opportunityId, recipientEmail, recipientType) {
  try {
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const emailNotificationsCollection = db.collection('emailNotifications');

    // If recipient is a company/organization, check their notification preferences
    if (recipientType === 'company') {
      const companiesCollection = db.collection('companies');
      const organization = await companiesCollection.findOne({ email: recipientEmail.toLowerCase().trim() });
      
      if (organization) {
        const notificationFrequency = organization.chatNotificationFrequency || 'immediate';
        
        // If notifications are disabled, don't send
        if (notificationFrequency === 'never') {
          console.log(`Notifications disabled for organization: ${recipientEmail}`);
          return false;
        }
        
        // For immediate notifications, check only the basic rate limit
        if (notificationFrequency === 'immediate') {
          const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
          const recentNotification = await emailNotificationsCollection.findOne({
            opportunityId: new ObjectId(opportunityId),
            recipientEmail: recipientEmail.toLowerCase().trim(),
            lastSentAt: { $gte: thirtyMinutesAgo }
          });
          return !recentNotification;
        }
        
        // For batched notifications (5min, 30min), check the specific interval
        let intervalMinutes;
        if (notificationFrequency === '5min') {
          intervalMinutes = 5;
        } else if (notificationFrequency === '30min') {
          intervalMinutes = 30;
        } else {
          // Default to 30 minutes for unknown frequencies
          intervalMinutes = 30;
        }
        
        const intervalAgo = new Date(Date.now() - intervalMinutes * 60 * 1000);
        const recentNotification = await emailNotificationsCollection.findOne({
          opportunityId: new ObjectId(opportunityId),
          recipientEmail: recipientEmail.toLowerCase().trim(),
          lastSentAt: { $gte: intervalAgo }
        });
        
        return !recentNotification;
      }
    }
    
    // For regular users, use the default 30-minute rate limit
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
 * Validates an email address format and domain
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if email is valid
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email.trim());
  
  // Additional checks for common issues
  if (isValid) {
    const trimmedEmail = email.trim().toLowerCase();
    // Check for common problematic patterns
    if (trimmedEmail.includes('..') || 
        trimmedEmail.startsWith('.') || 
        trimmedEmail.endsWith('.') ||
        trimmedEmail.includes('@.') ||
        trimmedEmail.includes('.@')) {
      return false;
    }
  }
  
  return isValid;
}

/**
 * Sanitizes and normalizes email address
 * @param {string} email - The email address to sanitize
 * @returns {string|null} - Sanitized email or null if invalid
 */
function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') return null;
  
  const sanitized = email.trim().toLowerCase();
  return isValidEmail(sanitized) ? sanitized : null;
}

/**
 * Gets all participants for a specific chat opportunity with email validation
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
    const sanitizedSenderEmail = sanitizeEmail(senderEmail);
    
    // Get company information
    const companiesCollection = db.collection('companies');
    const company = await companiesCollection.findOne({ _id: new ObjectId(opportunity.companyId) });
    
    if (company) {
      const companyEmail = sanitizeEmail(company.email);
      if (companyEmail) {
        // For admin_as_host: only notify the organization owner (company)
        if (senderType === 'admin_as_host') {
          if (companyEmail !== sanitizedSenderEmail) {
            participants.push({
              email: companyEmail,
              name: company.name || 'Organization',
              type: 'company'
            });
          }
        } 
        // For organization: notify company if different sender
        else if (senderType === 'organization' && companyEmail !== sanitizedSenderEmail) {
          participants.push({
            email: companyEmail,
            name: company.name || 'Organization',
            type: 'company'
          });
        }
        // For user: always notify company
        else if (senderType === 'user') {
          participants.push({
            email: companyEmail,
            name: company.name || 'Organization',
            type: 'company'
          });
        }
      } else if (company.email) {
        console.warn(`Invalid company email format for company ${company._id}: ${company.email}`);
      }
    }

    // For admin_as_host: don't notify users, only the organization owner
    if (senderType === 'admin_as_host') {
      return participants;
    }

    // Get users who have committed to this opportunity (for organization and user senders)
    const usersCollection = db.collection('users');
    const users = await usersCollection.find({ 
      commitments: { $in: [new ObjectId(opportunityId)] }
    }).toArray();

    users.forEach(user => {
      const userEmail = sanitizeEmail(user.email);
      if (userEmail && userEmail !== sanitizedSenderEmail) {
        participants.push({
          email: userEmail,
          name: user.name || 'Volunteer',
          type: 'user'
        });
      } else if (!userEmail && user.email) {
        console.warn(`Invalid user email format for user ${user._id}: ${user.email}`);
      }
    });

    return participants;
  } catch (error) {
    console.error('Error getting chat participants:', error);
    return [];
  }
}

/**
 * Sends a chat notification email to a recipient with enhanced error handling
 * @param {Object} participant - The participant to send to
 * @param {Object} opportunity - The opportunity details
 * @param {string} senderName - The name of the message sender
 * @param {string} messagePreview - Preview of the message (first 100 chars)
 * @returns {Promise<Object>} - Result object with success status and error details
 */
async function sendChatNotificationEmail(participant, opportunity, senderName, messagePreview) {
  try {
    // Validate participant email before attempting to send
    const sanitizedEmail = sanitizeEmail(participant.email);
    if (!sanitizedEmail) {
      return {
        success: false,
        error: 'Invalid email address format',
        email: participant.email
      };
    }

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
      to: sanitizedEmail,
      subject: `New Message in ${opportunity.title} Chat`,
      text: textBody,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Chat notification email sent to ${sanitizedEmail}: %s`, info.messageId);
    return {
      success: true,
      messageId: info.messageId,
      email: sanitizedEmail
    };
  } catch (error) {
    console.error(`Error sending chat notification email to ${participant.email}:`, error);
    return {
      success: false,
      error: error.message,
      email: participant.email,
      code: error.code || 'UNKNOWN'
    };
  }
}

/**
 * Sends chat notification emails to all participants with enhanced error handling and validation
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
    
    // Validate sender email
    const sanitizedSenderEmail = sanitizeEmail(senderEmail);
    if (!sanitizedSenderEmail) {
      console.warn(`Invalid sender email format: ${senderEmail}`);
      return { 
        success: false, 
        error: 'Invalid sender email format',
        senderEmail: senderEmail
      };
    }
    
    // Get opportunity details
    const opportunitiesCollection = db.collection('opportunities');
    const opportunity = await opportunitiesCollection.findOne({ _id: new ObjectId(opportunityId) });
    
    if (!opportunity) {
      console.error('Opportunity not found for chat notifications:', opportunityId);
      return { success: false, error: 'Opportunity not found' };
    }

    // Get all participants with email validation
    const participants = await getChatParticipants(opportunityId, sanitizedSenderEmail, senderType);
    
    if (participants.length === 0) {
      console.log('No valid participants found for chat notifications');
      return { success: true, emailsSent: 0, participants: [] };
    }

    const results = {
      success: true,
      emailsSent: 0,
      rateLimited: 0,
      failed: 0,
      invalidEmails: 0,
      participants: [],
      errors: []
    };

    // Prepare message preview (first 100 characters)
    const messagePreview = message.length > 100 ? message.substring(0, 100) : message;

    // Send emails to eligible participants
    for (const participant of participants) {
      try {
        // Double-check email validity
        if (!isValidEmail(participant.email)) {
          console.warn(`Skipping invalid email: ${participant.email}`);
          results.invalidEmails++;
          results.participants.push({
            email: participant.email,
            name: participant.name,
            type: participant.type,
            status: 'invalid_email'
          });
          continue;
        }

        // Check rate limiting and notification preferences
        const shouldSend = await shouldSendEmailNotification(opportunityId, participant.email, participant.type);
        
        if (!shouldSend) {
          console.log(`Rate limited or notifications disabled: ${participant.email} for opportunity ${opportunityId}`);
          results.rateLimited++;
          results.participants.push({
            email: participant.email,
            name: participant.name,
            type: participant.type,
            status: 'rate_limited'
          });
          continue;
        }

        // Send email with enhanced error handling
        const emailResult = await sendChatNotificationEmail(participant, opportunity, senderName, messagePreview);
        
        if (emailResult.success) {
          // Record that email was sent
          await recordEmailNotificationSent(opportunityId, participant.email);
          results.emailsSent++;
          results.participants.push({
            email: participant.email,
            name: participant.name,
            type: participant.type,
            status: 'sent',
            messageId: emailResult.messageId
          });
        } else {
          results.failed++;
          results.participants.push({
            email: participant.email,
            name: participant.name,
            type: participant.type,
            status: 'failed',
            error: emailResult.error,
            errorCode: emailResult.code
          });
          results.errors.push({
            email: participant.email,
            error: emailResult.error,
            code: emailResult.code
          });
        }
      } catch (error) {
        console.error(`Error processing chat notification for ${participant.email}:`, error);
        results.failed++;
        results.participants.push({
          email: participant.email,
          name: participant.name,
          type: participant.type,
          status: 'error',
          error: error.message
        });
        results.errors.push({
          email: participant.email,
          error: error.message
        });
      }
    }

    console.log(`Chat notifications completed: ${results.emailsSent} sent, ${results.rateLimited} rate limited, ${results.failed} failed, ${results.invalidEmails} invalid emails`);
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
