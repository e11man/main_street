# Admin Email Management Feature

## Overview

The admin console now includes a comprehensive email management system that allows administrators to send emails to users, PAs, and organizations with event information. This feature integrates seamlessly with the existing admin dashboard.

## Features

### 📧 **Email Composition**
- **Recipient Selection**: Choose from users, PAs, and organizations
- **Event Integration**: Select specific events to include in email body
- **Custom Content**: Write custom subject and body text
- **Preview**: See recipient count and selected events before sending

### 🎯 **Recipient Management**
- **Users**: All registered users in the system
- **PAs**: Users with PA (Peer Advisor) role
- **Organizations**: All approved organizations
- **Multiple Selection**: Select multiple recipients from each category

### 📅 **Event Integration**
- **Event Selection**: Choose from available opportunities/events
- **Automatic Formatting**: Event details are automatically formatted in email body
- **Rich Information**: Includes event title, date, time, location, description, organization, and availability

### 🔧 **Technical Implementation**

#### Frontend Components
- **Email Tab**: New tab in admin console (`/admin`)
- **Recipient Selection**: Multi-select dropdowns for each recipient type
- **Event Selection**: Multi-select dropdown for events
- **Email Preview**: Real-time preview of email content
- **Loading States**: Visual feedback during email preparation

#### Backend API
- **Endpoint**: `/api/admin/email`
- **Method**: POST
- **Authentication**: Admin-only access
- **Features**:
  - Recipient validation
  - Event data integration
  - Email logging for audit purposes
  - Mailto link generation

#### Database Integration
- **Email Logs**: All email actions are logged in `emailLogs` collection
- **Audit Trail**: Tracks admin user, recipients, subject, body, and events
- **Status Tracking**: Email status and timestamps

## How to Use

### Accessing Email Management
1. Log into the admin console (`/admin`)
2. Navigate to the **Email** tab
3. The interface is divided into three sections:
   - Recipients Selection (left)
   - Event Selection (middle)
   - Email Preview (right)

### Selecting Recipients
1. **Users**: Scroll through the users list and select desired recipients
2. **PAs**: Select from users with PA role
3. **Organizations**: Choose from approved organizations
4. **Multiple Selection**: Hold Ctrl/Cmd to select multiple items

### Adding Event Information
1. **Event Selection**: Choose events from the middle panel
2. **Automatic Integration**: Selected events are automatically formatted and added to email body
3. **Event Details**: Each event includes:
   - Title and date
   - Arrival and departure times
   - Location and description
   - Organization name
   - Available spots

### Composing Email
1. **Subject**: Enter a custom subject line
2. **Body**: Write your email content
3. **Preview**: Review recipient count and selected events
4. **Send**: Click "Open in Email Client" to open your default email application

### Email Client Integration
- **Mailto Link**: Automatically generates a mailto link with all recipients and content
- **Default Client**: Opens in your system's default email client
- **Formatting**: Event information is properly formatted in the email body
- **Recipient Count**: Shows confirmation of how many recipients will receive the email

## Security Features

### Authentication
- **Admin Only**: Only authenticated admin users can access email functionality
- **Session Management**: Integrates with existing admin session system
- **Token Validation**: All API calls require valid admin authentication

### Audit Logging
- **Email Logs**: All email actions are logged with:
  - Admin user ID and email
  - Recipient list
  - Subject and body content
  - Selected events
  - Timestamp and status

### Data Validation
- **Recipient Validation**: Ensures all recipients exist in the database
- **Event Validation**: Verifies selected events are valid
- **Input Sanitization**: All user inputs are properly validated

## Technical Details

### API Endpoint Structure
```javascript
POST /api/admin/email
{
  "recipients": [
    { "type": "user", "id": "user_id", "email": "user@example.com" },
    { "type": "organization", "id": "org_id", "email": "org@example.com" },
    { "type": "pa", "id": "pa_id", "email": "pa@example.com" }
  ],
  "events": [
    {
      "_id": "event_id",
      "title": "Event Title",
      "date": "2025-01-15",
      "arrivalTime": "09:00",
      "departureTime": "17:00",
      "location": "Event Location",
      "description": "Event Description",
      "organizationName": "Organization Name",
      "spotsTotal": 20,
      "spotsFilled": 5
    }
  ],
  "subject": "Email Subject",
  "body": "Email body content"
}
```

### Response Format
```javascript
{
  "success": true,
  "mailtoLink": "mailto:recipient1@example.com,recipient2@example.com?subject=...&body=...",
  "recipientCount": 5,
  "logId": "email_log_id"
}
```

### Database Schema (emailLogs collection)
```javascript
{
  "_id": ObjectId,
  "adminId": "admin_user_id",
  "adminEmail": "admin@example.com",
  "recipients": ["user1@example.com", "user2@example.com"],
  "subject": "Email Subject",
  "body": "Email body with event information",
  "events": [...],
  "createdAt": Date,
  "status": "composed"
}
```

## Error Handling

### Common Error Scenarios
- **No Recipients**: Alert if no recipients are selected
- **Invalid Recipients**: Validation of recipient email addresses
- **API Errors**: Proper error messages for network issues
- **Authentication**: Session expiration handling

### User Feedback
- **Loading States**: Visual feedback during email preparation
- **Success Messages**: Confirmation of email preparation
- **Error Messages**: Clear error descriptions
- **Recipient Count**: Shows number of recipients before sending

## Future Enhancements

### Potential Improvements
- **Email Templates**: Pre-defined email templates
- **Scheduled Emails**: Send emails at specific times
- **Email History**: View previously sent emails
- **Bulk Operations**: Send to all users/organizations with one click
- **Email Analytics**: Track email open rates and engagement
- **Rich Text Editor**: Enhanced email composition interface

### Integration Opportunities
- **Notification System**: Integrate with existing notification system
- **Event Reminders**: Automatic email reminders for upcoming events
- **Newsletter System**: Regular community updates
- **Survey Distribution**: Send surveys to specific user groups

## Support

For technical support or questions about the email management feature, please refer to the main project documentation or contact the development team.