// Only import MongoDB on the server side
let clientPromise = null;
if (typeof window === 'undefined') {
  // Server-side only
  try {
    const mongodbModule = await import('./mongodb.js');
    clientPromise = mongodbModule.default;
  } catch (error) {
    console.warn('MongoDB module not available:', error.message);
  }
}

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
    },
    opportunities: {
      title: "Available Opportunities",
      subtitle: "Find meaningful ways to serve your community",
      noResults: "No opportunities found matching your criteria",
      viewDetails: "View Details",
      joinOpportunity: "Join Opportunity",
      learnMore: "Learn More",
      groupSignup: "Group Signup",
      companyInfo: "Company Information"
    },
    floatingCards: {
      volunteerTitle: "Volunteer",
      volunteerDescription: "Find opportunities that match your interests and schedule",
      organizationTitle: "Organization",
      organizationDescription: "Post opportunities and connect with passionate volunteers",
      communityTitle: "Community",
      communityDescription: "Build stronger connections through meaningful service"
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
      title: "Our Impact",
      volunteersServed: "Volunteers Served",
      organizationsHelped: "Organizations Helped",
      hoursContributed: "Hours Contributed",
      opportunitiesPosted: "Opportunities Posted"
    },
    whatWeDo: {
      title: "What We Do",
      description: "We connect passionate individuals with meaningful volunteer opportunities that create lasting positive change in our community.",
      connectTitle: "Connect",
      connectDescription: "We bridge the gap between volunteers and organizations",
      empowerTitle: "Empower",
      empowerDescription: "We empower individuals to make a difference in their community",
      transformTitle: "Transform",
      transformDescription: "We transform communities through collective action"
    },
    cta: {
      title: "Ready to Make a Difference?",
      subtitle: "Join our community of volunteers and organizations",
      findOpportunities: "Find Opportunities",
      learnMore: "Learn More"
    }
  },
  
  // Header and navigation
  navigation: {
    home: "Home",
    about: "About",
    opportunities: "Opportunities",
    contact: "Contact",
    login: "Login",
    signup: "Sign Up",
    dashboard: "Dashboard",
    admin: "Admin",
    logout: "Logout",
    profile: "Profile",
    settings: "Settings",
    volunteerRequest: "Request Volunteers"
  },
  
  // Footer content
  footer: {
    description: "Connecting passionate volunteers with meaningful opportunities to create lasting impact in our community.",
    quickLinks: "Quick Links",
    contact: "Contact",
    social: "Follow Us",
    copyright: "© 2024 Community Connect. All rights reserved.",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    accessibility: "Accessibility",
    contactUs: "Contact Us",
    support: "Support"
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
    noData: "No data available",
    yes: "Yes",
    no: "No",
    ok: "OK",
    retry: "Retry",
    refresh: "Refresh",
    update: "Update",
    create: "Create",
    add: "Add",
    remove: "Remove",
    select: "Select",
    choose: "Choose",
    upload: "Upload",
    download: "Download",
    share: "Share",
    copy: "Copy",
    paste: "Paste",
    undo: "Undo",
    redo: "Redo",
    expand: "Expand",
    collapse: "Collapse",
    show: "Show",
    hide: "Hide",
    enable: "Enable",
    disable: "Disable",
    active: "Active",
    inactive: "Inactive",
    online: "Online",
    offline: "Offline",
    public: "Public",
    private: "Private",
    open: "Open",
    closed: "Closed",
    available: "Available",
    unavailable: "Unavailable",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    completed: "Completed",
    inProgress: "In Progress",
    scheduled: "Scheduled",
    cancelled: "Cancelled",
    expired: "Expired",
    archived: "Archived",
    draft: "Draft",
    published: "Published",
    unpublished: "Unpublished"
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
      hasAccount: "Already have an account?",
      signupTitle: "Create Account",
      signupSubtitle: "Join our community of volunteers",
      firstNameLabel: "First Name",
      lastNameLabel: "Last Name",
      confirmPasswordLabel: "Confirm Password",
      termsAgreement: "I agree to the Terms of Service and Privacy Policy",
      emailPlaceholder: "Enter your email",
      passwordPlaceholder: "Enter your password",
      firstNamePlaceholder: "Enter your first name",
      lastNamePlaceholder: "Enter your last name",
      confirmPasswordPlaceholder: "Confirm your password"
    },
    volunteer: {
      title: "Request Volunteer Opportunity",
      subtitle: "Tell us about your organization and volunteer needs",
      organizationLabel: "Organization Name",
      contactLabel: "Contact Person",
      emailLabel: "Email",
      phoneLabel: "Phone",
      descriptionLabel: "Opportunity Description",
      submitButton: "Submit Request",
      organizationPlaceholder: "Enter your organization name",
      contactPlaceholder: "Enter contact person name",
      emailPlaceholder: "Enter your email address",
      phonePlaceholder: "Enter your phone number",
      descriptionPlaceholder: "Describe the volunteer opportunity",
      successMessage: "Thank you! Your request has been submitted successfully.",
      errorMessage: "Sorry, there was an error submitting your request. Please try again."
    },
    companyAuth: {
      title: "Organization Login",
      subtitle: "Access your organization dashboard",
      emailLabel: "Email",
      passwordLabel: "Password",
      loginButton: "Sign In",
      forgotPassword: "Forgot Password?",
      noAccount: "Don't have an organization account?",
      contactAdmin: "Contact Admin",
      emailPlaceholder: "Enter your email",
      passwordPlaceholder: "Enter your password"
    },
    groupSignup: {
      title: "Group Signup",
      subtitle: "Sign up multiple people for this opportunity",
      participantLabel: "Participant",
      addParticipant: "Add Participant",
      removeParticipant: "Remove Participant",
      submitButton: "Submit Group Signup",
      successMessage: "Group signup submitted successfully!",
      errorMessage: "Error submitting group signup. Please try again.",
      participantPlaceholder: "Enter participant name",
      emailPlaceholder: "Enter participant email"
    },
    companyInfo: {
      title: "Organization Information",
      closeButton: "Close",
      website: "Website",
      phone: "Phone",
      email: "Email",
      address: "Address",
      description: "Description",
      contactPerson: "Contact Person"
    },
    messageBox: {
      title: "Message",
      okButton: "OK",
      cancelButton: "Cancel",
      confirmButton: "Confirm"
    }
  },
  
  // Dashboard content
  dashboard: {
    user: {
      title: "My Dashboard",
      subtitle: "Manage your volunteer activities and opportunities",
      welcome: "Welcome back",
      upcomingOpportunities: "Upcoming Opportunities",
      pastOpportunities: "Past Opportunities",
      savedOpportunities: "Saved Opportunities",
      profile: "My Profile",
      settings: "Settings",
      noUpcoming: "No upcoming opportunities",
      noPast: "No past opportunities",
      noSaved: "No saved opportunities",
      viewAll: "View All",
      editProfile: "Edit Profile",
      changePassword: "Change Password",
      notifications: "Notifications",
      preferences: "Preferences"
    },
    organization: {
      title: "Organization Dashboard",
      subtitle: "Manage your volunteer opportunities and volunteers",
      welcome: "Welcome back",
      activeOpportunities: "Active Opportunities",
      pendingOpportunities: "Pending Opportunities",
      completedOpportunities: "Completed Opportunities",
      volunteers: "Volunteers",
      analytics: "Analytics",
      settings: "Settings",
      noActive: "No active opportunities",
      noPending: "No pending opportunities",
      noCompleted: "No completed opportunities",
      noVolunteers: "No volunteers yet",
      createOpportunity: "Create Opportunity",
      editOpportunity: "Edit Opportunity",
      deleteOpportunity: "Delete Opportunity",
      viewVolunteers: "View Volunteers",
      exportData: "Export Data",
      organizationProfile: "Organization Profile"
    }
  },
  
  // Admin content
  admin: {
    title: "Admin Dashboard",
    subtitle: "Manage users, organizations, and content",
    users: "Users",
    organizations: "Organizations",
    opportunities: "Opportunities",
    content: "Content",
    themes: "Themes",
    analytics: "Analytics",
    settings: "Settings",
    pendingUsers: "Pending Users",
    pendingOrganizations: "Pending Organizations",
    blockedEmails: "Blocked Emails",
    userManagement: "User Management",
    organizationManagement: "Organization Management",
    opportunityManagement: "Opportunity Management",
    contentManagement: "Content Management",
    themeManagement: "Theme Management",
    approve: "Approve",
    reject: "Reject",
    delete: "Delete",
    edit: "Edit",
    view: "View",
    add: "Add",
    search: "Search",
    filter: "Filter",
    export: "Export",
    import: "Import",
    refresh: "Refresh",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    back: "Back",
    next: "Next",
    previous: "Previous",
    close: "Close",
    submit: "Submit",
    clear: "Clear",
    reset: "Reset",
    apply: "Apply",
    remove: "Remove",
    select: "Select",
    choose: "Choose",
    upload: "Upload",
    download: "Download",
    share: "Share",
    copy: "Copy",
    paste: "Paste",
    undo: "Undo",
    redo: "Redo",
    expand: "Expand",
    collapse: "Collapse",
    show: "Show",
    hide: "Hide",
    enable: "Enable",
    disable: "Disable",
    active: "Active",
    inactive: "Inactive",
    online: "Online",
    offline: "Offline",
    public: "Public",
    private: "Private",
    open: "Open",
    closed: "Closed",
    available: "Available",
    unavailable: "Unavailable",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    completed: "Completed",
    inProgress: "In Progress",
    scheduled: "Scheduled",
    cancelled: "Cancelled",
    expired: "Expired",
    archived: "Archived",
    draft: "Draft",
    published: "Published",
    unpublished: "Unpublished"
  },
  
  // Form content
  forms: {
    user: {
      title: "User Information",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      phone: "Phone",
      password: "Password",
      confirmPassword: "Confirm Password",
      currentPassword: "Current Password",
      newPassword: "New Password",
      bio: "Bio",
      interests: "Interests",
      skills: "Skills",
      availability: "Availability",
      preferences: "Preferences",
      notifications: "Notifications",
      privacy: "Privacy",
      firstNamePlaceholder: "Enter your first name",
      lastNamePlaceholder: "Enter your last name",
      emailPlaceholder: "Enter your email address",
      phonePlaceholder: "Enter your phone number",
      passwordPlaceholder: "Enter your password",
      confirmPasswordPlaceholder: "Confirm your password",
      currentPasswordPlaceholder: "Enter your current password",
      newPasswordPlaceholder: "Enter your new password",
      bioPlaceholder: "Tell us about yourself",
      interestsPlaceholder: "What are your interests?",
      skillsPlaceholder: "What skills do you have?",
      availabilityPlaceholder: "When are you available?",
      preferencesPlaceholder: "What are your preferences?",
      notificationsPlaceholder: "Notification preferences",
      privacyPlaceholder: "Privacy settings"
    },
    organization: {
      title: "Organization Information",
      name: "Organization Name",
      description: "Description",
      website: "Website",
      email: "Email",
      phone: "Phone",
      address: "Address",
      contactPerson: "Contact Person",
      category: "Category",
      mission: "Mission",
      vision: "Vision",
      values: "Values",
      logo: "Logo",
      images: "Images",
      documents: "Documents",
      namePlaceholder: "Enter organization name",
      descriptionPlaceholder: "Describe your organization",
      websitePlaceholder: "Enter website URL",
      emailPlaceholder: "Enter email address",
      phonePlaceholder: "Enter phone number",
      addressPlaceholder: "Enter address",
      contactPersonPlaceholder: "Enter contact person name",
      categoryPlaceholder: "Select category",
      missionPlaceholder: "Enter mission statement",
      visionPlaceholder: "Enter vision statement",
      valuesPlaceholder: "Enter organizational values"
    },
    opportunity: {
      title: "Opportunity Information",
      titleLabel: "Title",
      description: "Description",
      category: "Category",
      location: "Location",
      date: "Date",
      time: "Time",
      duration: "Duration",
      volunteers: "Number of Volunteers",
      requirements: "Requirements",
      benefits: "Benefits",
      contact: "Contact Information",
      images: "Images",
      documents: "Documents",
      titlePlaceholder: "Enter opportunity title",
      descriptionPlaceholder: "Describe the opportunity",
      categoryPlaceholder: "Select category",
      locationPlaceholder: "Enter location",
      datePlaceholder: "Select date",
      timePlaceholder: "Select time",
      durationPlaceholder: "Enter duration",
      volunteersPlaceholder: "Enter number of volunteers needed",
      requirementsPlaceholder: "Enter requirements",
      benefitsPlaceholder: "Enter benefits",
      contactPlaceholder: "Enter contact information"
    }
  },
  
  // Error pages
  errors: {
    notFound: {
      title: "Page Not Found",
      subtitle: "The page you're looking for doesn't exist",
      message: "Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.",
      backHome: "Back to Home",
      searchSite: "Search Site",
      contactSupport: "Contact Support"
    },
    serverError: {
      title: "Server Error",
      subtitle: "Something went wrong on our end",
      message: "We're experiencing technical difficulties. Please try again later or contact support if the problem persists.",
      tryAgain: "Try Again",
      backHome: "Back to Home",
      contactSupport: "Contact Support"
    },
    unauthorized: {
      title: "Unauthorized Access",
      subtitle: "You don't have permission to access this page",
      message: "You need to be logged in or have the proper permissions to access this page.",
      login: "Login",
      backHome: "Back to Home",
      contactSupport: "Contact Support"
    },
    forbidden: {
      title: "Access Forbidden",
      subtitle: "You don't have permission to access this resource",
      message: "You don't have the necessary permissions to access this resource. Please contact an administrator if you believe this is an error.",
      backHome: "Back to Home",
      contactSupport: "Contact Support"
    }
  },
  
  // Success pages
  success: {
    registration: {
      title: "Registration Successful",
      subtitle: "Welcome to Community Connect",
      message: "Your account has been created successfully. You can now log in and start exploring volunteer opportunities.",
      login: "Login Now",
      explore: "Explore Opportunities",
      dashboard: "Go to Dashboard"
    },
    opportunityJoin: {
      title: "Successfully Joined",
      subtitle: "You're now part of this opportunity",
      message: "You have successfully joined this volunteer opportunity. Check your email for confirmation and details.",
      viewDetails: "View Details",
      dashboard: "Go to Dashboard",
      exploreMore: "Explore More Opportunities"
    },
    organizationApproval: {
      title: "Organization Approved",
      subtitle: "Your organization has been approved",
      message: "Congratulations! Your organization has been approved. You can now post volunteer opportunities.",
      dashboard: "Go to Dashboard",
      createOpportunity: "Create Opportunity",
      viewProfile: "View Profile"
    }
  },
  
  // Email templates
  emails: {
    welcome: {
      subject: "Welcome to Community Connect",
      greeting: "Welcome to Community Connect!",
      message: "Thank you for joining our community of volunteers and organizations. We're excited to have you on board.",
      actionText: "Get Started",
      footer: "If you have any questions, please don't hesitate to contact us."
    },
    opportunityConfirmation: {
      subject: "Opportunity Confirmation",
      greeting: "Thank you for joining this opportunity!",
      message: "Your participation has been confirmed. Here are the details for your upcoming volunteer opportunity.",
      actionText: "View Details",
      footer: "If you need to make changes, please contact the organization directly."
    },
    organizationApproval: {
      subject: "Organization Approval",
      greeting: "Great news! Your organization has been approved.",
      message: "Your organization has been approved and you can now post volunteer opportunities on our platform.",
      actionText: "Create Opportunity",
      footer: "Thank you for being part of our community."
    },
    passwordReset: {
      subject: "Password Reset Request",
      greeting: "Password Reset Request",
      message: "You requested a password reset. Click the button below to create a new password.",
      actionText: "Reset Password",
      footer: "If you didn't request this, please ignore this email."
    }
  },
  
  // Notifications
  notifications: {
    title: "Notifications",
    noNotifications: "No notifications",
    markAllRead: "Mark all as read",
    clearAll: "Clear all",
    settings: "Notification Settings",
    email: "Email Notifications",
    push: "Push Notifications",
    sms: "SMS Notifications",
    types: {
      opportunity: "Opportunity Updates",
      organization: "Organization Updates",
      system: "System Updates",
      marketing: "Marketing Updates"
    }
  },
  
  // Search and filters
  search: {
    placeholder: "Search opportunities, organizations, or keywords...",
    noResults: "No results found",
    tryAgain: "Try adjusting your search terms",
    filters: "Filters",
    clearFilters: "Clear Filters",
    sortBy: "Sort By",
    relevance: "Relevance",
    date: "Date",
    title: "Title",
    category: "Category",
    location: "Location",
    distance: "Distance",
    duration: "Duration",
    volunteers: "Volunteers Needed"
  },
  
  // Pagination
  pagination: {
    previous: "Previous",
    next: "Next",
    page: "Page",
    of: "of",
    showing: "Showing",
    to: "to",
    ofResults: "of results",
    perPage: "per page",
    goToPage: "Go to page",
    jumpToPage: "Jump to page"
  },
  
  // Accessibility
  accessibility: {
    skipToContent: "Skip to main content",
    skipToNavigation: "Skip to navigation",
    skipToFooter: "Skip to footer",
    menu: "Menu",
    closeMenu: "Close menu",
    openMenu: "Open menu",
    search: "Search",
    closeSearch: "Close search",
    openSearch: "Open search",
    loading: "Loading",
    error: "Error",
    success: "Success",
    warning: "Warning",
    info: "Information",
    help: "Help",
    contact: "Contact",
    backToTop: "Back to top",
    increaseText: "Increase text size",
    decreaseText: "Decrease text size",
    highContrast: "High contrast",
    normalContrast: "Normal contrast",
    screenReader: "Screen reader friendly"
  }
};

