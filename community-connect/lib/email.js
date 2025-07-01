import nodemailer from 'nodemailer';

// Create transporter for email service
const createTransporter = () => {
  // For development, use Ethereal Email (test email service)
  // In production, you would use a real email service like Gmail, SendGrid, etc.
  
  if (process.env.NODE_ENV === 'production') {
    // Production email configuration
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development configuration - using Ethereal for testing
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass',
      },
    });
  }
};

export const sendGroupSignupNotification = async (user, opportunity, paUser) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@communityconnect.com',
      to: user.email,
      subject: `You've been signed up for: ${opportunity.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Community Connect</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Volunteer Opportunity Signup</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #333; margin-top: 0;">Hi ${user.name}!</h2>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              Great news! You've been signed up for a volunteer opportunity by your Peer Advisor, <strong>${paUser.name}</strong>.
            </p>
            
            <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 5px;">
              <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">📅 Opportunity Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold; width: 30%;">Event:</td>
                  <td style="padding: 8px 0; color: #333;">${opportunity.title}</td>
                </tr>
                ${opportunity.date ? `
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Date:</td>
                  <td style="padding: 8px 0; color: #333;">${opportunity.date}</td>
                </tr>
                ` : ''}
                ${opportunity.time ? `
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Time:</td>
                  <td style="padding: 8px 0; color: #333;">${opportunity.time}</td>
                </tr>
                ` : ''}
                ${opportunity.location ? `
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Location:</td>
                  <td style="padding: 8px 0; color: #333;">${opportunity.location}</td>
                </tr>
                ` : ''}
                ${opportunity.description ? `
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Description:</td>
                  <td style="padding: 8px 0; color: #333;">${opportunity.description}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            ${opportunity.companyName || opportunity.companyEmail ? `
            <div style="background: #fff; border: 2px solid #e9ecef; padding: 20px; margin: 25px 0; border-radius: 8px;">
              <h4 style="color: #333; margin-top: 0; margin-bottom: 15px;">🏢 Hosted by</h4>
              ${opportunity.companyName ? `<p style="margin: 5px 0; color: #333;"><strong>${opportunity.companyName}</strong></p>` : ''}
              ${opportunity.companyEmail ? `<p style="margin: 5px 0; color: #666;">📧 ${opportunity.companyEmail}</p>` : ''}
              ${opportunity.companyPhone ? `<p style="margin: 5px 0; color: #666;">📞 ${opportunity.companyPhone}</p>` : ''}
              ${opportunity.companyWebsite ? `<p style="margin: 5px 0; color: #666;">🌐 <a href="${opportunity.companyWebsite}" style="color: #667eea;">${opportunity.companyWebsite}</a></p>` : ''}
            </div>
            ` : ''}
            
            <div style="margin: 30px 0; padding: 20px; background: #e8f5e8; border-radius: 8px; border-left: 4px solid #28a745;">
              <p style="margin: 0; color: #155724; font-weight: bold;">✅ You're all set!</p>
              <p style="margin: 10px 0 0 0; color: #155724;">
                Your commitment has been recorded. If you have any questions about this opportunity, 
                please contact your PA ${paUser.name} at <a href="mailto:${paUser.email}" style="color: #28a745;">${paUser.email}</a>.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 25px; border-top: 1px solid #e9ecef;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                Questions? Contact us at <a href="mailto:co@taylor.edu" style="color: #667eea;">co@taylor.edu</a>
              </p>
              <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
                This email was sent because you were signed up for a volunteer opportunity through Community Connect.
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
Hi ${user.name}!

You've been signed up for a volunteer opportunity by your Peer Advisor, ${paUser.name}.

Event: ${opportunity.title}
${opportunity.date ? `Date: ${opportunity.date}` : ''}
${opportunity.time ? `Time: ${opportunity.time}` : ''}
${opportunity.location ? `Location: ${opportunity.location}` : ''}
${opportunity.description ? `Description: ${opportunity.description}` : ''}

${opportunity.companyName ? `Hosted by: ${opportunity.companyName}` : ''}
${opportunity.companyEmail ? `Contact: ${opportunity.companyEmail}` : ''}

You're all set! If you have any questions, contact your PA ${paUser.name} at ${paUser.email}.

Questions? Contact us at co@taylor.edu
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

export const sendBulkGroupSignupNotifications = async (users, opportunity, paUser) => {
  const results = [];
  
  for (const user of users) {
    const result = await sendGroupSignupNotification(user, opportunity, paUser);
    results.push({
      email: user.email,
      name: user.name,
      ...result
    });
  }
  
  return results;
};