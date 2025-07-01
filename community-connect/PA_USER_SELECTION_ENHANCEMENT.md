# PA User Selection Enhancement

## Overview
Enhanced the PA (Peer Advisor) group signup functionality to allow PAs to select from any user in the system while defaulting to show users from their dorm first, providing better flexibility while maintaining the convenience of dorm-prioritized selection.

## Changes Made

### 1. API Enhancement (`/api/users/floor-users`)

**File**: `community-connect/pages/api/users/floor-users.js`

**Key Changes**:
- **Expanded User Access**: Modified the API to return all users instead of just dorm users
- **Smart Sorting**: When no specific dorm filter is applied, users are sorted with dorm users first, then others alphabetically
- **Maintained Filtering**: When `dorm` parameter is provided, still filters to show only that dorm's users
- **Search Functionality**: Enhanced to work across all users while respecting dorm filtering

**Behavior**:
- Default: Shows all users with PA's dorm users listed first
- With `dorm` parameter: Shows only users from specified dorm
- With `search` parameter: Searches across all users (or filtered dorm if specified)
- Sorting: Alphabetical within each group (dorm users, then other users)

### 2. UI Enhancement (`GroupSignupModal`)

**File**: `community-connect/components/Opportunities/GroupSignupModal.jsx`

**Key Changes**:
- **Filter Toggle**: Added checkbox to toggle between "all users" and "dorm only" views
- **Visual Indicators**: Added "Your Dorm" badge to distinguish dorm users from others
- **Improved Messaging**: Updated help text to reflect new functionality
- **Dynamic URL Building**: Constructs API URLs based on filter state
- **Auto-refresh**: Filter changes automatically trigger user list refresh

**New Features**:
1. **Dorm Filter Toggle**: 
   - Checkbox to show only users from PA's dorm
   - Automatically refreshes list when toggled
   - Remembers state during search operations

2. **Enhanced User Display**:
   - "Your Dorm" badge for same-dorm users
   - Maintains existing "PA" badges
   - Clear indication of user's dorm and commitment status

3. **Improved Help Text**:
   - Shows current filter state (all users vs dorm only)
   - Indicates when dorm users are prioritized
   - Updates dynamically based on search and filter state

## User Experience

### For PA Users:
1. **Default View**: See all users with their dorm users at the top
2. **Quick Dorm Filter**: Check box to see only dorm users
3. **Visual Clarity**: Easy identification of dorm vs non-dorm users
4. **Flexible Search**: Search across all users or within filtered dorm
5. **Maintained Functionality**: All existing features (selection limits, validation) remain

### Filter States:
- **All Users (Default)**: Shows everyone, dorm users first
- **Dorm Only**: Shows only users from PA's dorm
- **Search + All**: Search results from all users
- **Search + Dorm**: Search results from PA's dorm only

## Technical Implementation

### API Logic:
```javascript
// Default: Return all users, sorted with dorm users first
if (!dorm && requestingUser.dorm) {
  const dormUsers = allUsers.filter(user => user.dorm === requestingUser.dorm);
  const otherUsers = allUsers.filter(user => user.dorm !== requestingUser.dorm);
  sortedUsers = [...dormUsers, ...otherUsers];
}
```

### UI State Management:
```javascript
const [showOnlyDorm, setShowOnlyDorm] = useState(false);

// URL construction with conditional dorm filter
let url = `/api/users/floor-users?userId=${currentUser._id}&search=${searchTerm}`;
if (showOnlyDorm && currentUser.dorm) {
  url += `&dorm=${encodeURIComponent(currentUser.dorm)}`;
}
```

## Benefits

1. **Increased Flexibility**: PAs can now sign up users from anywhere while maintaining the convenience of prioritizing their own dorm users
2. **Maintained Convenience**: Dorm users still appear first by default
3. **Better Discovery**: Easy access to all users when needed
4. **Intuitive Interface**: Clear visual indicators and filtering options
5. **Backward Compatibility**: All existing functionality preserved

## Security & Validation

- **Authorization**: Maintained PA/Admin only access
- **Data Safety**: No sensitive information exposed
- **Input Validation**: Proper handling of search and filter parameters
- **Error Handling**: Graceful fallbacks for all scenarios

This enhancement provides PAs with the flexibility to sign up users from anywhere while maintaining the convenience of prioritizing their own dorm users, creating a more versatile and user-friendly group signup experience.