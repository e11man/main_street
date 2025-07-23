# Community Connect Platform

A comprehensive community platform connecting volunteers with organizations and opportunities. Built with Next.js, React, and Tailwind CSS, designed for seamless integration with Lovable.dev.

## 🚀 Quick Start with Lovable

This project is fully configured for import into [Lovable.dev](https://lovable.dev). Follow these steps:

### Method 1: Direct GitHub Import to Lovable

1. **Create a new blank project in Lovable:**
   ```
   Create a new blank page. Do not create any web app yet. Use the stack Next.js
   ```

2. **Connect to GitHub and follow the repository swap technique:**
   - Connect your Lovable project to GitHub 
   - Note the repository name Lovable creates (e.g., "newrepo123")
   - Rename the Lovable-created repo to a temporary name
   - Rename this repository to match the Lovable-created name
   - Delete the temporary repository

3. **Configure deployment settings in Lovable:**
   - Build command: `npm run build`
   - Start command: `npm start`
   - Output directory: `.next`
   - Node version: `18.x` or higher

### Method 2: Manual Project Setup

1. Clone this repository
2. Install dependencies: `npm install`
3. Copy the project structure to a new Lovable project
4. Configure environment variables as described below

## 📁 Project Structure

```
community-connect/
├── pages/                 # Next.js pages (Router)
│   ├── api/              # API routes
│   ├── _app.js           # App component
│   ├── _document.js      # Document component
│   ├── index.js          # Home page
│   ├── about.js          # About page
│   ├── admin.js          # Admin dashboard
│   └── ...
├── components/           # React components
│   ├── ui/              # UI components
│   ├── Header/          # Header components
│   ├── Footer/          # Footer components
│   └── ...
├── lib/                 # Utility libraries
├── contexts/            # React contexts
├── public/              # Static assets
├── styles/              # CSS styles
├── scripts/             # Database and utility scripts
├── next.config.js       # Next.js configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database Configuration
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

# Google Maps Integration
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Email Configuration (optional)
EMAIL_HOST=your_email_host
EMAIL_PORT=587
EMAIL_USER=your_email_username
EMAIL_PASS=your_email_password

# App Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### For Lovable Deployment

In Lovable's environment settings, add these variables:
- `MONGODB_URI`
- `JWT_SECRET`
- `GOOGLE_MAPS_API_KEY`
- `NODE_ENV=production`

## 📦 Dependencies

### Core Dependencies
- **Next.js 15.3.3** - React framework
- **React 19.1.0** - UI library
- **Tailwind CSS 4.1.10** - Styling framework
- **MongoDB 6.17.0** - Database integration
- **Axios 1.10.0** - HTTP client

### Key Features Dependencies
- **@googlemaps/js-api-loader** - Google Maps integration
- **@react-google-maps/api** - React Google Maps components
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **nodemailer** - Email functionality
- **react-hot-toast** - Toast notifications

## 🚀 Available Scripts

```bash
# Development
npm run dev          # Start development server on http://localhost:3000

# Production
npm run build        # Build the application for production
npm start           # Start the production server

# Database Operations
npm run seed        # Seed the database with initial data
npm run init-metrics # Initialize metrics collection

# Email System
npm run setup-email-notifications # Configure email notifications
npm run validate-emails           # Validate email addresses

# Testing
npm run test:notifications # Test notification system

# Linting
npm run lint        # Run ESLint
```

## 🌟 Key Features

### 🔐 Authentication System
- User registration and login
- Organization authentication
- JWT-based session management
- Role-based access control

### 🗺️ Location Features
- Google Maps integration
- Location-based opportunity search
- Interactive maps for events
- Geocoding and reverse geocoding

### 📧 Communication System
- Email notifications
- Real-time messaging
- Automated event reminders
- Newsletter functionality

### 📊 Admin Dashboard
- User management
- Organization oversight
- Metrics and analytics
- Content management

### 📱 Responsive Design
- Mobile-first approach
- Tailwind CSS styling
- Modern UI components
- Accessibility features

## 🔧 Lovable Integration Notes

### Build Configuration
- Uses Next.js Pages Router (not App Router)
- Optimized webpack configuration for client-side builds
- Proper fallbacks for Node.js modules in browser
- Tailwind CSS with PostCSS processing

### Deployment Considerations
- Static export compatible
- Environment variable handling
- Image optimization configured
- SWC minification enabled

### File Structure Compatibility
- All source files in standard Next.js locations
- Components organized in logical folders
- API routes in `pages/api/`
- Static assets in `public/`

## 🐛 Troubleshooting

### Common Issues with Lovable Import

1. **Blank Screen After Build**
   - Check that all environment variables are set
   - Verify the build command is `npm run build`
   - Ensure the output directory is set to `.next`

2. **Module Not Found Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check that the Node.js version is 18.x or higher

3. **Google Maps Not Loading**
   - Verify `GOOGLE_MAPS_API_KEY` is set in environment variables
   - Check that the API key has the necessary permissions

4. **Database Connection Issues**
   - Ensure `MONGODB_URI` is correctly formatted
   - Verify network access to your MongoDB instance

### Performance Optimization
- Images are optimized using Next.js Image component
- CSS is processed through Tailwind and PostCSS
- JavaScript is minified using SWC
- Bundle splitting for optimal loading

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For Lovable-specific issues:
- Check the [Lovable Documentation](https://docs.lovable.dev)
- Visit the [Lovable Community Discord](https://discord.gg/lovable)

For project-specific issues:
- Create an issue in this repository
- Provide detailed steps to reproduce
- Include environment information

---

**Ready for Lovable import!** 🎉

This project is optimized for seamless integration with Lovable.dev. All configurations, dependencies, and file structures follow Lovable best practices for a smooth import experience.