/**
 * Fetch all content from MongoDB
 */
export async function fetchAllContent() {
  try {
    // Only run on server side
    if (typeof window !== 'undefined') {
      return DEFAULT_CONTENT;
    }
    
    if (!clientPromise) {
      return DEFAULT_CONTENT;
    }
    
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
    // Only run on server side
    if (typeof window !== 'undefined') {
      return { success: false, error: 'Cannot update content on client side' };
    }
    
    if (!clientPromise) {
      return { success: false, error: 'MongoDB not available' };
    }
    
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const collection = db.collection('content');
    
    // Validate the content structure
    if (!newContent || typeof newContent !== 'object') {
      return { success: false, error: 'Invalid content structure' };
    }
    
    // Upsert the content with better error handling
    const result = await collection.updateOne(
      { type: 'siteContent' },
      { 
        $set: { 
          data: newContent,
          updatedAt: new Date(),
          updatedBy: 'admin'
        }
      },
      { upsert: true }
    );
    
    // Verify the update was successful
    if (result.matchedCount === 0 && result.upsertedCount === 0) {
      return { success: false, error: 'Failed to update content in database' };
    }
    
    // Clear cache to force refresh
    contentCache = null;
    lastCacheUpdate = 0;
    
    // Verify the content was actually saved by fetching it back
    const savedContent = await collection.findOne({ type: 'siteContent' });
    if (!savedContent || !savedContent.data) {
      return { success: false, error: 'Content was not properly saved to database' };
    }
    
    console.log('✅ Content updated successfully in database');
    return { success: true, message: 'Content updated successfully' };
  } catch (error) {
    console.error('Error updating content:', error);
    return { success: false, error: error.message || 'Database update failed' };
  }
}

