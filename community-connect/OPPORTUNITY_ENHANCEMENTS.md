# Opportunity System Enhancements

## Overview

This document outlines the comprehensive enhancements made to the volunteer opportunity system to improve user experience, reduce questions, and implement automated cancellation logic.

## 🎯 Key Improvements

### 1. Enhanced Opportunity Creation Form

The company dashboard now includes more intuitive fields to reduce volunteer confusion:

#### New Required Fields:
- **Arrival Time**: Specific time volunteers should arrive (e.g., "Arrive by 12:00 PM")
- Clear distinction between arrival time and activity start time

#### New Optional but Recommended Fields:
- **Expected End Time**: When volunteers will be done
- **Meeting Point**: Specific location within the address (e.g., "Main entrance", "Room 101")
- **Contact Person**: Who volunteers should ask for on arrival
- **Contact Phone**: Phone number for day-of questions or if volunteers are lost/running late
- **What to Bring**: List of items volunteers should bring (work gloves, water bottle, etc.)
- **Special Instructions**: Parking info, dress code, safety requirements, etc.

#### Field Improvements:
- Better labels and descriptions for all fields
- Helpful placeholder text
- Clear indication of required vs optional fields
- Removed minimum 6 students requirement from form validation

### 2. Improved Opportunity Display

The volunteer opportunity cards now show information in a more intuitive way:

#### Key Details Section:
- **Date**: When the event takes place
- **Arrive by**: Clear arrival time instruction
- **Activity starts**: When the actual work begins
- **Expected end**: When volunteers will be done
- **Location**: Address with Google Maps link
- **Meet at**: Specific meeting point
- **Ask for**: Contact person name
- **Contact**: Phone number for questions

#### Important Info Section:
- **What to bring**: Required items
- **Special instructions**: Parking, dress code, safety info

### 3. Automated Cancellation System

#### Business Logic:
- **Minimum Threshold**: 6 volunteers required for an event to proceed
- **Deadline**: 10 PM the day before the event
- **Automatic Cancellation**: Events with fewer than 6 signups are automatically cancelled
- **Notification**: All participants receive immediate email notifications

#### How It Works:

1. **Daily Check**: A cron job runs at 10 PM daily
2. **Query**: Finds all opportunities scheduled for the next day
3. **Evaluation**: Checks signup count vs 6-person minimum
4. **Cancellation**: Marks insufficient events as cancelled
5. **Cleanup**: Removes cancelled events from user commitments
6. **Notification**: Sends cancellation emails to all affected parties

## 🛠 Technical Implementation

### Files Modified:

#### Frontend Components:
- `pages/company-dashboard.js` - Enhanced opportunity creation form
- `components/Opportunities/OpportunityCard.jsx` - Improved display layout
- `components/Opportunities/OpportunitiesGrid.jsx` - Filters out cancelled opportunities

#### Backend APIs:
- `pages/api/companies/opportunities.js` - Handles new fields, removed minimum validation
- `pages/api/opportunities/check-cancellations.js` - New automated cancellation endpoint

#### Email System:
- `lib/email.js` - Added cancellation notification functions

#### Utilities:
- `scripts/check-cancellations.js` - Manual testing script

### Database Schema Updates:

New opportunity fields:
```javascript
{
  arrivalTime: String,      // Required: Time volunteers should arrive
  departureTime: String,    // Optional: Expected end time
  meetingPoint: String,     // Optional: Specific meeting location
  contactPerson: String,    // Optional: Who to ask for on arrival
  contactPhone: String,     // Optional: Contact number for questions
  whatToBring: String,      // Optional: Items volunteers should bring
  specialInstructions: String, // Optional: Additional important details
  cancelled: Boolean,       // New: Cancellation status
  cancelledAt: Date,        // New: When it was cancelled
  cancellationReason: String // New: Why it was cancelled
}
```

## 🔧 Setup Instructions

### 1. Automated Cancellation Cron Job

#### For Production (Vercel):
1. Set up a cron job service (like EasyCron, cron-job.org, or GitHub Actions)
2. Configure it to make a POST request to your production URL:
   ```
   URL: https://your-domain.com/api/opportunities/check-cancellations
   Method: POST
   Schedule: 0 22 * * * (daily at 10 PM)
   ```

#### For Local Development:
Use the manual script for testing:
```bash
node scripts/check-cancellations.js
```

#### GitHub Actions Example:
Create `.github/workflows/cancellation-check.yml`:
```yaml
name: Daily Opportunity Cancellation Check
on:
  schedule:
    - cron: '0 22 * * *'  # 10 PM UTC daily
  workflow_dispatch:  # Allow manual trigger

jobs:
  check-cancellations:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Cancellation Check
        run: |
          curl -X POST ${{ secrets.PRODUCTION_URL }}/api/opportunities/check-cancellations
```

### 2. Environment Variables

