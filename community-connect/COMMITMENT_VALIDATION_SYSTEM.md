# Commitment Validation System

## Overview

The commitment validation system automatically checks and cleans up invalid commitments when users log in. This ensures that users always have accurate commitment counts and can sign up for new opportunities when their old commitments are no longer valid.

## How It Works

### Automatic Validation on Login

When a user logs in, the system automatically:

1. **Checks for commitments**: If the user has any commitments in their array
2. **Validates each commitment**: For each commitment, it:
   - Looks up the opportunity in the database
   - Checks if the opportunity still exists
   - Verifies the opportunity date is not in the past
3. **Removes invalid commitments**: Any commitments that are:
   - For non-existent opportunities
   - For opportunities that have already passed their date
   - Have invalid date formats
4. **Updates the user**: Saves the cleaned commitment array back to the database
5. **Returns feedback**: Tells the user how many commitments were cleaned up

### Validation Criteria

A commitment is considered invalid if:

- **Opportunity doesn't exist**: The opportunity ID in the user's commitments array doesn't match any opportunity in the database
- **Opportunity is expired**: The opportunity's date is today or in the past
- **Invalid date format**: The opportunity's date field cannot be parsed

### Supported ID Formats

The system handles both old and new opportunity ID formats:

- **Numeric IDs**: Legacy format (e.g., `1`, `2`, `3`)
- **ObjectId strings**: New MongoDB format (e.g., `"507f1f77bcf86cd799439011"`)

## API Endpoints

### 1. Automatic Validation (Login)

**Endpoint**: `POST /api/users?login=true`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "userpassword"
}
```

**Response** (if commitments were cleaned):
```json
{
  "_id": "user123",
  "email": "user@example.com",
  "name": "John Doe",
  "commitments": [2, 3],
  "commitmentsCleaned": 1,
  "dorm": "Olson",
  "wing": "North"
}
```

### 2. Manual Validation (Single User)

**Endpoint**: `POST /api/users?validateCommitments=true`

**Request Body**:
```json
{
  "userId": "user123"
}
```

**Response**:
```json
{
  "_id": "user123",
  "email": "user@example.com",
  "name": "John Doe",
  "commitments": [2, 3],
  "commitmentsCleaned": 1,
  "message": "1 invalid commitment(s) were removed"
}
```

### 3. Bulk Validation (All Users)

**Endpoint**: `POST /api/users?validateAllCommitments=true`

**Request Body**: None required

**Response**:
```json
{
  "message": "Cleaned up 5 invalid commitment(s) across 3 user(s)",
  "totalUsersProcessed": 10,
  "totalCommitmentsCleaned": 5,
  "results": [
    {
      "userId": "user123",
      "email": "user1@example.com",
      "commitmentsCleaned": 2
    },
    {
      "userId": "user456",
      "email": "user2@example.com",
      "commitmentsCleaned": 1
    }
  ]
}
```

## Implementation Details

### Helper Function

The core validation logic is in the `validateUserCommitments` helper function:

```javascript
async function validateUserCommitments(user, usersCollection, opportunitiesCollection) {
  // Returns { validCommitments: [], removedCount: 0 }
}
```

### Database Operations

The system performs these database operations:

1. **Read**: Fetches user data and their commitments
2. **Query**: Looks up each commitment in the opportunities collection
3. **Validate**: Checks opportunity existence and date validity
4. **Update**: Saves cleaned commitment array back to user document
5. **Log**: Records cleanup operations for monitoring

### Error Handling

The system handles various error scenarios:

- **Invalid dates**: If an opportunity's date field is malformed, the commitment is removed
- **Missing opportunities**: If an opportunity doesn't exist, the commitment is removed
- **Database errors**: Logs errors but doesn't fail the entire login process

## Benefits

### For Users

- **Accurate commitment counts**: Users always see their real available slots
- **Automatic cleanup**: No manual intervention required
- **Immediate feedback**: Users are notified when commitments are cleaned up
- **Open slots**: Invalid commitments are removed, freeing up space for new signups

### For Administrators

- **Data integrity**: Ensures commitment data is always accurate
- **Monitoring**: Logs all cleanup operations for audit trails
- **Bulk operations**: Can clean up all users' commitments at once
- **Manual control**: Can validate specific users when needed

### For the System

- **Performance**: Prevents accumulation of invalid data
- **Reliability**: Ensures commitment limits work correctly
- **Maintenance**: Reduces manual data cleanup tasks
- **Scalability**: Handles both individual and bulk operations efficiently

## Testing

The system includes comprehensive tests in `tests/commitment-validation.test.js` that verify:

- Empty commitment arrays are handled correctly
- Expired commitments are removed
- Non-existent commitments are removed
- Both ID formats are supported
- Login process includes validation

## Monitoring

The system logs all cleanup operations:

```
Removing expired commitment for user user123: opportunity "Food Drive" (date: 2024-01-15)
Removing invalid commitment for user user123: commitment ID 999 not found
Cleaned up 2 invalid commitments for user user123
```

## Future Enhancements

Potential improvements to consider:

1. **Scheduled cleanup**: Run validation periodically for all users
2. **Email notifications**: Notify users when commitments are removed
3. **Admin dashboard**: Show commitment validation statistics
4. **Batch processing**: Process large numbers of users more efficiently
5. **Metrics tracking**: Track validation patterns and success rates