/**
 * Initialize content in database if it doesn't exist
 */
export async function initializeContent() {
  try {
    // Only run on server side
    if (typeof window !== 'undefined') {
      return { success: false, error: 'Cannot initialize content on client side' };
    }
    
    if (!clientPromise) {
      return { success: false, error: 'MongoDB not available' };
    }
    
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
      },
      opportunities: {
        title: "Opportunities section title",
        subtitle: "Opportunities section subtitle",
        noResults: "Message when no opportunities are found",
        viewDetails: "Button text to view opportunity details",
        joinOpportunity: "Button text to join an opportunity",
        learnMore: "Button text to learn more about an opportunity",
        groupSignup: "Button text for group signup",
        companyInfo: "Button text to view company information"
      },
      floatingCards: {
        volunteerTitle: "Title for volunteer card",
        volunteerDescription: "Description for volunteer card",
        organizationTitle: "Title for organization card",
        organizationDescription: "Description for organization card",
        communityTitle: "Title for community card",
        communityDescription: "Description for community card"
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
        title: "Impact section title",
        volunteersServed: "Label for volunteers served metric",
        organizationsHelped: "Label for organizations helped metric",
        hoursContributed: "Label for hours contributed metric",
        opportunitiesPosted: "Label for opportunities posted metric"
      },
      whatWeDo: {
        title: "What We Do section title",
        description: "Description of what the organization does",
        connectTitle: "Title for connect section",
        connectDescription: "Description for connect section",
        empowerTitle: "Title for empower section",
        empowerDescription: "Description for empower section",
        transformTitle: "Title for transform section",
        transformDescription: "Description for transform section"
      },
      cta: {
        title: "Call-to-action section title",
        subtitle: "Call-to-action section subtitle",
        findOpportunities: "Button text to find opportunities",
        learnMore: "Button text to learn more"
      }
    },
    navigation: {
      home: "Home menu item text",
      about: "About menu item text",
      opportunities: "Opportunities menu item text",
      contact: "Contact menu item text",
      login: "Login button text",
      signup: "Sign up button text",
      dashboard: "Dashboard menu item text",
      admin: "Admin menu item text",
      logout: "Logout button text",
      profile: "Profile menu item text",
      settings: "Settings menu item text",
      volunteerRequest: "Volunteer request button text"
    },
    footer: {
      description: "Footer description text",
      quickLinks: "Quick links section title",
      contact: "Contact section title",
      social: "Social media section title",
      copyright: "Copyright text",
      privacyPolicy: "Privacy policy link text",
      termsOfService: "Terms of service link text",
      accessibility: "Accessibility link text",
      contactUs: "Contact us link text",
      support: "Support link text"
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
      noData: "No data available message",
      yes: "Yes button text",
      no: "No button text",
      ok: "OK button text",
      retry: "Retry button text",
      refresh: "Refresh button text",
      update: "Update button text",
      create: "Create button text",
      add: "Add button text",
      remove: "Remove button text",
      select: "Select button text",
      choose: "Choose button text",
      upload: "Upload button text",
      download: "Download button text",
      share: "Share button text",
      copy: "Copy button text",
      paste: "Paste button text",
      undo: "Undo button text",
      redo: "Redo button text",
      expand: "Expand button text",
      collapse: "Collapse button text",
      show: "Show button text",
      hide: "Hide button text",
      enable: "Enable button text",
      disable: "Disable button text",
      active: "Active status text",
      inactive: "Inactive status text",
      online: "Online status text",
      offline: "Offline status text",
      public: "Public status text",
      private: "Private status text",
      open: "Open status text",
      closed: "Closed status text",
      available: "Available status text",
      unavailable: "Unavailable status text",
      pending: "Pending status text",
      approved: "Approved status text",
      rejected: "Rejected status text",
      completed: "Completed status text",
      inProgress: "In Progress status text",
      scheduled: "Scheduled status text",
      cancelled: "Cancelled status text",
      expired: "Expired status text",
      archived: "Archived status text",
      draft: "Draft status text",
      published: "Published status text",
      unpublished: "Unpublished status text"
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
        hasAccount: "Has account message",
        signupTitle: "Signup modal title",
        signupSubtitle: "Signup modal subtitle",
        firstNameLabel: "First name field label",
        lastNameLabel: "Last name field label",
        confirmPasswordLabel: "Confirm password field label",
        termsAgreement: "Terms agreement text",
        emailPlaceholder: "Email field placeholder",
        passwordPlaceholder: "Password field placeholder",
        firstNamePlaceholder: "First name field placeholder",
        lastNamePlaceholder: "Last name field placeholder",
        confirmPasswordPlaceholder: "Confirm password field placeholder"
      },
      volunteer: {
        title: "Volunteer request modal title",
        subtitle: "Volunteer request modal subtitle",
        organizationLabel: "Organization name field label",
        contactLabel: "Contact person field label",
        emailLabel: "Email field label",
        phoneLabel: "Phone field label",
        descriptionLabel: "Description field label",
        submitButton: "Submit button text",
        organizationPlaceholder: "Organization name field placeholder",
        contactPlaceholder: "Contact person field placeholder",
        emailPlaceholder: "Email field placeholder",
        phonePlaceholder: "Phone field placeholder",
        descriptionPlaceholder: "Description field placeholder",
        successMessage: "Success message after submission",
        errorMessage: "Error message after submission"
      },
      companyAuth: {
        title: "Company authentication modal title",
        subtitle: "Company authentication modal subtitle",
        emailLabel: "Email field label",
        passwordLabel: "Password field label",
        loginButton: "Login button text",
        forgotPassword: "Forgot password link text",
        noAccount: "No account message",
        contactAdmin: "Contact admin link text",
        emailPlaceholder: "Email field placeholder",
        passwordPlaceholder: "Password field placeholder"
      },
      groupSignup: {
        title: "Group signup modal title",
        subtitle: "Group signup modal subtitle",
        participantLabel: "Participant field label",
        addParticipant: "Add participant button text",
        removeParticipant: "Remove participant button text",
        submitButton: "Submit button text",
        successMessage: "Success message after submission",
        errorMessage: "Error message after submission",
        participantPlaceholder: "Participant name field placeholder",
        emailPlaceholder: "Participant email field placeholder"
      },
      companyInfo: {
        title: "Company information modal title",
        closeButton: "Close button text",
        website: "Website label",
        phone: "Phone label",
        email: "Email label",
        address: "Address label",
        description: "Description label",
        contactPerson: "Contact person label"
      },
      messageBox: {
        title: "Message box title",
        okButton: "OK button text",
        cancelButton: "Cancel button text",
        confirmButton: "Confirm button text"
      }
    },
    dashboard: {
      user: {
        title: "User dashboard title",
        subtitle: "User dashboard subtitle",
        welcome: "Welcome message",
        upcomingOpportunities: "Upcoming opportunities section title",
        pastOpportunities: "Past opportunities section title",
        savedOpportunities: "Saved opportunities section title",
        profile: "Profile section title",
        settings: "Settings section title",
        noUpcoming: "No upcoming opportunities message",
        noPast: "No past opportunities message",
        noSaved: "No saved opportunities message",
        viewAll: "View all button text",
        editProfile: "Edit profile button text",
        changePassword: "Change password button text",
        notifications: "Notifications section title",
        preferences: "Preferences section title"
      },
      organization: {
        title: "Organization dashboard title",
        subtitle: "Organization dashboard subtitle",
        welcome: "Welcome message",
        activeOpportunities: "Active opportunities section title",
        pendingOpportunities: "Pending opportunities section title",
        completedOpportunities: "Completed opportunities section title",
        volunteers: "Volunteers section title",
        analytics: "Analytics section title",
        settings: "Settings section title",
        noActive: "No active opportunities message",
        noPending: "No pending opportunities message",
        noCompleted: "No completed opportunities message",
        noVolunteers: "No volunteers message",
        createOpportunity: "Create opportunity button text",
        editOpportunity: "Edit opportunity button text",
        deleteOpportunity: "Delete opportunity button text",
        viewVolunteers: "View volunteers button text",
        exportData: "Export data button text",
        organizationProfile: "Organization profile section title"
      }
    },
    admin: {
      title: "Admin dashboard title",
      subtitle: "Admin dashboard subtitle",
      users: "Users section title",
      organizations: "Organizations section title",
      opportunities: "Opportunities section title",
      content: "Content section title",
      themes: "Themes section title",
      analytics: "Analytics section title",
      settings: "Settings section title",
      pendingUsers: "Pending users section title",
      pendingOrganizations: "Pending organizations section title",
      blockedEmails: "Blocked emails section title",
      userManagement: "User management section title",
      organizationManagement: "Organization management section title",
      opportunityManagement: "Opportunity management section title",
      contentManagement: "Content management section title",
      themeManagement: "Theme management section title",
      approve: "Approve button text",
      reject: "Reject button text",
      delete: "Delete button text",
      edit: "Edit button text",
      view: "View button text",
      add: "Add button text",
      search: "Search button text",
      filter: "Filter button text",
      export: "Export button text",
      import: "Import button text",
      refresh: "Refresh button text",
      save: "Save button text",
      cancel: "Cancel button text",
      confirm: "Confirm button text",
      back: "Back button text",
      next: "Next button text",
      previous: "Previous button text",
      close: "Close button text",
      submit: "Submit button text",
      clear: "Clear button text",
      reset: "Reset button text",
      apply: "Apply button text",
      remove: "Remove button text",
      select: "Select button text",
      choose: "Choose button text",
      upload: "Upload button text",
      download: "Download button text",
      share: "Share button text",
      copy: "Copy button text",
      paste: "Paste button text",
      undo: "Undo button text",
      redo: "Redo button text",
      expand: "Expand button text",
      collapse: "Collapse button text",
      show: "Show button text",
      hide: "Hide button text",
      enable: "Enable button text",
      disable: "Disable button text",
      active: "Active status text",
      inactive: "Inactive status text",
      online: "Online status text",
      offline: "Offline status text",
      public: "Public status text",
      private: "Private status text",
      open: "Open status text",
      closed: "Closed status text",
      available: "Available status text",
      unavailable: "Unavailable status text",
      pending: "Pending status text",
      approved: "Approved status text",
      rejected: "Rejected status text",
      completed: "Completed status text",
      inProgress: "In Progress status text",
      scheduled: "Scheduled status text",
      cancelled: "Cancelled status text",
      expired: "Expired status text",
      archived: "Archived status text",
      draft: "Draft status text",
      published: "Published status text",
      unpublished: "Unpublished status text"
    },
    forms: {
      user: {
        title: "User form title",
        firstName: "First name field label",
        lastName: "Last name field label",
        email: "Email field label",
        phone: "Phone field label",
        password: "Password field label",
        confirmPassword: "Confirm password field label",
        currentPassword: "Current password field label",
        newPassword: "New password field label",
        bio: "Bio field label",
        interests: "Interests field label",
        skills: "Skills field label",
        availability: "Availability field label",
        preferences: "Preferences field label",
        notifications: "Notifications field label",
        privacy: "Privacy field label",
        firstNamePlaceholder: "First name field placeholder",
        lastNamePlaceholder: "Last name field placeholder",
        emailPlaceholder: "Email field placeholder",
        phonePlaceholder: "Phone field placeholder",
        passwordPlaceholder: "Password field placeholder",
        confirmPasswordPlaceholder: "Confirm password field placeholder",
        currentPasswordPlaceholder: "Current password field placeholder",
        newPasswordPlaceholder: "New password field placeholder",
        bioPlaceholder: "Bio field placeholder",
        interestsPlaceholder: "Interests field placeholder",
        skillsPlaceholder: "Skills field placeholder",
        availabilityPlaceholder: "Availability field placeholder",
        preferencesPlaceholder: "Preferences field placeholder",
        notificationsPlaceholder: "Notifications field placeholder",
        privacyPlaceholder: "Privacy field placeholder"
      },
      organization: {
        title: "Organization form title",
        name: "Organization name field label",
        description: "Description field label",
        website: "Website field label",
        email: "Email field label",
        phone: "Phone field label",
        address: "Address field label",
        contactPerson: "Contact person field label",
        category: "Category field label",
        mission: "Mission field label",
        vision: "Vision field label",
        values: "Values field label",
        logo: "Logo field label",
        images: "Images field label",
        documents: "Documents field label",
        namePlaceholder: "Organization name field placeholder",
        descriptionPlaceholder: "Description field placeholder",
        websitePlaceholder: "Website field placeholder",
        emailPlaceholder: "Email field placeholder",
        phonePlaceholder: "Phone field placeholder",
        addressPlaceholder: "Address field placeholder",
        contactPersonPlaceholder: "Contact person field placeholder",
        categoryPlaceholder: "Category field placeholder",
        missionPlaceholder: "Mission field placeholder",
        visionPlaceholder: "Vision field placeholder",
        valuesPlaceholder: "Values field placeholder"
      },
      opportunity: {
        title: "Opportunity form title",
        titleLabel: "Title field label",
        description: "Description field label",
        category: "Category field label",
        location: "Location field label",
        date: "Date field label",
        time: "Time field label",
        duration: "Duration field label",
        volunteers: "Number of volunteers field label",
        requirements: "Requirements field label",
        benefits: "Benefits field label",
        contact: "Contact information field label",
        images: "Images field label",
        documents: "Documents field label",
        titlePlaceholder: "Title field placeholder",
        descriptionPlaceholder: "Description field placeholder",
        categoryPlaceholder: "Category field placeholder",
        locationPlaceholder: "Location field placeholder",
        datePlaceholder: "Date field placeholder",
        timePlaceholder: "Time field placeholder",
        durationPlaceholder: "Duration field placeholder",
        volunteersPlaceholder: "Number of volunteers field placeholder",
        requirementsPlaceholder: "Requirements field placeholder",
        benefitsPlaceholder: "Benefits field placeholder",
        contactPlaceholder: "Contact information field placeholder"
      }
    },
    errors: {
      notFound: {
        title: "404 page title",
        subtitle: "404 page subtitle",
        message: "404 page message",
        backHome: "Back to home button text",
        searchSite: "Search site button text",
        contactSupport: "Contact support button text"
      },
      serverError: {
        title: "500 page title",
        subtitle: "500 page subtitle",
        message: "500 page message",
        tryAgain: "Try again button text",
        backHome: "Back to home button text",
        contactSupport: "Contact support button text"
      },
      unauthorized: {
        title: "401 page title",
        subtitle: "401 page subtitle",
        message: "401 page message",
        login: "Login button text",
        backHome: "Back to home button text",
        contactSupport: "Contact support button text"
      },
      forbidden: {
        title: "403 page title",
        subtitle: "403 page subtitle",
        message: "403 page message",
        backHome: "Back to home button text",
        contactSupport: "Contact support button text"
      }
    },
    success: {
      registration: {
        title: "Registration success page title",
        subtitle: "Registration success page subtitle",
        message: "Registration success message",
        login: "Login button text",
        explore: "Explore opportunities button text",
        dashboard: "Go to dashboard button text"
      },
      opportunityJoin: {
        title: "Opportunity join success page title",
        subtitle: "Opportunity join success page subtitle",
        message: "Opportunity join success message",
        viewDetails: "View details button text",
        dashboard: "Go to dashboard button text",
        exploreMore: "Explore more opportunities button text"
      },
      organizationApproval: {
        title: "Organization approval success page title",
        subtitle: "Organization approval success page subtitle",
        message: "Organization approval success message",
        dashboard: "Go to dashboard button text",
        createOpportunity: "Create opportunity button text",
        viewProfile: "View profile button text"
      }
    },
    emails: {
      welcome: {
        subject: "Welcome email subject",
        greeting: "Welcome email greeting",
        message: "Welcome email message",
        actionText: "Welcome email action button text",
        footer: "Welcome email footer"
      },
      opportunityConfirmation: {
        subject: "Opportunity confirmation email subject",
        greeting: "Opportunity confirmation email greeting",
        message: "Opportunity confirmation email message",
        actionText: "Opportunity confirmation email action button text",
        footer: "Opportunity confirmation email footer"
      },
      organizationApproval: {
        subject: "Organization approval email subject",
        greeting: "Organization approval email greeting",
        message: "Organization approval email message",
        actionText: "Organization approval email action button text",
        footer: "Organization approval email footer"
      },
      passwordReset: {
        subject: "Password reset email subject",
        greeting: "Password reset email greeting",
        message: "Password reset email message",
        actionText: "Password reset email action button text",
        footer: "Password reset email footer"
      }
    },
    notifications: {
      title: "Notifications section title",
      noNotifications: "No notifications message",
      markAllRead: "Mark all as read button text",
      clearAll: "Clear all button text",
      settings: "Notification settings button text",
      email: "Email notifications label",
      push: "Push notifications label",
      sms: "SMS notifications label",
      types: {
        opportunity: "Opportunity updates notification type",
        organization: "Organization updates notification type",
        system: "System updates notification type",
        marketing: "Marketing updates notification type"
      }
    },
    search: {
      placeholder: "Search input placeholder",
      noResults: "No search results message",
      tryAgain: "Try again message",
      filters: "Filters section title",
      clearFilters: "Clear filters button text",
      sortBy: "Sort by label",
      relevance: "Relevance sort option",
      date: "Date sort option",
      title: "Title sort option",
      category: "Category sort option",
      location: "Location sort option",
      distance: "Distance sort option",
      duration: "Duration sort option",
      volunteers: "Volunteers needed sort option"
    },
    pagination: {
      previous: "Previous page button text",
      next: "Next page button text",
      page: "Page label",
      of: "Of label",
      showing: "Showing label",
      to: "To label",
      ofResults: "Of results label",
      perPage: "Per page label",
      goToPage: "Go to page button text",
      jumpToPage: "Jump to page button text"
    },
    accessibility: {
      skipToContent: "Skip to main content link text",
      skipToNavigation: "Skip to navigation link text",
      skipToFooter: "Skip to footer link text",
      menu: "Menu button text",
      closeMenu: "Close menu button text",
      openMenu: "Open menu button text",
      search: "Search button text",
      closeSearch: "Close search button text",
      openSearch: "Open search button text",
      loading: "Loading state text",
      error: "Error state text",
      success: "Success state text",
      warning: "Warning state text",
      info: "Information state text",
      help: "Help link text",
      contact: "Contact link text",
      backToTop: "Back to top button text",
      increaseText: "Increase text size button text",
      decreaseText: "Decrease text size button text",
      highContrast: "High contrast mode button text",
      normalContrast: "Normal contrast mode button text",
      screenReader: "Screen reader friendly mode text"
    }
  };
}