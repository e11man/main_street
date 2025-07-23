# Lovable Deployment Guide

This guide provides step-by-step instructions for deploying the Community Connect platform to Lovable.dev.

## 📋 Prerequisites

Before importing to Lovable, ensure you have:

1. **GitHub Repository Access** - This project should be in a GitHub repository
2. **Environment Variables Ready** - Gather all required API keys and database credentials
3. **Lovable Account** - Create an account at [lovable.dev](https://lovable.dev)

## 🚀 Method 1: Repository Swap Technique (Recommended)

This method preserves your Git history and ensures smooth integration.

### Step 1: Create Blank Lovable Project

1. Go to [lovable.dev](https://lovable.dev) and create a new project
2. When prompted, use this command:
   ```
   Create a new blank page. Do not create any web app yet. Use the stack Next.js
   ```
3. Wait for the project to initialize

### Step 2: Connect to GitHub

1. In your Lovable project, find the GitHub integration option
2. Connect to GitHub and authorize Lovable
3. **Important**: Note the repository name Lovable creates (e.g., "lovable-project-123")

### Step 3: Repository Swap

1. **Go to your GitHub account**
2. **Find the Lovable-created repository** and rename it to something temporary (e.g., "temp-lovable-123")
3. **Find this Community Connect repository** and rename it to match the exact name Lovable created in Step 2
4. **Delete the temporary repository** from Step 2

### Step 4: Configure Lovable Project

1. Return to your Lovable project and refresh the page
2. Lovable will detect the repository change and may show configuration prompts
3. Configure the following settings:

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`
- Development Command: `npm run dev`

**Environment Settings:**
- Node.js Version: `18.x`
- Package Manager: `npm`

## 🔧 Method 2: Manual Import

If the repository swap doesn't work, use this alternative method:

### Step 1: Download Project

1. Clone or download this repository
2. Extract all files to your local machine

### Step 2: Create New Lovable Project

1. Create a new blank Next.js project in Lovable
2. Connect it to a new GitHub repository

### Step 3: Upload Files

1. Copy all files from this project to your new Lovable project
2. Ensure the directory structure matches:
   ```
   /
   ├── pages/
   ├── components/
   ├── lib/
   ├── contexts/
   ├── public/
   ├── styles/
   ├── package.json
   ├── next.config.js
   └── tailwind.config.js
   ```

## 🌍 Environment Variables Configuration

In your Lovable project settings, add these environment variables:

### Required Variables

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_minimum_32_characters
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NODE_ENV=production
```

### Optional Variables

```
EMAIL_HOST=your_email_smtp_host
EMAIL_PORT=587
EMAIL_USER=your_email_username
EMAIL_PASS=your_email_password
NEXT_PUBLIC_APP_URL=https://your-lovable-domain.lovable.app
```

### Getting API Keys

**Google Maps API Key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Maps JavaScript API
4. Create credentials (API Key)
5. Restrict the key to your Lovable domain

**MongoDB URI:**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get connection string
4. Replace `<password>` with your database password

## 🔍 Troubleshooting

### Common Issues

**1. Build Fails with Module Not Found**
```bash
# Solution: Ensure all dependencies are in package.json
npm install
```

**2. Blank Screen After Deployment**
- Check that all required environment variables are set
- Verify MongoDB connection string is correct
- Check browser console for JavaScript errors

**3. Google Maps Not Loading**
- Verify API key is correct and has proper restrictions
- Ensure Maps JavaScript API is enabled in Google Cloud
- Check if the domain is allowed in API key restrictions

**4. Database Connection Errors**
- Verify MongoDB URI format: `mongodb+srv://username:password@cluster.mongodb.net/database`
- Ensure database user has read/write permissions
- Check if IP address is whitelisted in MongoDB Atlas

### Performance Issues

**Slow Loading:**
- Images should be optimized using Next.js Image component
- Check if Tailwind CSS is properly configured
- Verify environment is set to `production`

**Build Timeout:**
- Large dependencies might cause build timeouts
- Check package.json for unnecessary packages
- Consider code splitting for large components

## 📊 Post-Deployment Checklist

After successful deployment:

- [ ] Test user registration and login
- [ ] Verify Google Maps integration works
- [ ] Check database connections
- [ ] Test email notifications (if configured)
- [ ] Verify all pages load correctly
- [ ] Test responsive design on mobile
- [ ] Check console for any errors

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env` files to Git
2. **API Keys**: Restrict Google Maps API key to your domain only
3. **Database**: Use strong passwords and enable authentication
4. **JWT Secret**: Use a random string of at least 32 characters

## 📞 Support

If you encounter issues:

1. **Check Lovable Documentation**: [docs.lovable.dev](https://docs.lovable.dev)
2. **Lovable Community**: Join the Discord for community support
3. **GitHub Issues**: Create an issue in this repository for project-specific problems

## 🎉 Success!

Once deployed, your Community Connect platform will be available at your Lovable domain. Users can:

- Register and create profiles
- Browse volunteer opportunities
- Connect with organizations
- Use location-based search
- Receive notifications

---

**Happy Deploying!** 🚀