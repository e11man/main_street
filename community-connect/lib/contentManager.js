import clientPromise from './mongodb.js';

// Content cache for server-side rendering
let contentCache = null;
let lastCacheUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Content Manager for Community Connect
 * 
 * This module handles all text content management including:
 * - Fetching content from MongoDB
 * - Caching for performance
 * - Content organization by sections
 * - Fallback content for missing translations
 */

// Default content structure
const DEFAULT_CONTENT = {
  // Homepage content
  homepage: {
    hero: {
      title: "Make the Connection",
      subtitle: "Connect with meaningful opportunities that create lasting impact in upland.",
      ctaPrimary: "Find Opportunities →",
      ctaSecondary: "Learn More"
    },
    search: {
      placeholder: "Search opportunities...",
      filterAll: "All Opportunities",
      filterCommunity: "Community",
      filterEducation: "Education", 
      filterEnvironment: "Environment",
      filterHealth: "Health",
      filterTechnology: "Technology"
    },
    testimonials: {
      title: "What Our Community Says",
      subtitle: "Hear from volunteers and organizations making a difference"
    },
    contact: {
      title: "Get in Touch",
      subtitle: "Have questions or want to get involved? We'd love to hear from you.",
      formTitle: "Send us a message",
      nameLabel: "Name",
      emailLabel: "Email",
      messageLabel: "Message",
      submitButton: "Send Message",
      successMessage: "Thank you! Your message has been sent successfully.",
      errorMessage: "Sorry, there was an error sending your message. Please try again."
    }
  },
  
  // About page content
  about: {
    hero: {
      title: "Make the Connection",
      subtitle: "Connect with meaningful opportunities that create lasting impact in upland."
    },
    mission: {
      title: "Our Mission",
      description: "Community Connect is dedicated to fostering meaningful relationships between passionate volunteers and impactful opportunities. We believe that when individuals come together with shared purpose, they can create transformative change that extends far beyond individual efforts. Our platform serves as a bridge, connecting hearts and hands to build stronger, more resilient upland through collective action."
    },
    impact: {
      title: "Our Impact"
    },
    whatWeDo: {
      title: "What We Do",
      description: "We connect passionate individuals with meaningful volunteer opportunities that create lasting positive change in our community."
    }
  },
  
  // Header and navigation
  navigation: {
    home: "Home",
    about: "About",
    opportunities: "Opportunities",
    login: "Login",
    signup: "Sign Up",
    dashboard: "Dashboard",
    admin: "Admin",
    logout: "Logout"
  },
  
  // Footer content
  footer: {
    description: "Connecting passionate volunteers with meaningful opportunities to create lasting impact in our community.",
    quickLinks: "Quick Links",
    contact: "Contact",
    social: "Follow Us",
    copyright: "© 2024 Community Connect. All rights reserved."
  },
  
  // Common UI elements
  common: {
    loading: "Loading...",
    error: "An error occurred. Please try again.",
    success: "Success!",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    confirm: "Confirm",
    back: "Back",
    next: "Next",
    previous: "Previous",
    close: "Close",
    submit: "Submit",
    search: "Search",
    filter: "Filter",
    clear: "Clear",
    view: "View",
    join: "Join",
    leave: "Leave",
    apply: "Apply",
    learnMore: "Learn More",
    noResults: "No results found",
    noData: "No data available"
  },
  
  // Modal content
  modals: {
    auth: {
      title: "Sign In",
      subtitle: "Access your account to join opportunities",
      emailLabel: "Email",
      passwordLabel: "Password",
      loginButton: "Sign In",
      signupButton: "Create Account",
      forgotPassword: "Forgot Password?",
      noAccount: "Don't have an account?",
      hasAccount: "Already have an account?"
    },
    volunteer: {
      title: "Request Volunteer Opportunity",
      subtitle: "Tell us about your organization and volunteer needs",
      organizationLabel: "Organization Name",
      contactLabel: "Contact Person",
      emailLabel: "Email",
      phoneLabel: "Phone",
      descriptionLabel: "Opportunity Description",
      submitButton: "Submit Request"
    }
  }
};

/**
 * Fetch all content from MongoDB
 */
export async function fetchAllContent() {
  try {
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const collection = db.collection('content');
    
    const content = await collection.findOne({ type: 'siteContent' });
    return content ? content.data : DEFAULT_CONTENT;
  } catch (error) {
    console.error('Error fetching content from MongoDB:', error);
    return DEFAULT_CONTENT;
  }
}

/**
 * Get content with caching for performance
 */
export async function getContent() {
  const now = Date.now();
  
  // Return cached content if still valid
  if (contentCache && (now - lastCacheUpdate) < CACHE_DURATION) {
    return contentCache;
  }
  
  // Fetch fresh content
  const content = await fetchAllContent();
  contentCache = content;
  lastCacheUpdate = now;
  
  return content;
}

/**
 * Get specific content section
 */
