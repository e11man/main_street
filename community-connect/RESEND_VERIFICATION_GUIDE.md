# Resend Verification Code Feature

## Overview

This feature allows users to request a new verification code when logging in, with a built-in 2-minute rate limit to prevent abuse.

## API Endpoint

### Resend Verification Code

**Endpoint:** `POST /api/users?resendCode=true`

**Request Body:**
```json
{
  "email": "user@taylor.edu"
}
```

**Response Scenarios:**

#### Success (200)
```json
{
  "message": "New verification code sent to your email."
}
```

#### Rate Limited (429)
```json
{
  "error": "Please wait 45 seconds before requesting a new code.",
  "remainingTime": 45
}
```

#### No Pending Verification (404)
```json
{
  "error": "No pending verification found for this email. Please sign up again."
}
```

#### Server Error (500)
```json
{
  "error": "Failed to send verification email. Please try again."
}
```

## Rate Limiting Rules

1. **2-minute cooldown**: Users must wait 2 minutes between code requests
2. **Expired codes**: If a verification code has expired (15 minutes), users can immediately request a new one
3. **First-time signup**: The initial signup process also respects the 2-minute rule for subsequent requests

## Frontend Integration

### Example JavaScript Implementation

```javascript
const resendVerificationCode = async (email) => {
  try {
    const response = await fetch('/api/users?resendCode=true', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    const data = await response.json();
    
    if (response.status === 200) {
      // Show success message
      showMessage('New verification code sent!', 'success');
    } else if (response.status === 429) {
      // Show rate limit message with countdown
      showMessage(`Please wait ${data.remainingTime} seconds`, 'warning');
      startCountdown(data.remainingTime);
    } else {
      // Show error message
      showMessage(data.error, 'error');
    }
  } catch (error) {
    showMessage('Network error. Please try again.', 'error');
  }
};

// Example countdown timer
const startCountdown = (seconds) => {
  const button = document.getElementById('resend-button');
  button.disabled = true;
  
  const interval = setInterval(() => {
    seconds--;
    button.textContent = `Resend Code (${seconds}s)`;
    
    if (seconds <= 0) {
      clearInterval(interval);
      button.disabled = false;
      button.textContent = 'Resend Code';
    }
  }, 1000);
};
```

### React Hook Example

```jsx
import { useState, useCallback } from 'react';

const useResendVerification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [message, setMessage] = useState('');
  
  const resendCode = useCallback(async (email) => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/users?resendCode=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.status === 200) {
        setMessage('New verification code sent!');
        setRemainingTime(120); // Start 2-minute countdown
      } else if (response.status === 429) {
        setMessage(data.error);
        setRemainingTime(data.remainingTime);
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    resendCode,
    isLoading,
    remainingTime,
    message,
    canResend: remainingTime === 0 && !isLoading
  };
};
```

## Database Changes

The `taylorVerification` collection now includes:
- `lastCodeSentAt`: Timestamp of when the last code was sent (used for rate limiting)

## Security Features

1. **Rate Limiting**: Prevents spam and abuse
2. **Email Validation**: Only sends codes to valid pending verifications
3. **Code Expiration**: Verification codes expire after 15 minutes
4. **Automatic Cleanup**: Expired verification records are automatically cleaned up

## Testing

Run the test file to verify functionality:
```bash
node tests/resend-verification.test.js
```

## Error Handling

The system gracefully handles:
- Network failures
- Database connection issues
- Email service outages
- Invalid email addresses
- Missing verification records

All errors are logged for debugging while providing user-friendly messages to the frontend.