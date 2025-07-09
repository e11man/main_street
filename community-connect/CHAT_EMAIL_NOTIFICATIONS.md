# Chat Email Notifications System

## Overview

The Chat Email Notifications system automatically sends email notifications to all participants in a chat conversation when new messages are posted. This feature ensures that users and companies stay informed about ongoing conversations even when they're not actively browsing the platform.

## Features

### ✅ Core Functionality
- **Automatic Email Notifications**: Emails are sent when new chat messages are posted
- **30-minute Rate Limiting**: Prevents spam by limiting emails to once every 30 minutes per recipient per chat
- **Sender Exclusion**: The person sending the message doesn't receive an email notification
- **Smart Notification Logic**: 
  - **Admin Messages**: When admin sends as host, only the organization owner receives notification
  - **Company Messages**: When company sends, all committed users receive notifications
  - **User Messages**: When user sends, company and other committed users receive notifications
- **Beautiful Email Templates**: Professional-looking emails with message previews and opportunity details
- **Robust Error Handling**: Email failures don't break the chat functionality

### 🎯 Rate Limiting Details
- **30-minute cooldown** per recipient per chat opportunity
- **Database-tracked**: Uses MongoDB collection to track last notification times
- **Automatic cleanup**: Old notification records are automatically deleted after 7 days via TTL index
- **Graceful degradation**: If rate limiting check fails, emails are still sent (fail-safe approach)

### 📧 Notification Logic by Sender Type
- **Admin as Host (`admin_as_host`)**: 
  - Only the organization owner (company email) receives notification
  - Users who committed to the opportunity do NOT receive notifications
  - This prevents spam when admins send messages on behalf of companies
  
- **Company (`organization`)**: 
  - All users who committed to the opportunity receive notifications
  - Company email is excluded if the company is the sender
  - Ensures all volunteers are informed of company communications
  
- **User (`user`)**: 
  - Company receives notification (organization owner)
  - All other users who committed to the opportunity receive notifications
  - Sender is excluded from notifications

### 📧 Email Content
- **Message preview**: First 100 characters of the chat message
- **Opportunity details**: Event name, date, location
- **Sender information**: Who sent the message
- **Professional styling**: Branded email template with gradients and proper formatting
- **Call-to-action**: Direct link back to the platform to continue the conversation

## Technical Implementation

### Database Schema

#### `emailNotifications` Collection
```javascript
{
  _id: ObjectId,
  opportunityId: ObjectId,        // Reference to the opportunity
  recipientEmail: String,         // Email address of the recipient
  lastSentAt: Date               // When the last email was sent
}
```

#### Indexes
- **Compound Index**: `{ opportunityId: 1, recipientEmail: 1 }` - Optimizes rate limiting queries
- **TTL Index**: `{ lastSentAt: 1 }` with 7-day expiration - Automatic cleanup
- **Performance Index**: `{ lastSentAt: 1 }` - Optimizes time-based queries
- **Lookup Index**: `{ recipientEmail: 1 }` - General email queries

### API Integration

The email notifications are triggered automatically from the `/api/chat/messages` endpoint when new messages are posted:

```javascript
// In pages/api/chat/messages.js
import { sendChatNotifications } from '../../../lib/emailUtils';

// After successfully inserting a chat message
const emailResults = await sendChatNotifications(
  opportunityId, 
  senderEmail, 
  senderName, 
  message,
  senderType // 'user', 'organization', or 'admin_as_host'
);
```

### Core Functions

#### `sendChatNotifications(opportunityId, senderEmail, senderName, message, senderType)`
Main function that orchestrates the email notification process.

**Parameters:**
- `opportunityId`: The ID of the opportunity/chat room
- `senderEmail`: Email of the person sending the message (excluded from notifications)
- `senderName`: Display name of the sender
- `message`: The chat message content
- `senderType`: Type of sender ('user', 'organization', 'admin_as_host') - determines notification logic

**Returns:**
```javascript
{
  success: boolean,
  emailsSent: number,
  rateLimited: number,
  failed: number,
  participants: [
    {
      email: string,
      name: string,
      type: 'user' | 'company',
      status: 'sent' | 'rate_limited' | 'failed' | 'error'
    }
  ]
}
```

#### `getChatParticipants(opportunityId, senderEmail, senderType)`
Identifies participants based on sender type:
- **Admin as Host (`admin_as_host`)**: Only notifies the organization owner (company email)
- **Company (`organization`)**: Notifies all committed users (excludes company if same sender)
- **User (`user`)**: Notifies company and all other committed users
- Always excludes the sender from notifications

#### `shouldSendEmailNotification(opportunityId, recipientEmail)`
Checks if an email should be sent based on the 30-minute rate limiting rule.

#### `recordEmailNotificationSent(opportunityId, recipientEmail)`
Records that an email notification was sent to enable rate limiting for future messages.

## Setup Instructions

### 1. Environment Variables
Ensure these environment variables are set in your `.env.local` file:

