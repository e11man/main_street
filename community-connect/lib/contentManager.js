import { staticContent } from './content/index.js';

/**
 * Static Content Manager for Community Connect
 * 
 * This module provides access to all static content for the application.
 * Content is now stored in static files instead of MongoDB for better performance
 * and simpler deployment.
 */

/**
 * Get all content
 */
export async function getContent() {
  return staticContent;
}

/**
 * Get specific content section
 */
export async function getContentSection(section) {
  return staticContent[section] || {};
}

/**
 * Get specific content key with fallback
 */
export async function getContentKey(path, fallback = '') {
  const keys = path.split('.');
  let value = staticContent;
  
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
 * Get content structure for admin interface
 * Note: This is kept for compatibility but content is now static
 */
export function getContentStructure() {
  return {
    sections: Object.keys(staticContent),
    structure: staticContent
  };
}

/**
 * Get field descriptions for admin interface
 * Note: This is kept for compatibility but content is now static
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
    }
  };
}

// Legacy functions for compatibility (now return static content)
export async function fetchAllContent() {
  return staticContent;
}

export async function updateContent(newContent) {
  console.warn('Content is now static and cannot be updated dynamically. Please edit the content files directly.');
  return { success: false, error: 'Content is now static and cannot be updated dynamically' };
}

export async function initializeContent() {
  console.warn('Content is now static and does not need initialization.');
  return { success: true, message: 'Content is already static' };
}