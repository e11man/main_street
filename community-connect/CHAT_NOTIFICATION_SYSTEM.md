# Chat Notification System

## Overview

The Chat Notification System provides comprehensive email notifications for chat messages in Community Connect. Both users and organizations can configure their notification preferences to receive emails according to their preferred frequency.

## Features

### Notification Frequencies

- **Never**: No email notifications sent
- **Immediate**: Email sent as soon as a new message is posted (with 30-minute rate limiting)
- **Every 5 minutes**: Batched notifications sent every 5 minutes
- **Every 30 minutes**: Batched notifications sent every 30 minutes

### User Management

- **User Dashboard**: Users can manage their notification preferences at `/user-dashboard`
- **Organization Dashboard**: Organizations can manage their notification preferences at `/organization-dashboard`
- **API Endpoints**: RESTful APIs for updating notification settings

## System Architecture

### Database Collections

1. **users** - Stores user data including `chatNotificationFrequency`
2. **companies** - Stores organization data including `chatNotificationFrequency`
3. **chatMessages** - Stores chat messages
4. **emailNotifications** - Tracks sent notifications to prevent spam
5. **pendingNotifications** - Stores notifications waiting to be sent (for batched notifications)

### Key Components

1. **emailUtils.js** - Core email sending functionality
2. **notificationJobSystem.js** - Handles batched notification processing
3. **User Dashboard** - User interface for managing preferences
4. **Organization Dashboard** - Organization interface for managing preferences
5. **API Endpoints** - Backend APIs for updating preferences

## Setup Instructions

### 1. Environment Variables

Ensure these environment variables are set in your `.env.local` file:

```bash
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/mainStreetOpportunities

# Email Configuration (Gmail example)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Application URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2. Database Setup

The system automatically creates required collections and indexes. Run the setup script to verify everything is configured correctly:

```bash
npm run setup-notification-system
```

### 3. Start the Application

```bash
npm run dev
```

### 4. Run Tests

```bash
npm run test:notifications
```

## Usage

### For Users

1. **Access User Dashboard**: Navigate to `/user-dashboard`
2. **Configure Notifications**: Click "Configure Notifications" button
3. **Select Frequency**: Choose from Never, Immediate, Every 5 minutes, or Every 30 minutes
4. **Save Settings**: Click "Save Settings" to update preferences

### For Organizations

1. **Access Organization Dashboard**: Navigate to `/organization-dashboard`
2. **Configure Notifications**: Click "Configure Notifications" button
3. **Select Frequency**: Choose from Never, Immediate, Every 5 minutes, or Every 30 minutes
4. **Save Settings**: Click "Save Settings" to update preferences

### API Usage

#### Update User Notification Settings

```javascript
PUT /api/users/notification-settings
Content-Type: application/json

{
  "userId": "user_id_here",
  "chatNotificationFrequency": "immediate"
}
```

#### Update Organization Notification Settings

```javascript
PUT /api/organizations/notification-settings
Content-Type: application/json

