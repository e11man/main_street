# Dynamic Content Management System

## Overview

This system allows the website owner to change any text/wording on the site by simply updating the MongoDB database, without needing to modify the code. All static content is now dynamically loaded from the `MAINSTREETCONTENT` MongoDB database.

## Architecture

### 1. Database Structure
- **Database**: Uses the `MAINSTREETCONTENT` environment variable
- **Collection**: `site_content`
- **Document Schema**:
  ```javascript
  {
    key: "hero.title",           // Unique identifier for the content
    value: "Make the Connection", // The actual text content
    createdAt: Date,             // When the content was created
    updatedAt: Date              // When the content was last updated
  }
  ```

### 2. Content Manager (`lib/contentManager.js`)
Core utility for managing content:
- `getContent(key, defaultValue)` - Retrieve content by key
- `setContent(key, value)` - Update content
- `getAllContent()` - Get all content as object
- `initializeDefaultContent()` - Set up default content

### 3. API Endpoints

#### GET `/api/content`
Returns all site content as a JSON object:
```javascript
{
  "hero.title": "Make the Connection",
  "hero.subtitle": "Connect with meaningful opportunities...",
  // ... all content
}
```

#### POST `/api/content`
Updates content:
```javascript
{
  "key": "hero.title",
  "value": "New Title Text"
}
```

### 4. Server-Side Rendering
Pages use `getServerSideProps` to fetch content at build time:
```javascript
export async function getServerSideProps() {
  const content = await getAllContent();
  return { props: { content } };
}
```

### 5. Component Integration
All components receive content as props and use a helper function:
```javascript
const getContent = (key, defaultValue = '') => {
  return content?.[key] || defaultValue;
};

// Usage in JSX
<h1>{getContent('hero.title', 'Default Title')}</h1>
```

## Content Keys Structure

### Navigation
- `nav.home` - "Home"
- `nav.about` - "About"
- `nav.opportunities` - "Opportunities"
- `nav.contact` - "Contact"
- `nav.request_volunteers` - "Request Volunteers"
- `nav.org_login` - "Organization Login"

### Hero Section
- `hero.title` - Main hero title
- `hero.subtitle` - Hero subtitle text
- `hero.cta.primary` - Primary button text
- `hero.cta.secondary` - Secondary button text

### Statistics
- `stats.volunteers.label` - "Active Volunteers"
- `stats.opportunities.label` - "Opportunities"
- `stats.organizations.label` - "Organizations"
- `stats.impact.label` - "Hours Volunteered"

### Search & Filtering
- `search.title` - "Find Your Perfect Opportunity"
- `search.subtitle` - Search section description
- `search.placeholder` - Search input placeholder
- `search.filter.title` - "Filter Opportunities"
- `search.filter.subtitle` - Filter description
- `search.filter.all` - "All"
- `search.filter.community` - "Community"
- `search.filter.education` - "Education"
- `search.filter.environment` - "Environment"
- `search.filter.health` - "Health"
- `search.filter.fundraising` - "Fundraising"
- `search.filter.other` - "Other"

### Contact Section
- `contact.title` - "Get In Touch"
- `contact.subtitle` - Contact section description
- `contact.name.placeholder` - "Your Name"
- `contact.email.placeholder` - "Your Email"
- `contact.message.placeholder` - "Your Message"
- `contact.submit` - "Send Message"
- `contact.sending` - "Sending..."
- `contact.sent` - "✓ Message Sent!"

### Footer
- `footer.tagline` - Footer description text
- `footer.copyright` - Copyright text

### About Page
- `about.hero.title` - About page hero title
- `about.hero.subtitle` - About page hero subtitle
- `about.mission.title` - "Our Mission"
- `about.mission.text` - Mission statement
- `about.impact.title` - "Our Impact"
- `about.what_we_do.title` - "What We Do"
- `about.what_we_do.text` - What we do description
- `about.contact.title` - About contact section title
- `about.contact.text` - About contact description

## Updated Components

All the following components now use dynamic content:

### Pages
- `pages/index.js` - Home page with server-side content
- `pages/about.js` - About page with server-side content

### Components
- `components/Header/Header.jsx` - Navigation and buttons
- `components/Hero/HeroSection.jsx` - Hero title, subtitle, buttons
- `components/Hero/HeroStats.jsx` - Statistics labels
- `components/SearchAndFilter/SearchSection.jsx` - Search titles and placeholders
- `components/SearchAndFilter/FilterTabs.jsx` - Filter section titles
- `components/SearchAndFilter/FilterTab.jsx` - Individual filter labels
- `components/Contact/ContactSection.jsx` - Contact form labels and messages
- `components/Footer/Footer.jsx` - Footer links and copyright

## How to Change Content

### Method 1: Direct Database Update
Connect to your MongoDB database and update the `site_content` collection:

```javascript
// Update a single piece of content
db.site_content.updateOne(
  { key: "hero.title" },
  { $set: { value: "New Hero Title", updatedAt: new Date() } }
);

// Add new content
db.site_content.insertOne({
  key: "new.content.key",
  value: "New content value",
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### Method 2: API Endpoint
Use the content API to update content programmatically:

```javascript
// Update content via API
fetch('/api/content', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    key: 'hero.title',
    value: 'New Hero Title'
  })
});
```

### Method 3: Admin Interface (Future Enhancement)
You could build an admin interface that uses the content API to provide a user-friendly way to edit content.

## Environment Setup

Make sure you have the `MAINSTREETCONTENT` environment variable set in your `.env.local` file:

```
MAINSTREETCONTENT=mongodb://your-mongodb-connection-string
```

## Initialization

To initialize the database with default content, run:

```bash
node scripts/initialize-content.js
```

This will populate the database with all the default content values.

## Build Configuration

The `next.config.js` has been updated to handle MongoDB imports properly by adding webpack fallbacks for Node.js modules that aren't available in the browser environment.

## Benefits

1. **No Code Changes**: Website owners can change any text without touching code
2. **Real-time Updates**: Changes are reflected immediately on the website
3. **Fallback System**: If content is missing, default values are used
4. **Server-Side Rendering**: Content is rendered on the server for better SEO
5. **Type Safety**: All content keys are predefined and documented
6. **Scalable**: Easy to add new content keys as the site grows

## Future Enhancements

1. **Admin Dashboard**: Build a web interface for content management
2. **Content Versioning**: Track changes and allow rollbacks
3. **Multi-language Support**: Extend to support multiple languages
4. **Content Validation**: Add validation rules for different content types
5. **Caching**: Implement caching for better performance
6. **Content Preview**: Allow previewing changes before publishing

## Technical Notes

- The system uses server-side rendering to ensure content is available immediately
- MongoDB connection is established once and reused across requests
- Webpack configuration prevents MongoDB from being bundled in the client-side code
- All components gracefully handle missing content with fallback values
- The build process completes successfully with the new dynamic content system