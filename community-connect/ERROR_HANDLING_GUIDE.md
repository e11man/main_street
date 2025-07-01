# Error Handling Guide

This guide documents the comprehensive error handling system implemented to prevent runtime errors and improve application stability.

## Overview

The error handling system includes:
- Global error handlers for uncaught exceptions
- Centralized error logging and categorization
- API middleware for common validations
- Enhanced database connection error handling
- JWT authentication error improvements

## Files Added/Modified

### New Files
- `lib/errorHandler.js` - Central error handling utilities
- `lib/apiMiddleware.js` - Common API middleware functions
- `ERROR_HANDLING_GUIDE.md` - This documentation

### Modified Files
- `lib/authUtils.js` - Enhanced JWT error handling
- `lib/mongodb.js` - Improved database connection handling
- `pages/api/admin/login.js` - Better authentication error handling
- `pages/api/contact.js` - Enhanced validation and error handling
- `pages/api/opportunities.js` - Streamlined error handling
- `.env.local` - Added missing JWT_SECRET

## Error Types

The system categorizes errors into specific types:

```javascript
const ErrorTypes = {
  VALIDATION: 'VALIDATION_ERROR',
  DATABASE: 'DATABASE_ERROR', 
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NETWORK: 'NETWORK_ERROR',
  INTERNAL: 'INTERNAL_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR'
};
```

## Usage Examples

### Using AsyncHandler

```javascript
import { asyncHandler, AppError, ErrorTypes } from '../../lib/errorHandler';

export default asyncHandler(async function handler(req, res) {
  // Your API logic here
  // Errors will be automatically caught and handled
  
  if (!req.body.email) {
    throw new AppError('Email is required', ErrorTypes.VALIDATION, 400);
  }
  
  res.status(200).json({ success: true });
});
```

### Using Middleware

```javascript
import { validateMethod, validateRequiredFields } from '../../lib/apiMiddleware';
import { asyncHandler } from '../../lib/errorHandler';

export default asyncHandler(async function handler(req, res) {
  // Validate HTTP method
  validateMethod(['POST'])(req, res);
  
  // Validate required fields
  validateRequiredFields(['name', 'email'])(req, res);
  
  // Your API logic here
});
```

### Custom Error Handling

```javascript
import { AppError, ErrorTypes, handleDatabaseError } from '../../lib/errorHandler';

try {
  // Database operation
  await db.collection('users').insertOne(userData);
} catch (error) {
  if (error.name?.includes('Mongo')) {
    throw handleDatabaseError(error);
  }
  throw new AppError('Operation failed', ErrorTypes.INTERNAL, 500);
}
```

## Environment Variables

Ensure these environment variables are set in `.env.local`:

```env
JWT_SECRET=your-super-secret-jwt-key
MONGODB_URI=your-mongodb-connection-string
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure-admin-password
```

## Error Response Format

API errors now return a consistent format:

```json
{
  "error": "Error message",
  "type": "ERROR_TYPE",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "stack": "Error stack trace (development only)"
}
```

## Global Error Handlers

The system automatically handles:
- Uncaught exceptions
- Unhandled promise rejections
- Database connection errors
- JWT token errors
- Validation errors

## Best Practices

1. **Always use asyncHandler** for API routes to catch async errors
2. **Throw AppError instances** instead of generic errors for better categorization
3. **Validate input early** using middleware functions
4. **Don't expose sensitive information** in production error messages
5. **Log errors appropriately** with context information

## Monitoring and Debugging

### Development Mode
- Full error details including stack traces
- Console logging with detailed error information
- Helpful error messages for missing environment variables

### Production Mode
- Sanitized error messages
- No stack traces exposed to clients
- Structured error logging

## Common Error Scenarios Handled

1. **Missing Environment Variables**
   - JWT_SECRET not defined
   - MongoDB URI not configured
   - Email credentials missing

2. **Database Errors**
   - Connection timeouts
   - Network errors
   - Duplicate key violations

3. **Authentication Errors**
   - Invalid JWT tokens
   - Expired tokens
   - Missing authentication

4. **Validation Errors**
   - Missing required fields
   - Invalid email formats
   - Malformed request data

5. **Rate Limiting**
   - Too many requests from same IP
   - API abuse prevention

## Testing Error Handling

To test the error handling system:

1. **Remove environment variables** temporarily to test graceful degradation
2. **Send invalid data** to API endpoints to test validation
3. **Simulate database errors** by using invalid connection strings
4. **Test rate limiting** by making rapid requests

## Troubleshooting

If you encounter errors:

1. Check the console for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure database connection is working
4. Check API request format and required fields
5. Review the error logs for specific error types

## Future Improvements

- Integration with external error monitoring services (Sentry, LogRocket)
- Enhanced rate limiting with Redis
- Automated error reporting and alerting
- Performance monitoring and metrics
- Advanced security middleware