{
  "organizationId": "org_id_here",
  "chatNotificationFrequency": "5min"
}
```

#### Process Batched Notifications (Admin)

```javascript
POST /api/admin/process-notifications
```

## How It Works

### Immediate Notifications

1. When a chat message is posted, the system identifies all participants
2. For participants with "immediate" preference, emails are sent immediately
3. Rate limiting prevents spam (30-minute minimum interval between emails)

### Batched Notifications (5min/30min)

1. Chat messages are stored in the database
2. A cron job runs every minute to check for pending notifications
3. For participants with batched preferences, notifications are sent according to their frequency
4. Multiple messages are batched into a single email

### Never Notifications

1. Participants with "never" preference are completely excluded from email notifications
2. No emails are sent regardless of message activity

## Email Templates

### Immediate Notifications

- **Subject**: "New Message in [Opportunity Title] Chat"
- **Content**: Includes sender name and message preview
- **Action**: Link to view full conversation

### Batched Notifications

- **Subject**: "New Messages in [Opportunity Title] Chat"
- **Content**: Summary of message count and latest sender
- **Action**: Link to view full conversation

## Testing

### Automated Tests

Run the comprehensive test suite:

```bash
npm run test:notifications
```

The test suite covers:
- User and organization creation
- Notification preference storage
- Immediate notification sending
- Batched notification processing
- Email system functionality
- Database operations

### Manual Testing

1. **Create Test Users/Organizations**: Use the test script to create test accounts
2. **Send Chat Messages**: Post messages in chat interfaces
3. **Verify Emails**: Check email delivery for different notification frequencies
4. **Test Rate Limiting**: Verify that immediate notifications respect the 30-minute limit

## Monitoring and Maintenance

### Logs

The system logs all notification activities:

```javascript
// Example log entries
console.log(`Sent immediate notification to ${email} for opportunity ${opportunity.title}`);
console.log(`Processing ${frequency} batched notifications for ${count} recipients`);
console.log(`Notifications disabled for ${email}`);
```

### Database Maintenance

Regular cleanup tasks:

1. **Old Notifications**: Remove notification records older than 30 days
2. **Pending Notifications**: Clean up processed pending notifications
3. **Rate Limiting**: Maintain email notification history for rate limiting

### Performance Considerations

1. **Database Indexes**: Ensure proper indexes on frequently queried fields
2. **Email Batching**: Batch emails to reduce SMTP overhead
3. **Rate Limiting**: Prevent email spam and respect provider limits

## Troubleshooting

### Common Issues

#### Emails Not Sending

1. **Check Environment Variables**: Verify EMAIL_USER and EMAIL_PASS are set
2. **Check SMTP Settings**: Ensure email provider allows SMTP access
3. **Check Database Connection**: Verify MongoDB connection is working
4. **Check Logs**: Look for error messages in console output

#### Notifications Not Respecting Preferences

1. **Check Database**: Verify notification frequency is stored correctly
2. **Check API Calls**: Ensure preference updates are successful
3. **Check Cache**: Clear any cached user/organization data

#### Batched Notifications Not Working

1. **Check Cron Job**: Ensure notification processing is running
2. **Check Database**: Verify pending notifications are being created
3. **Check Time Windows**: Ensure correct time calculations for batching

### Debug Mode

Enable debug logging by setting:

```bash
DEBUG_NOTIFICATIONS=true
```

This will provide detailed logging of all notification operations.

## Security Considerations

1. **Email Validation**: All email addresses are validated before sending
2. **Rate Limiting**: Prevents email spam and abuse
3. **Authentication**: API endpoints require proper authentication
4. **Data Privacy**: Only necessary information is included in emails

## Future Enhancements

1. **Push Notifications**: Add mobile push notification support
2. **SMS Notifications**: Add SMS notification option
3. **Custom Templates**: Allow organizations to customize email templates
4. **Advanced Scheduling**: Support for custom notification schedules
5. **Analytics**: Track notification engagement and effectiveness

## Support

For issues or questions about the notification system:

1. Check the troubleshooting section above
2. Review the test logs for error details
3. Verify environment configuration
4. Check database connectivity and data integrity

## API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/users/notification-settings` | Update user notification preferences |
| PUT | `/api/organizations/notification-settings` | Update organization notification preferences |
| GET | `/api/users/commitments` | Get user commitments with opportunity details |
| POST | `/api/admin/process-notifications` | Process batched notifications (admin only) |

### Data Models

#### User Notification Settings
```javascript
{
  userId: ObjectId,
  chatNotificationFrequency: "never" | "immediate" | "5min" | "30min"
}
```

#### Organization Notification Settings
```javascript
{
  organizationId: ObjectId,
  chatNotificationFrequency: "never" | "immediate" | "5min" | "30min"
}
```

#### Email Notification Record
```javascript
{
  opportunityId: ObjectId,
  recipientEmail: String,
  lastSentAt: Date,
  batchFrequency: String,
  messageCount: Number
}
```