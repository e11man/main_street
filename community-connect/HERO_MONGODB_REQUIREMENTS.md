# Hero Section MongoDB Requirements

## Overview
The hero section has been modified to **ONLY** pull content from MongoDB with **NO FALLBACK TEXT**. This ensures that content is always managed centrally through the database.

## Changes Made

### 1. HeroSection Component (`components/Hero/HeroSection.jsx`)
- **Removed**: All fallback text and default values
- **Added**: Strict content validation that throws errors when content is missing
- **Added**: Loading states while fetching from MongoDB
- **Added**: Error display for MongoDB connection issues
- **Added**: Error display for missing content keys

### 2. HeroStats Component (`components/Hero/HeroStats.jsx`)
- **Removed**: Fallback text for stat labels
- **Added**: Strict content validation for stats labels
- **Added**: Error handling for missing stats content
- **Added**: Loading states for content fetching

### 3. Server-Side Rendering (`pages/index.js`)
- **Added**: Validation for required hero content keys
- **Removed**: Empty content fallback - now throws errors instead
- **Added**: Server-side content validation before page render

### 4. Content Manager (`lib/contentManager.js`)
- **Added**: Testing mode support to skip default content initialization
- **Enhanced**: Better error handling and logging

## Required MongoDB Content Keys

The hero section requires these keys to be present in MongoDB:

```javascript
// Essential hero content
'hero.title'           // Main hero title
'hero.subtitle'        // Hero subtitle/description  
'hero.cta.primary'     // Primary button text
'hero.cta.secondary'   // Secondary button text

// Stats content
'stats.volunteers.label'     // "Active Volunteers"
'stats.impact.label'         // "Hours Volunteered"  
'stats.organizations.label'  // "Partner Organizations"
```

## Error Handling

### Frontend Errors
When content is missing, users will see:

1. **Loading State**: "Loading hero content from MongoDB..."
2. **Connection Error**: Red box with MongoDB connection error details
3. **Missing Content Error**: Red box specifying which content keys are missing

### Server-Side Errors  
If essential content is missing during server-side rendering, the page will fail to load with a detailed error message.

## Testing

### Manual Testing
1. Start the application normally: `npm run dev`
2. Visit `http://localhost:3000`
3. Hero should load content from MongoDB

### Error Testing
Run the test script to verify error handling:
```bash
node community-connect/test-hero-mongodb.js
```

Or manually test by:
1. Setting `TESTING_MODE=true` environment variable
2. Or temporarily removing content from MongoDB
3. Verifying error messages appear

### Expected Behavior
- ✅ **With MongoDB content**: Hero displays normally
- ✅ **Without MongoDB content**: Clear error messages, no blank/fallback text
- ✅ **MongoDB connection issues**: Connection error displayed
- ❌ **Should never show**: Empty sections, fallback text, or partial content

## Content Management

Content must be managed through:
1. **Admin Panel**: Use the content management interface
2. **API**: Direct calls to `/api/content` endpoint  
3. **Database**: Direct MongoDB collection manipulation

## Environment Variables

- `TESTING_MODE=true`: Skips default content initialization for testing
- `MAINSTREETCONTENT`: MongoDB connection string (required)

## Troubleshooting

### "Content not found in MongoDB" Error
- Check if the required content keys exist in the `site_content` collection
- Verify MongoDB connection string is correct
- Run content initialization if needed

### "Failed to fetch content from MongoDB" Error  
- Check MongoDB connection and credentials
- Verify database and collection exist
- Check network connectivity to MongoDB

### Page Won't Load
- Check server logs for content validation errors
- Ensure all required hero content keys are present
- Verify `MAINSTREETCONTENT` environment variable is set

## Development Guidelines

1. **Never add fallback text** to hero components
2. **Always validate** required content keys exist
3. **Show clear errors** when content is missing
4. **Test both success and failure** scenarios
5. **Document new content requirements** when adding features