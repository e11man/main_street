# PA (Program Assistant) Functionality

This document outlines the enhanced PA functionality that allows Program Assistants to manage volunteer opportunities and add users to events.

## Features Implemented

### 1. PA Role Management
- **Admin Control**: Admins can assign/remove PA roles from any user through the admin dashboard
- **Role-Based Access**: Only users with `role: 'pa'` can access PA-specific features
- **Navigation**: PA users see a "PA Dashboard" link in the header when logged in

### 2. PA Dashboard (`/pa-dashboard`)
- **Opportunity Management**: View all available volunteer opportunities
- **User Addition**: Add any user to events with proper validation
- **Smart Recommendations**: Users from the same dorm as the PA are prioritized
- **Email Search**: Search for users by name or email
- **Custom Email Addition**: Add any user by entering their email directly

### 3. Email Notifications
- **Automatic Emails**: Users receive email notifications when added to events by PAs
- **Event Details**: Emails include complete event information (title, date, time, location, description)
- **PA Attribution**: Emails mention which PA added them to the event

### 4. Smart Validation
- **Capacity Checking**: Prevents adding users when events are full
- **Duplicate Prevention**: Prevents adding users who are already committed to an event
- **Commitment Limit**: Enforces the 2-commitment limit per user
- **Real-time Updates**: Spot counts and user recommendations update immediately

### 5. Floor/Dorm-Based Recommendations
- **Priority System**: Users from the same dorm as the PA appear first
- **Visual Indicators**: Same-dorm users have green highlighting
- **Flexible Addition**: PAs can still add anyone, regardless of dorm

## How to Use

### For Admins: Setting Up PAs

1. **Login to Admin Dashboard**: Go to `/admin` and login
2. **Navigate to Users Tab**: Click on "Users" in the admin dashboard
3. **Assign PA Role**: Click "Make PA" button next to any user
4. **Remove PA Role**: Click "Remove PA" button for existing PAs

### For PAs: Managing Events

1. **Login**: Use your regular user credentials to login
2. **Access Dashboard**: Click "PA Dashboard" in the navigation menu
3. **Select Opportunity**: Click on any opportunity card to select it
4. **Add Users**: 
   - **By Email**: Enter any user's email in the "Add user by email" field
   - **By Search**: Use the search box to find recommended users from your dorm
5. **Monitor Capacity**: View real-time spot availability for each event

### API Endpoints

#### PA-Specific Endpoints
- `POST /api/pa/add-user-to-event` - Add a user to an event
- `GET /api/pa/get-user-recommendations` - Get recommended users for an event

#### Admin Endpoints
- `POST /api/admin/manage-pa-role` - Assign or remove PA roles

## Testing Setup

### Create a Test PA User
Run the provided script to create a test PA user:
```bash
node scripts/create-pa-user.js
```

This creates:
- **Email**: pa@taylor.edu
- **Password**: pa123
- **Role**: pa
- **Dorm**: Berg

### Test Flow
1. Login as admin and create some test opportunities
2. Login as the PA user (pa@taylor.edu / pa123)
3. Navigate to PA Dashboard
4. Select an opportunity and try adding users
5. Check that email notifications are sent (if email is configured)

## Database Schema Changes

### User Schema Updates
Users now have a `role` field:
```javascript
{
  name: String,
  email: String,
  password: String,
  dorm: String,
  role: String, // 'user' (default) or 'pa'
  commitments: Array,
  createdAt: Date
}
```

## Email Configuration

For email notifications to work, ensure these environment variables are set in `.env.local`:
```
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
```

## Security Features

- **Role Verification**: All PA endpoints verify user has PA role
- **Input Validation**: Comprehensive validation on all inputs
- **Error Handling**: Graceful error handling with user-friendly messages
- **Permission Checks**: Only PAs can access PA-specific functionality

## Error Handling

The system handles various edge cases:
- User not found
- Event at capacity
- User already committed
- User at commitment limit
- Email sending failures (non-blocking)
- Invalid PA permissions

## Future Enhancements

Potential improvements for the PA system:
- Bulk user addition
- Event-specific announcements
- PA analytics dashboard
- Custom email templates
- Mobile-responsive design improvements
- Integration with external calendar systems

## Technical Implementation

### Frontend Components
- `pages/pa-dashboard.js` - Main PA dashboard interface
- Enhanced header navigation for PA users
- Real-time updates and feedback

### Backend APIs
- Role-based authentication middleware
- Email notification system
- Smart recommendation algorithms
- Comprehensive validation layers

### Database Integration
- MongoDB collections for users and opportunities
- Atomic operations for data consistency
- Efficient querying for recommendations