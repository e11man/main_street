const { MongoClient } = require('mongodb');

let client;
let db;

async function connectToContentDB() {
  if (!client) {
    client = new MongoClient(process.env.MAINSTREETCONTENT);
    await client.connect();
    db = client.db();
  }
  return db;
}

async function getContent(key, defaultValue = '') {
  try {
    const database = await connectToContentDB();
    const collection = database.collection('site_content');
    const document = await collection.findOne({ key });
    return document ? document.value : defaultValue;
  } catch (error) {
    console.error('Error fetching content:', error);
    return defaultValue;
  }
}

async function setContent(key, value) {
  try {
    const database = await connectToContentDB();
    const collection = database.collection('site_content');
    await collection.updateOne(
      { key },
      { $set: { key, value, updatedAt: new Date() } },
      { upsert: true }
    );
    return true;
  } catch (error) {
    console.error('Error setting content:', error);
    return false;
  }
}

async function getAllContent() {
  try {
    const database = await connectToContentDB();
    const collection = database.collection('site_content');
    const documents = await collection.find({}).toArray();
    const content = {};
    documents.forEach(doc => {
      content[doc.key] = doc.value;
    });
    return content;
  } catch (error) {
    console.error('Error fetching all content:', error);
    return {};
  }
}

async function initializeDefaultContent() {
  try {
    const database = await connectToContentDB();
    const collection = database.collection('site_content');
    
    const defaultContent = {
      // Hero Section
      'hero.title': 'Connect. Volunteer. Make a Difference.',
      'hero.subtitle': 'Join thousands of volunteers making a positive impact in their communities. Find opportunities that match your skills and passion.',
      'hero.cta.primary': 'Get Started',
      'hero.cta.secondary': 'Learn More',
      
      // Stats
      'stats.volunteers': '2,500+',
      'stats.volunteers.label': 'Active Volunteers',
      'stats.opportunities': '150+',
      'stats.opportunities.label': 'Opportunities',
      'stats.organizations': '50+',
      'stats.organizations.label': 'Partner Organizations',
      'stats.impact': '10,000+',
      'stats.impact.label': 'Hours Volunteered',
      
      // Navigation
      'nav.home': 'Home',
      'nav.about': 'About',
      'nav.opportunities': 'Opportunities',
      'nav.contact': 'Contact',
      'nav.login': 'Login',
      'nav.signup': 'Sign Up',
      'nav.dashboard': 'Dashboard',
      'nav.logout': 'Logout',
      'nav.request_volunteers': 'Request Volunteers',
      'nav.org_login': 'Organization Login',
      
      // Search Section
      'search.title': 'Find Your Perfect Volunteer Opportunity',
      'search.subtitle': 'Search and filter opportunities based on your interests, skills, and availability.',
      'search.placeholder': 'Search by title, description, or category...',
      'search.location.placeholder': 'Enter location',
      'search.filter.title': 'Filter Opportunities',
      'search.filter.subtitle': 'Click on a category to filter opportunities',
      'search.filter.all': 'All',
      'search.filter.community': 'Community',
      'search.filter.education': 'Education',
      'search.filter.environment': 'Environment',
      'search.filter.health': 'Health',
      'search.filter.fundraising': 'Fundraising',
      'search.filter.other': 'Other',
      
      // Testimonials
      'testimonials.title': 'What Our Volunteers Say',
      'testimonials.subtitle': 'Hear from amazing volunteers who are making a difference in their communities.',
      
      // Contact Section
      'contact.title': 'Get In Touch',
      'contact.subtitle': 'Have questions or want to learn more about our volunteer opportunities? Send us a message and we\'ll get back to you soon.',
      'contact.name.placeholder': 'Your Name',
      'contact.email.placeholder': 'Your Email',
      'contact.message.placeholder': 'Your Message',
      'contact.submit': 'Send Message',
      'contact.sending': 'Sending...',
      'contact.sent': '✓ Message Sent!',
      
      // Footer
      'footer.tagline': 'Connecting communities through meaningful volunteer opportunities.',
      'footer.copyright': '© 2024 Community Connect. All rights reserved.',
      'footer.privacy': 'Privacy Policy',
      'footer.terms': 'Terms of Service',
      'footer.contact': 'Contact Us',
      
      // About Page
      'about.title': 'About Community Connect',
      'about.subtitle': 'Empowering communities through volunteer connections',
      'about.hero.title': 'Make the Connection',
      'about.hero.subtitle': 'Connect with meaningful opportunities that create lasting impact in upland.',
      'about.mission.title': 'Our Mission',
      'about.mission.text': 'Community Connect is dedicated to fostering meaningful relationships between passionate volunteers and impactful opportunities. We believe that when individuals come together with shared purpose, they can create transformative change that extends far beyond individual efforts. Our platform serves as a bridge, connecting hearts and hands to build stronger, more resilient upland through collective action.',
      'about.impact.title': 'Our Impact',
      'about.what_we_do.title': 'What We Do',
      'about.what_we_do.text': 'Community Connect facilitates a wide array of volunteer opportunities, from local ministry work to global outreach initiatives. We partner with organizations that share our commitment to making a positive difference in upland.',
      'about.contact.title': 'Get In Touch',
      'about.contact.text': 'Have questions or want to learn more about how you can get involved? We\'d love to hear from you and help you find the perfect opportunity to make a difference.',
      
      // Opportunities
      'opportunities.title': 'Volunteer Opportunities',
      'opportunities.subtitle': 'Find the perfect way to give back to your community',
      'opportunities.card.learn_more': 'Learn More',
      'opportunities.card.sign_up': 'Sign Up',
      'opportunities.card.spots_left': 'spots left',
      'opportunities.card.volunteers_needed': 'volunteers needed',
      
      // Auth
      'auth.login.title': 'Welcome Back',
      'auth.login.subtitle': 'Sign in to your account',
      'auth.login.email': 'Email',
      'auth.login.password': 'Password',
      'auth.login.submit': 'Sign In',
      'auth.login.forgot': 'Forgot Password?',
      'auth.login.no_account': 'Don\'t have an account?',
      'auth.login.sign_up': 'Sign up',
      
      'auth.signup.title': 'Join Community Connect',
      'auth.signup.subtitle': 'Create your account to start volunteering',
      'auth.signup.name': 'Full Name',
      'auth.signup.email': 'Email',
      'auth.signup.password': 'Password',
      'auth.signup.confirm_password': 'Confirm Password',
      'auth.signup.submit': 'Create Account',
      'auth.signup.have_account': 'Already have an account?',
      'auth.signup.sign_in': 'Sign in',
      
      // Forms
      'form.required': 'This field is required',
      'form.email.invalid': 'Please enter a valid email address',
      'form.password.min': 'Password must be at least 8 characters',
      'form.password.mismatch': 'Passwords do not match',
      'form.submit.success': 'Thank you! Your message has been sent.',
      'form.submit.error': 'Something went wrong. Please try again.',
      
      // Buttons
      'button.submit': 'Submit',
      'button.cancel': 'Cancel',
      'button.save': 'Save',
      'button.edit': 'Edit',
      'button.delete': 'Delete',
      'button.close': 'Close',
      'button.back': 'Back',
      'button.next': 'Next',
      'button.previous': 'Previous',
      'button.load_more': 'Load More',
      
      // Messages
      'message.loading': 'Loading...',
      'message.error': 'Something went wrong. Please try again.',
      'message.success': 'Success!',
      'message.no_results': 'No results found.',
      'message.coming_soon': 'Coming Soon',
      
      // Dashboard
      'dashboard.title': 'My Dashboard',
      'dashboard.welcome': 'Welcome back',
      'dashboard.my_opportunities': 'My Opportunities',
      'dashboard.upcoming_events': 'Upcoming Events',
      'dashboard.volunteer_hours': 'Volunteer Hours',
      'dashboard.profile': 'Profile',
      'dashboard.settings': 'Settings',
      
      // Organization Dashboard
      'org.dashboard.title': 'Organization Dashboard',
      'org.dashboard.opportunities': 'Manage Opportunities',
      'org.dashboard.volunteers': 'Volunteers',
      'org.dashboard.analytics': 'Analytics',
      'org.dashboard.create_opportunity': 'Create Opportunity',
      
      // Admin
      'admin.title': 'Admin Dashboard',
      'admin.users': 'Users',
      'admin.organizations': 'Organizations',
      'admin.opportunities': 'Opportunities',
      'admin.reports': 'Reports',
      'admin.settings': 'Settings'
    };
    
    // Check if content already exists
    const existingCount = await collection.countDocuments();
    if (existingCount === 0) {
      const documents = Object.entries(defaultContent).map(([key, value]) => ({
        key,
        value,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      
      await collection.insertMany(documents);
      console.log('Default content initialized');
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing default content:', error);
    return false;
  }
}

module.exports = {
  getContent,
  setContent,
  getAllContent,
  initializeDefaultContent
};