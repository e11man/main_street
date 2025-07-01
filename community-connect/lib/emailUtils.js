import nodemailer from 'nodemailer';

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
 * Sends a notification email when a user is added to an event by a PA.
 * @param {string} toEmail - The recipient's email address.
 * @param {string} userName - The user's name.
 * @param {Object} opportunity - The opportunity/event details.
 * @param {string} paName - The PA's name who added them.
 * @returns {Promise<void>}
 * @throws {Error} If sending email fails.
 */
export async function sendEventAddedNotificationEmail(toEmail, userName, opportunity, paName) {
  const mailOptions = {
    from: `"Community Connect" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `You've been added to: ${opportunity.title}`,
    text: `Hello ${userName},\n\nYou've been added to the volunteer opportunity "${opportunity.title}" by ${paName}.\n\nEvent Details:\n- Title: ${opportunity.title}\n- Date: ${opportunity.date}\n- Time: ${opportunity.time}\n- Location: ${opportunity.location}\n- Description: ${opportunity.description}\n\nPlease log into Community Connect to view more details and connect with other volunteers.\n\nBest regards,\nCommunity Connect Team`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">You've been added to a volunteer opportunity!</h2>
        <p>Hello ${userName},</p>
        <p>You've been added to the volunteer opportunity <strong>"${opportunity.title}"</strong> by ${paName}.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">Event Details:</h3>
          <p><strong>Title:</strong> ${opportunity.title}</p>
          <p><strong>Date:</strong> ${opportunity.date}</p>
          <p><strong>Time:</strong> ${opportunity.time}</p>
          <p><strong>Location:</strong> ${opportunity.location}</p>
          <p><strong>Description:</strong> ${opportunity.description}</p>
        </div>
        
        <p>Please log into Community Connect to view more details and connect with other volunteers.</p>
        
        <hr style="border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 0.9em; color: #777;">
          Best regards,<br />
          Community Connect Team<br />
          Connecting volunteers with opportunities.
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Event notification email sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending event notification email:', error);
    throw new Error('Failed to send event notification email.');
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