export async function getContentSection(section) {
  const content = await getContent();
  return content[section] || {};
}

/**
 * Get specific content key with fallback
 */
export async function getContentKey(path, fallback = '') {
  const content = await getContent();
  const keys = path.split('.');
  let value = content;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return fallback;
    }
  }
  
  return value || fallback;
}

/**
 * Update content in MongoDB
 */
export async function updateContent(newContent) {
  try {
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const collection = db.collection('content');
    
    // Upsert the content
    await collection.updateOne(
      { type: 'siteContent' },
      { 
        $set: { 
          data: newContent,
          updatedAt: new Date(),
          updatedBy: 'admin' // This should be passed from the admin context
        }
      },
      { upsert: true }
    );
    
    // Clear cache to force refresh
    contentCache = null;
    lastCacheUpdate = 0;
    
    return { success: true };
  } catch (error) {
    console.error('Error updating content:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Initialize content in database if it doesn't exist
 */
export async function initializeContent() {
  try {
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const collection = db.collection('content');
    
    // Check if content already exists
    const existingContent = await collection.findOne({ type: 'siteContent' });
    
    if (!existingContent) {
      // Insert default content
      await collection.insertOne({
        type: 'siteContent',
        data: DEFAULT_CONTENT,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      });
      
      console.log('✅ Default content initialized in database');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error initializing content:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get content structure for admin interface
 */
export function getContentStructure() {
  return {
    sections: Object.keys(DEFAULT_CONTENT),
    structure: DEFAULT_CONTENT
  };
}

/**
 * Get field descriptions for admin interface
 */
export function getFieldDescriptions() {
  return {
    homepage: {
      hero: {
        title: "Main headline on the homepage hero section",
        subtitle: "Subtitle text below the main headline",
        ctaPrimary: "Primary call-to-action button text",
        ctaSecondary: "Secondary call-to-action button text"
      },
      search: {
        placeholder: "Search input placeholder text",
        filterAll: "Label for 'All' filter option",
        filterCommunity: "Label for Community filter",
        filterEducation: "Label for Education filter",
        filterEnvironment: "Label for Environment filter",
        filterHealth: "Label for Health filter",
        filterTechnology: "Label for Technology filter"
      },
      testimonials: {
        title: "Section title for testimonials",
        subtitle: "Subtitle for testimonials section"
      },
      contact: {
        title: "Contact section title",
        subtitle: "Contact section subtitle",
        formTitle: "Form title text",
        nameLabel: "Name field label",
        emailLabel: "Email field label",
        messageLabel: "Message field label",
        submitButton: "Submit button text",
        successMessage: "Success message after form submission",
        errorMessage: "Error message if form submission fails"
      }
    },
    about: {
      hero: {
        title: "About page hero title",
        subtitle: "About page hero subtitle"
      },
      mission: {
        title: "Mission section title",
        description: "Mission statement and description"
      },
      impact: {
        title: "Impact section title"
      },
      whatWeDo: {
        title: "What We Do section title",
        description: "Description of what the organization does"
      }
    },
    navigation: {
      home: "Home menu item text",
      about: "About menu item text",
      opportunities: "Opportunities menu item text",
      login: "Login button text",
      signup: "Sign up button text",
      dashboard: "Dashboard menu item text",
      admin: "Admin menu item text",
      logout: "Logout button text"
    },
    footer: {
      description: "Footer description text",
      quickLinks: "Quick links section title",
      contact: "Contact section title",
      social: "Social media section title",
      copyright: "Copyright text"
    },
    common: {
      loading: "Loading state text",
      error: "Generic error message",
      success: "Generic success message",
      cancel: "Cancel button text",
      save: "Save button text",
      edit: "Edit button text",
      delete: "Delete button text",
      confirm: "Confirm button text",
      back: "Back button text",
      next: "Next button text",
      previous: "Previous button text",
      close: "Close button text",
      submit: "Submit button text",
      search: "Search button text",
      filter: "Filter button text",
      clear: "Clear button text",
      view: "View button text",
      join: "Join button text",
      leave: "Leave button text",
      apply: "Apply button text",
      learnMore: "Learn more button text",
      noResults: "No results message",
      noData: "No data available message"
    },
    modals: {
      auth: {
        title: "Authentication modal title",
        subtitle: "Authentication modal subtitle",
        emailLabel: "Email field label",
        passwordLabel: "Password field label",
        loginButton: "Login button text",
        signupButton: "Sign up button text",
        forgotPassword: "Forgot password link text",
        noAccount: "No account message",
        hasAccount: "Has account message"
      },
      volunteer: {
        title: "Volunteer request modal title",
        subtitle: "Volunteer request modal subtitle",
        organizationLabel: "Organization name field label",
        contactLabel: "Contact person field label",
        emailLabel: "Email field label",
        phoneLabel: "Phone field label",
        descriptionLabel: "Description field label",
        submitButton: "Submit button text"
      }
    }
  };
}