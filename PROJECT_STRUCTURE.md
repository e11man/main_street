# Project Structure Guide

This document outlines the complete structure of the Community Connect platform and explains how each component fits together for optimal Lovable.dev compatibility.

## 📁 Root Directory Structure

```
community-connect/
├── 📄 Configuration Files
│   ├── package.json              # Dependencies and scripts
│   ├── package-lock.json         # Dependency lock file
│   ├── next.config.js            # Next.js configuration
│   ├── tailwind.config.js        # Tailwind CSS configuration
│   ├── postcss.config.js         # PostCSS configuration
│   ├── .eslintrc.json            # ESLint linting rules
│   ├── lovable.config.js         # Lovable-specific configuration
│   └── .gitignore                # Git ignore patterns
│
├── 📄 Documentation
│   ├── README.md                 # Main project documentation
│   ├── LOVABLE_DEPLOYMENT.md     # Lovable deployment guide
│   ├── PROJECT_STRUCTURE.md      # This file
│   ├── TESTING_MODE_CHANGES.md   # Testing documentation
│   └── .env.example              # Environment variables template
│
├── 📂 Application Code
│   ├── pages/                    # Next.js pages (Router)
│   ├── components/               # React components
│   ├── lib/                      # Utility libraries
│   ├── contexts/                 # React contexts
│   ├── public/                   # Static assets
│   └── styles/                   # CSS styles
│
├── 📂 Scripts & Tools
│   ├── scripts/                  # Database and utility scripts
│   └── run-notification-tests.js # Notification testing
│
└── 📂 Legacy (Excluded from Lovable)
    └── community-connect/        # Original nested structure (deprecated)
```

## 📁 Detailed Directory Breakdown

### `/pages` - Next.js Pages (Router)

```
pages/
├── api/                          # API routes
│   ├── auth/                     # Authentication endpoints
│   ├── users/                    # User management
│   ├── organizations/            # Organization management
│   └── opportunities/            # Opportunity management
├── _app.js                       # Application wrapper
├── _document.js                  # HTML document structure
├── index.js                      # Home page
├── about.js                      # About page
├── admin.js                      # Admin dashboard
├── organization-dashboard.js     # Organization management
├── organization-login.js         # Organization login
└── user-dashboard.js            # User dashboard
```

### `/components` - React Components

```
components/
├── ui/                          # Reusable UI components
│   ├── Button/
│   ├── Modal/
│   ├── Card/
│   └── ...
├── Header/                      # Site header components
├── Footer/                      # Site footer components
├── Hero/                        # Landing page hero
├── Contact/                     # Contact form components
├── FloatingCard/                # Floating UI elements
├── Opportunities/               # Opportunity-related components
├── SearchAndFilter/             # Search and filter functionality
├── Testimonials/                # User testimonials
├── Safety/                      # Safety information
├── Metrics/                     # Analytics and metrics
├── Admin/                       # Admin panel components
├── Commitments/                 # User commitment tracking
├── CompanyAuthModal.jsx         # Company authentication
├── OrganizationAuthModal.jsx    # Organization authentication
└── GooglePlacesAutocomplete.jsx # Google Places integration
```

### `/lib` - Utility Libraries

```
lib/
├── auth.js                      # Authentication utilities
├── database.js                  # Database connection
├── email.js                     # Email functionality
├── validation.js                # Input validation
├── api.js                       # API utilities
└── constants.js                 # Application constants
```

### `/contexts` - React Contexts

```
contexts/
├── AuthContext.js               # Authentication state
├── UserContext.js               # User data management
├── OrganizationContext.js       # Organization state
└── NotificationContext.js       # Notification system
```

### `/public` - Static Assets

```
public/
├── images/                      # Image assets
├── icons/                       # Icon files
├── favicon.ico                  # Site favicon
└── robots.txt                   # SEO robots file
```

### `/styles` - CSS Styles

```
styles/
├── globals.css                  # Global CSS styles
├── components/                  # Component-specific styles
└── utilities.css                # Utility classes
```

### `/scripts` - Database & Utility Scripts

```
scripts/
├── seed-db.js                   # Database seeding
├── check-cancellations.js       # Event cancellation checks
├── setup-email-notifications.js # Email setup
├── validate-email-addresses.js  # Email validation
└── initialize-metrics.js        # Metrics initialization
```

