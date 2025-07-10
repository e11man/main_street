# Content Management System

## Overview

The Community Connect platform now includes a comprehensive content management system that allows administrators to manage all text content on the website through a user-friendly interface. All content is stored in MongoDB and served with server-side rendering for optimal performance.

## Features

- **Centralized Content Storage**: All text content is stored in MongoDB
- **Server-Side Rendering**: Content is fetched at build time for optimal UX
- **Admin Interface**: User-friendly content editor with search and organization
- **Real-time Updates**: Changes are immediately reflected across the site
- **Fallback Content**: Default content ensures the site works even if database is unavailable
- **Caching**: Intelligent caching for performance optimization

## Quick Start

### 1. Initialize Content

Run the initialization script to set up default content in the database:

```bash
npm run init-content
```

### 2. Access Admin Interface

Navigate to `/content-admin` to access the content management interface. You must be logged in as an admin user.

### 3. Edit Content

- Use the search functionality to find specific content
- Expand sections to edit individual fields
- Save changes to update the site immediately

## Content Structure

The content is organized into logical sections:

### Homepage Content
- **Hero Section**: Main title, subtitle, and call-to-action buttons
- **Search Section**: Placeholder text and filter labels
- **Testimonials**: Section titles and descriptions
- **Contact**: Form labels and messages

### About Page Content
- **Hero Section**: Page title and subtitle
- **Mission**: Mission statement and description
- **Impact**: Section title
- **What We Do**: Program descriptions

### Navigation
- Menu items and labels
- Button text

### Footer
- Description and links
- Social media labels

### Common UI Elements
- Loading states
- Error messages
- Success messages
- Button labels

### Modal Content
- Authentication forms
- Volunteer request forms
- Form labels and messages

## API Endpoints

### GET /api/content
Fetches all content from the database.

**Response:**
```json
{
  "success": true,
  "data": {
    "homepage": { ... },
    "about": { ... },
    "navigation": { ... }
  }
}
```

### POST /api/content
Updates content in the database (admin only).

**Request:**
```json
{
  "content": {
    "homepage": { ... },
    "about": { ... }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Content updated successfully"
}
```

### PUT /api/content
Initializes default content in the database (admin only).

**Response:**
```json
{
  "success": true,
  "message": "Content initialized successfully"
}
```

## Usage in Components

### Using the Content Hook

```jsx
import { useContent } from '../contexts/ContentContext';

function MyComponent() {
  const { getContent, getSection } = useContent();
  
  return (
    <div>
      <h1>{getContent('homepage.hero.title', 'Default Title')}</h1>
      <p>{getContent('homepage.hero.subtitle', 'Default subtitle')}</p>
    </div>
  );
}
```

### Server-Side Rendering

Add `getServerSideProps` to your pages:

```jsx
export async function getServerSideProps() {
  try {
    const { getContent } = await import('../lib/contentManager.js');
    const content = await getContent();

    return {
      props: {
        initialContent: content,
      },
    };
  } catch (error) {
    return {
      props: {
        initialContent: null,
      },
    };
  }
}
```

## Content Manager Functions

### `getContent(path, fallback)`
Gets a specific content value by path.

```jsx
const title = getContent('homepage.hero.title', 'Default Title');
```

### `getSection(section)`
Gets an entire content section.

```jsx
const homepageContent = getSection('homepage');
```

### `updateContent(newContent)`
Updates all content (admin only).

```jsx
const result = await updateContent(newContent);
if (result.success) {
  console.log('Content updated successfully');
}
```

## Database Schema

Content is stored in the `content` collection with the following structure:

```json
{
  "_id": ObjectId,
  "type": "siteContent",
  "data": {
    "homepage": { ... },
    "about": { ... },
    "navigation": { ... },
    "footer": { ... },
    "common": { ... },
    "modals": { ... }
  },
  "createdAt": Date,
  "updatedAt": Date,
  "createdBy": "system",
  "updatedBy": "admin"
}
```

## Caching

The content system includes intelligent caching:

- **Server-side**: Content is cached for 5 minutes
- **Client-side**: Content is cached in React state
- **Automatic refresh**: Cache is cleared when content is updated

## Error Handling

The system includes robust error handling:

- **Database errors**: Falls back to default content
- **Network errors**: Uses cached content when available
- **Missing content**: Uses fallback values
- **Admin errors**: Shows user-friendly error messages

## Security

- **Authentication**: Admin endpoints require authentication
- **Authorization**: Only admin users can modify content
- **Validation**: Content is validated before saving
- **Sanitization**: User input is sanitized

## Performance Optimization

- **Server-side rendering**: Content is fetched at build time
- **Caching**: Multiple layers of caching for performance
- **Lazy loading**: Content is loaded only when needed
- **Minimal re-renders**: React optimization for content updates

## Troubleshooting

### Content Not Loading
1. Check if the database is connected
2. Verify the content collection exists
3. Run the initialization script
4. Check browser console for errors

### Admin Access Issues
1. Ensure you're logged in as an admin
2. Check your authentication token
3. Verify admin permissions

### Content Not Updating
1. Clear browser cache
2. Check if changes were saved
3. Verify the content structure
4. Check for JavaScript errors

## Best Practices

1. **Always provide fallback content** for critical text
2. **Use descriptive content paths** for easy management
3. **Test content changes** in development first
4. **Backup content** before major changes
5. **Use the search function** to find specific content
6. **Organize content logically** in the admin interface

## Migration Guide

If you're migrating from hardcoded content:

1. Run the initialization script
2. Update components to use the content hook
3. Add server-side props to pages
4. Test all content paths
5. Update the admin interface as needed

## Support

For issues with the content management system:

1. Check the browser console for errors
2. Verify database connectivity
3. Check the server logs
4. Ensure proper authentication
5. Contact the development team