Ensure these are set in your environment:
```bash
# Email configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FROM_EMAIL=noreply@communityconnect.com

# Frontend URL for email links
FRONTEND_URL=https://your-domain.com

# Database
MONGODB_URI=your-mongodb-connection-string
```

### 3. Testing the System

#### Manual Testing:
1. Create an opportunity for tomorrow with < 6 signups
2. Run: `node scripts/check-cancellations.js`
3. Verify the opportunity is marked as cancelled
4. Check that cancellation emails are sent

#### Automated Testing:
The cancellation check endpoint returns detailed results:
```javascript
{
  success: true,
  dateChecked: "2024-01-15",
  totalOpportunities: 5,
  cancelledCount: 2,
  results: [
    {
      opportunityId: "...",
      title: "Community Garden Cleanup",
      signupCount: 3,
      cancelled: true,
      notificationsSent: 3,
      successfulNotifications: 3
    }
  ]
}
```

## 📧 Email Notifications

### Cancellation Email Features:
- **Clear subject line**: "⚠️ Volunteer Opportunity Cancelled: [Event Name]"
- **Detailed event information**: Date, time, location, contact details
- **Explanation**: Why the event was cancelled
- **Next steps**: What happens to their commitment
- **Encouragement**: Links to browse other opportunities
- **Professional design**: Branded template with clear visual hierarchy

### Email Content Includes:
- Event details (date, times, location, contact info)
- Cancellation reason
- Automatic removal from commitments
- Link to browse other opportunities
- Contact information for questions

## 🎨 UX Improvements

### Reduced Questions Through:

1. **Clear Arrival Instructions**: "Arrive by 12:00 PM" instead of vague timing
2. **Specific Meeting Points**: "Main entrance" vs just an address
3. **Contact Information**: Who to ask for and phone number for issues
4. **What to Bring**: Clear list of required items
5. **Special Instructions**: Parking, dress code, safety requirements
6. **Time Clarity**: Separate arrival time, start time, and end time

### Visual Enhancements:

1. **Organized Information**: Key details and important info in separate sections
2. **Clear Labels**: Bold labels for each piece of information
3. **Icon Usage**: Visual icons for dates, times, locations, contacts
4. **Color Coding**: Different background colors for different information types
5. **Progressive Disclosure**: Optional information shown only when relevant

## 📊 Success Metrics

### Measurable Improvements:
- **Reduced Questions**: Fewer last-minute calls/emails about logistics
- **Better Attendance**: Clear instructions lead to fewer no-shows
- **Efficient Cancellations**: Automatic system prevents wasted time
- **User Satisfaction**: More complete information reduces frustration

### Monitoring Points:
- Number of opportunities cancelled automatically
- Email delivery success rates
- User feedback on new information format
- Reduction in support requests about opportunity details

## 🚀 Future Enhancements

### Potential Additions:
1. **SMS Notifications**: Text message alerts for cancellations
2. **Push Notifications**: Browser/app notifications for urgent updates
3. **Waitlist System**: Allow overflow signups to fill cancelled spots
4. **Weather Integration**: Automatic cancellation for outdoor events in bad weather
5. **Feedback Collection**: Post-event surveys to improve future opportunities
6. **Smart Scheduling**: AI-powered suggestions for optimal event timing

### Advanced Features:
1. **Dynamic Minimums**: Different minimum requirements per event type
2. **Flexible Deadlines**: Configurable cancellation deadlines per event
3. **Partial Cancellation**: Reduce scope instead of full cancellation
4. **Alternative Suggestions**: Recommend similar opportunities when cancelled

## 🔍 Troubleshooting

### Common Issues:

#### Cancellation Check Not Running:
1. Verify cron job is configured correctly
2. Check API endpoint is accessible
3. Review server logs for errors
4. Test with manual script

#### Emails Not Sending:
1. Verify email environment variables
2. Check SMTP credentials
3. Review email service quotas
4. Test with manual email function

#### Database Issues:
1. Verify MongoDB connection
2. Check collection names match
3. Review field names and types
4. Test database queries manually

### Debugging Tools:
- Manual cancellation script: `node scripts/check-cancellations.js`
- API endpoint testing: POST to `/api/opportunities/check-cancellations`
- Email preview URLs (in development mode)
- Console logging for detailed error information

## 📝 Migration Notes

### For Existing Opportunities:
- Old opportunities will continue to work without new fields
- New fields are optional (except arrivalTime)
- Gradual migration as opportunities are edited
- No breaking changes to existing functionality

### Database Migration:
No immediate migration required - new fields are added incrementally as opportunities are created or updated.

## 📞 Support

For questions or issues with this system:
1. Check the troubleshooting section above
2. Review console logs for error details
3. Test with the manual cancellation script
4. Contact the development team with specific error messages

---

*Last updated: December 2024*
*Version: 1.0*