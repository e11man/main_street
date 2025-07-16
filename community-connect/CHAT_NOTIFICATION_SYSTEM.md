# Chat Notification System

This document describes the chat notification system that allows organizations to configure their email notification preferences for new chat messages.

## Overview

The chat notification system provides organizations with flexible control over how often they receive email notifications for new chat messages in their volunteer opportunities. Organizations can choose from four notification frequency options:

- **Never**: No email notifications are sent
- **Immediate**: Email notifications are sent as soon as a new message is posted
- **Every 5 minutes**: Batched notifications are sent every 5 minutes if there are new messages
- **Every 30 minutes**: Batched notifications are sent every 30 minutes if there are new messages

## Features

### 1. Organization Dashboard Integration

Organizations can configure their notification preferences through the organization dashboard:

- Navigate to the organization dashboard
- Click "Configure Notifications" in the Notification Settings section
- Select your preferred notification frequency
- Save your settings

### 2. Database Schema Updates

The system adds a `chatNotificationFrequency` field to the `companies` collection in MongoDB:

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  // ... other existing fields
  chatNotificationFrequency: String // 'never', 'immediate', '5min', '30min'
}
```

### 3. Smart Notification Logic

The system intelligently handles different notification frequencies:

- **Immediate**: Sends notifications right away with a 30-minute rate limit to prevent spam
- **Batched (5min/30min)**: Collects messages and sends batched notifications at the specified intervals
- **Never**: Completely disables notifications for the organization

### 4. Rate Limiting

To prevent email spam, the system implements rate limiting:

- Immediate notifications: Maximum one email per 30 minutes per opportunity
- Batched notifications: Respects the organization's chosen interval
- All notifications are logged for monitoring and debugging

## API Endpoints

### Update Notification Settings

**Endpoint**: `PUT /api/organizations/notification-settings`

**Request Body**:
```json
{
  "organizationId": "organization_id_here",
  "chatNotificationFrequency": "immediate"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Notification settings updated successfully",
  "organization": {
    // Updated organization data
  }
}
```

### Process Batched Notifications (Admin)

**Endpoint**: `POST /api/admin/process-notifications`

**Request Body**:
```json
{
  "adminKey": "your_admin_key_here",
  "action": "process" // "process", "cleanup", or "both"
}
```

## Files Modified/Created

### Frontend Files
- `pages/organization-dashboard.js` - Added notification settings UI
- `components/Modal/Modal.jsx` - Used for notification settings modal

### Backend Files
- `pages/api/organizations/notification-settings.js` - New API endpoint
- `pages/api/admin/process-notifications.js` - Admin endpoint for processing
- `lib/emailUtils.js` - Updated to respect notification preferences
- `lib/notificationJobSystem.js` - New system for batched notifications

### Scripts
- `scripts/test-notification-system.js` - Test script for verification
- `scripts/notification-cron.js` - Cron job script for batched notifications

## Setup Instructions

### 1. Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Email configuration (existing)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Admin key for notification processing (new)
ADMIN_NOTIFICATION_KEY=your_secure_admin_key_here
```

### 2. Database Setup

The system automatically adds the `chatNotificationFrequency` field to existing organizations. New organizations will have this field set to `'immediate'` by default.

### 3. Cron Job Setup

To enable batched notifications, set up cron jobs to run the notification processing:

```bash
# For 5-minute notifications (run every 5 minutes)
*/5 * * * * cd /path/to/community-connect && node scripts/notification-cron.js 5min

# For 30-minute notifications (run every 30 minutes)
*/30 * * * * cd /path/to/community-connect && node scripts/notification-cron.js 30min

# For cleanup (run daily at 2 AM)
0 2 * * * cd /path/to/community-connect && node scripts/notification-cron.js cleanup
```

### 4. Testing

Run the test script to verify the system works correctly:

```bash
cd community-connect
node scripts/test-notification-system.js
```

## Usage Examples

### Setting Up Notifications for an Organization

1. Log in to the organization dashboard
2. Click "Configure Notifications" in the Notification Settings section
3. Select your preferred frequency:
   - **Immediate**: Get notified right away for each message
   - **Every 5 minutes**: Get batched notifications every 5 minutes
   - **Every 30 minutes**: Get batched notifications every 30 minutes
   - **Never**: Disable all email notifications
4. Click "Save Settings"

### Testing Different Frequencies

1. Create test organizations with different notification frequencies
2. Send chat messages to their opportunities
3. Verify that emails are sent according to the correct intervals
4. Use the test script to automate this process

## Monitoring and Debugging

### Logs

The system logs all notification activities:

- Email sending attempts and results
- Rate limiting decisions
- Batched notification processing
- Errors and failures

### Database Collections

Monitor these collections for debugging:

- `emailNotifications` - Records of sent notifications
- `pendingNotifications` - Pending batched notifications
- `chatMessages` - Chat message history
- `companies` - Organization notification preferences

### Manual Processing

You can manually trigger notification processing:

```bash
# Process all batched notifications
curl -X POST http://localhost:3000/api/admin/process-notifications \
  -H "Content-Type: application/json" \
  -d '{"adminKey": "your_admin_key", "action": "process"}'

# Clean up old records
curl -X POST http://localhost:3000/api/admin/process-notifications \
  -H "Content-Type: application/json" \
  -d '{"adminKey": "your_admin_key", "action": "cleanup"}'
```

## Troubleshooting

### Common Issues

1. **Emails not being sent**
   - Check email configuration in environment variables
   - Verify organization notification preferences
   - Check rate limiting logs

2. **Batched notifications not working**
   - Ensure cron jobs are properly configured
   - Check the notification processing logs
   - Verify the admin key is correct

3. **High email volume**
   - Review organization notification preferences
   - Consider adjusting rate limiting settings
   - Monitor email sending logs

### Performance Considerations

- The system is designed to handle high message volumes efficiently
- Batched notifications reduce email server load
- Rate limiting prevents spam and abuse
- Old notification records are automatically cleaned up

## Security Considerations

- Admin endpoints require authentication
- Email addresses are validated and sanitized
- Rate limiting prevents abuse
- Sensitive data is not logged

## Future Enhancements

Potential improvements to consider:

- Webhook notifications for real-time integrations
- SMS notifications as an alternative to email
- Custom notification templates per organization
- Advanced filtering and notification rules
- Analytics dashboard for notification metrics