```bash
# Email configuration (same as 2FA system)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password

# Optional: Site URL for email links
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 2. Database Setup
Run the setup script to create necessary indexes:

```bash
npm run setup-email-notifications
```

This will create:
- Optimized indexes for rate limiting queries
- TTL index for automatic cleanup of old records
- Performance indexes for email lookups

### 3. Verify Build
Ensure the application builds successfully:

```bash
npm run build
```

### 4. Test the System
You can test the email notifications by:
1. Setting up test users and companies
2. Creating opportunities with participants
3. Sending chat messages
4. Checking email delivery and rate limiting

## Email Template Structure

### Subject Line
```
New Message in [Opportunity Title] Chat
```

### Email Content
- **Header**: Branded gradient header with Community Connect logo
- **Greeting**: Personalized greeting to recipient
- **Message Context**: Explanation of the notification with sender name
- **Message Preview**: First 100 characters of the message (with "..." if truncated)
- **Opportunity Details**: Event name, date, location in a highlighted box
- **Call-to-Action**: Button linking back to the platform
- **Footer**: Branding and rate limiting notice

### Rate Limiting Notice
```
Note: To prevent spam, you'll only receive one email notification every 30 minutes per chat.
```

## Error Handling

### Graceful Degradation
- **Email server issues**: Chat messages still post successfully
- **Rate limiting failures**: Emails are sent by default
- **Database errors**: Non-critical errors don't break functionality
- **Missing data**: Handles missing users, companies, or opportunities gracefully

### Logging
All email operations are logged with appropriate levels:
- **Info**: Successful email sends, rate limiting actions
- **Warnings**: Missing sender information, no participants found
- **Errors**: Email sending failures, database connection issues

## Performance Considerations

### Database Optimization
- **Compound indexes** ensure O(log n) rate limiting lookups
- **TTL indexes** automatically clean up old data
- **Background index creation** doesn't block application startup

### Email Efficiency
- **Batch processing**: All emails for a message are processed together
- **Asynchronous sending**: Doesn't block the chat message API response
- **Connection reuse**: Single SMTP connection for multiple emails

### Rate Limiting Benefits
- **Prevents spam**: Users don't get overwhelmed with notifications
- **Reduces server load**: Fewer emails = less SMTP usage
- **Better user experience**: More meaningful notifications

## Monitoring and Maintenance

### Logs to Monitor
```bash
# Successful notifications
Chat notifications completed: 3 sent, 1 rate limited, 0 failed

# Rate limiting in action
Rate limited: user@example.com for opportunity 507f1f77bcf86cd799439011

# Email sending status
Chat notification email sent to user@example.com: <message-id>
```

### Database Maintenance
The TTL index automatically handles cleanup, but you can manually check collection size:

```javascript
// In MongoDB shell
db.emailNotifications.stats()
db.emailNotifications.find().count()
```

### Email Delivery Monitoring
Monitor your email service provider's dashboard for:
- Delivery rates
- Bounce rates
- Spam complaints
- SMTP connection errors

## Security Considerations

### Email Content
- **No sensitive data**: Only message previews and public opportunity details
- **No authentication tokens**: Recipients must log in to view full conversations
- **Rate limiting**: Prevents abuse of the email system

### Database Security
- **Indexed queries**: All queries use indexes to prevent collection scans
- **TTL cleanup**: Automatic removal of old data reduces storage footprint
- **Upsert operations**: Prevents duplicate notification records

## Troubleshooting

### Common Issues

#### 1. Emails Not Sending
**Symptoms**: Chat works but no emails are received
**Solutions**:
- Check `EMAIL_USER` and `EMAIL_PASS` environment variables
- Verify Gmail app password configuration
- Check server logs for SMTP errors
- Test with a simple email send

#### 2. Rate Limiting Not Working
**Symptoms**: Users receive too many emails
**Solutions**:
- Verify database indexes are created: `npm run setup-email-notifications`
- Check MongoDB connection
- Review rate limiting logs

#### 3. Missing Participants
**Symptoms**: Some users don't receive notifications
**Solutions**:
- Verify users have committed to the opportunity
- Check company email configuration
- Ensure participants have valid email addresses

#### 4. Build Failures
**Symptoms**: `npm run build` fails
**Solutions**:
- Run `npm install` to ensure dependencies are installed
- Check for syntax errors in modified files
- Verify all imports are correct

### Debug Mode
Enable debug logging by setting:
```bash
NODE_ENV=development
```

This will show detailed logs for:
- Participant discovery
- Rate limiting decisions
- Email sending attempts
- Database operations

## Future Enhancements

### Potential Improvements
1. **User Preferences**: Allow users to configure email frequency
2. **Digest Emails**: Bundle multiple messages into daily/weekly summaries  
3. **Push Notifications**: Add mobile/browser push notifications
4. **Email Templates**: Multiple template options for different event types
5. **Analytics**: Track email open rates and click-through rates
6. **Internationalization**: Multi-language email templates

### Scalability Considerations
- **Email Queues**: For high-volume deployments, consider using email queues (Redis, Bull)
- **Database Sharding**: Partition emailNotifications collection by opportunityId
- **CDN Assets**: Host email images and assets on CDN for faster loading
- **Email Service**: Consider dedicated email services (SendGrid, Mailgun) for production

## Support

For issues or questions about the chat email notification system:

1. Check the troubleshooting section above
2. Review server logs for error messages  
3. Test with the provided test suite: `npm test chat-email-notifications.test.js`
4. Verify database indexes: `npm run setup-email-notifications`

---

*This system was designed with reliability, performance, and user experience in mind. The 30-minute rate limiting ensures users stay informed without being overwhelmed, while the robust error handling ensures chat functionality remains unaffected even if email services are unavailable.*