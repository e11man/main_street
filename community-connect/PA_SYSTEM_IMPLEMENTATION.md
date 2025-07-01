# PA (Peer Advisor) System & Group Signup Implementation

## Overview
This implementation provides a comprehensive user promotion system and group signup functionality that allows admins to promote users to PA (Peer Advisor) roles, and enables PAs to sign up multiple users for events/opportunities simultaneously.

## Features Implemented

### 1. User Role Promotion System
- **Admin Console Enhancement**: Added ability for admins to promote any user to PA role
- **Role Management**: Support for `user`, `PA`, and `admin` roles with proper permissions
- **Visual Indicators**: PA and Admin badges displayed in user lists
- **Real-time Updates**: Immediate UI updates when roles are changed

### 2. Group Signup Functionality
- **PA-Only Access**: Only Peer Advisors and Admins can perform group signups
- **Floor-Based User Discovery**: By default shows users from PA's floor/dorm
- **Global User Search**: PAs can search for any user across the system
- **Smart Filtering**: Automatically filters out users who:
  - Already signed up for the opportunity
  - Have reached maximum commitments (2)
  - Are ineligible for other reasons

### 3. Enhanced UX Features
- **Intuitive Interface**: Clean, modern modal for group signup
- **Real-time Validation**: Immediate feedback on spot availability
- **Bulk Operations**: Sign up up to 10 users at once
- **Error Handling**: Comprehensive error messages and conflict resolution
- **Success Feedback**: Clear confirmation of successful signups

## API Endpoints Created

### `/api/admin/promote-user` (PUT)
- **Purpose**: Allows admins to promote users to different roles
- **Auth**: Admin only (protected by `protectRoute`)
- **Body**: `{ userId, role }`
- **Supported Roles**: `user`, `PA`, `admin`

### `/api/users/floor-users` (GET)
- **Purpose**: Retrieves users from PA's floor for group signup
- **Auth**: PA/Admin only
- **Query Params**: `userId`, `dorm` (optional), `search` (optional)
- **Returns**: Array of user objects with safe fields only

### `/api/users/group-signup` (POST)
- **Purpose**: Signs up multiple users for an opportunity
- **Auth**: PA/Admin only
- **Body**: `{ paUserId, opportunityId, userIds[] }`
- **Validation**: Checks spots available, user commitments, conflicts

## Components Created/Modified

### New Components
1. **`GroupSignupModal.jsx`**: Modal for group signup functionality
   - User selection interface
   - Search functionality
   - Real-time validation
   - Batch signup processing

### Modified Components
1. **`OpportunityCard.jsx`**: Added group signup button for PAs
2. **`OpportunitiesGrid.jsx`**: Passed group signup props
3. **`pages/admin.js`**: Added user promotion functionality
4. **`pages/index.js`**: Integrated group signup modal

## Database Schema Updates

### User Document Extensions
```javascript
{
  // Existing fields...
  role: 'user' | 'PA' | 'admin',  // New role field
  isPA: boolean,                   // Quick PA check
  isAdmin: boolean,                // Quick admin check
  updatedAt: Date                  // Track role changes
}
```

## User Flow Examples

### Admin Promoting a User to PA
1. Admin logs into admin console
2. Navigates to Users tab
3. Selects new role from dropdown next to user
4. Confirms promotion
5. User immediately gains PA privileges

### PA Performing Group Signup
1. PA views opportunity and clicks "Group" button
2. Modal opens showing floor members by default
3. PA can search for specific users or browse floor list
4. Selects multiple users (validates against limits)
5. Clicks "Sign Up X Users" button
6. System validates and processes all signups
7. Success message shows results

## Security & Validation

### Authorization Checks
- All PA endpoints verify `isPA` or `isAdmin` flags
- Admin endpoints require `admin` role
- Group signup validates PA permissions before processing

### Data Validation
- Maximum 10 users per group signup
- Checks opportunity spot availability
- Validates user commitment limits (2 max)
- Prevents duplicate signups
- Ensures all users exist and are valid

### Error Handling
- Comprehensive error messages for all failure scenarios
- Graceful handling of partial failures in group signup
- Clear feedback for permission issues
- Proper rollback on system errors

## Performance Optimizations

### Efficient Queries
- Single database query to fetch all users for validation
- Bulk operations for group signup processing
- Optimized floor user lookup with search indexing

### UI Performance
- Real-time validation without unnecessary API calls
- Optimistic UI updates for better user experience
- Proper loading states and error boundaries

## Future Enhancements

### Potential Improvements
1. **Bulk PA Management**: Admin interface to promote multiple users to PA
2. **PA Dashboard**: Dedicated interface for PAs to manage their responsibilities
3. **Group Notifications**: Email notifications for group signup participants
4. **Analytics**: Tracking of PA activity and group signup success rates
5. **Hierarchical Permissions**: Sub-PA roles or area-specific PA permissions

### Scalability Considerations
1. **Caching**: Cache floor user lists for frequently accessed dorms
2. **Pagination**: Add pagination for large floor user lists
3. **Rate Limiting**: Prevent abuse of group signup functionality
4. **Background Processing**: Move group signup to background jobs for large groups

## Testing Recommendations

### Key Test Scenarios
1. Admin can promote users to PA role
2. Only PAs can access group signup functionality
3. Group signup respects opportunity capacity limits
4. Users with max commitments are filtered out
5. Duplicate signups are prevented
6. Error handling works for all edge cases

This implementation provides a robust foundation for PA management and group signup functionality while maintaining excellent UX and security practices.