## 🔧 Configuration Files Explained

### `package.json`
- **Purpose**: Defines project dependencies, scripts, and metadata
- **Lovable Importance**: Critical for dependency installation and build configuration
- **Key Sections**: dependencies, devDependencies, scripts, engines

### `next.config.js`
- **Purpose**: Next.js framework configuration
- **Lovable Importance**: Configures webpack, environment variables, and build settings
- **Key Features**: Client-side fallbacks, image optimization, environment variables

### `tailwind.config.js`
- **Purpose**: Tailwind CSS customization
- **Lovable Importance**: Defines custom colors, fonts, and design tokens
- **Key Features**: Custom color palette, animations, responsive breakpoints

### `lovable.config.js`
- **Purpose**: Lovable-specific deployment configuration
- **Lovable Importance**: Optimizes deployment settings and performance
- **Key Features**: Build commands, environment variables, optimization settings

## 🚀 Lovable Integration Points

### Build Process
1. **Install**: `npm install` - Installs all dependencies
2. **Build**: `npm run build` - Creates production build in `.next/`
3. **Start**: `npm start` - Serves the production application

### Environment Variables
- **Required**: `MONGODB_URI`, `JWT_SECRET`, `GOOGLE_MAPS_API_KEY`
- **Optional**: Email configuration, application URLs
- **Configuration**: Set in Lovable environment settings

### Static Assets
- **Location**: `/public` directory
- **Access**: Available at root URL path
- **Optimization**: Handled by Next.js Image component

### API Routes
- **Location**: `/pages/api` directory
- **Function**: Server-side functionality
- **Database**: MongoDB integration via connection utilities

## 📱 Component Architecture

### Authentication Flow
```
CompanyAuthModal ←→ OrganizationAuthModal
        ↓
   AuthContext ←→ UserContext
        ↓
   Protected Routes & Components
```

### Data Flow
```
Database (MongoDB)
        ↓
API Routes (/pages/api)
        ↓
React Contexts
        ↓
Page Components
        ↓
UI Components
```

### Location Features
```
GooglePlacesAutocomplete
        ↓
Google Maps API
        ↓
SearchAndFilter Components
        ↓
Location-based Results
```

## 🔍 Development Guidelines

### File Naming Conventions
- **Pages**: kebab-case (e.g., `user-dashboard.js`)
- **Components**: PascalCase (e.g., `CompanyAuthModal.jsx`)
- **Utilities**: camelCase (e.g., `authUtils.js`)
- **Constants**: UPPER_SNAKE_CASE

### Import Structure
```javascript
// External dependencies
import React from 'react';
import { NextApiRequest } from 'next';

// Internal utilities
import { connectDatabase } from '../lib/database';

// Components
import Header from '../components/Header';

// Styles (if needed)
import styles from './component.module.css';
```

### Environment Variables Usage
```javascript
// Server-side (API routes)
const mongoUri = process.env.MONGODB_URI;

// Client-side (components)
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
```

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env` files to version control
- Use `.env.example` for documentation
- Prefix client-side variables with `NEXT_PUBLIC_`

### API Security
- JWT token validation on protected routes
- Input sanitization and validation
- Rate limiting for API endpoints

### Database Security
- Connection string encryption
- User permission restrictions
- Input parameterization

## 📊 Performance Optimization

### Code Splitting
- Automatic route-based splitting via Next.js
- Dynamic imports for heavy components
- Tree shaking for unused code elimination

### Image Optimization
- Next.js Image component for automatic optimization
- WebP format conversion when supported
- Responsive image sizing

### CSS Optimization
- Tailwind CSS purging of unused styles
- PostCSS processing and minification
- Critical CSS inlining

## 🧪 Testing Strategy

### Component Testing
- Jest for unit testing
- React Testing Library for component testing
- Cypress for end-to-end testing

### API Testing
- Postman collections for API endpoint testing
- Jest for API route unit testing
- Database integration testing

### Notification Testing
- `run-notification-tests.js` for email testing
- Mock services for development testing
- End-to-end notification flow testing

---

This structure ensures optimal compatibility with Lovable.dev while maintaining clean, scalable architecture for ongoing development.