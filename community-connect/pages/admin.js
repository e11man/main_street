import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import ChatModal from '../components/Modal/ChatModal'; // Import ChatModal
import { useTheme } from '../contexts/ThemeContext';
import ContentManager from '../components/Admin/ContentManager';

// Add the full dorm list constant after imports
const DORM_DATA = {
  "Away From Campus": ["Upland (abroad)"],
  "Bergwall Hall": ["1st Bergwall", "2nd Bergwall", "3rd Bergwall", "4th Bergwall"],
  "Breuninger Hall": ["1st Breuninger", "2nd Breuninger", "3rd Breuninger"],
  "Brolund Hall": ["Residential Village Wing 6"],
  "Campbell Hall": ["Univ Apts-Campbell Hall-1st Fl", "Univ Apts-Campbell Hall-2nd Fl"],
  "Chiu Hall": ["Residential Village Wing 1"],
  "Commuter": ["Commuter Married", "Commuter Single"],
  "Corner House": ["Corner House Wing"],
  "Delta Apts": ["Delta Wing"],
  "English Hall": [
    "1st North English", "1st South English", "2nd Center English", 
    "2nd North English", "2nd South English", "3rd Center English", 
    "3rd North English", "3rd South English", "English Hall - Cellar"
  ],
  "Flanigan Hall": ["Residential Village Wing 3"],
  "Gerig Hall": ["2nd Gerig", "3rd Gerig", "4th Gerig"],
  "Gygi Hall": ["Residential Village Wing 2"],
  "Haven on 2nd": ["Second South Street", "West Spencer Avenue"],
  "Jacobsen Hall": ["Residential Village Wing 7"],
  "Kerlin Hall": ["Residential Village Wing 5"],
  "Off-Campus Housing": [],
  "Olson Hall": [
    "1st East Olson", "1st West Olson", "2nd Center Olson", 
    "2nd East Olson", "2nd West Olson", "3rd Center Olson", 
    "3rd East Olson", "3rd West Olson"
  ],
  "Robbins Hall": ["Residential Village Wing 4"],
  "Sammy Morris Hall": [
    "1st Morris Center", "1st Morris North", "1st Morris South", 
    "2nd Morris Center", "2nd Morris North", "2nd Morris South", 
    "3rd Morris Center", "3rd Morris North", "3rd Morris South", 
    "4th Morris Center", "4th Morris North", "4th Morris South"
  ],
  "Swallow Robin Hall": ["1st Swallow", "2nd Swallow", "3rd Swallow"],
  "The Flats Apartments": ["Casa Wing"],
  "Wengatz Hall": [
    "1st East Wengatz", "1st West Wengatz", "2nd Center Wengatz", 
    "2nd East Wengatz", "2nd West Wengatz", "3rd Center Wengatz", 
    "3rd East Wengatz", "3rd West Wengatz"
  ],
  "Wolgemuth Hall": [
    "Univ Apt-Wolgemuth Hall-1st Fl", "Univ Apt-Wolgemuth Hall-2nd Fl", 
    "Univ Apt-Wolgemuth Hall-3rd Fl"
  ]
};

export default function AdminPage() {
  const { refreshTheme } = useTheme(); // Access theme context
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [blockedEmails, setBlockedEmails] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingOrganizations, setPendingOrganizations] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [editingOrganization, setEditingOrganization] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddOpportunity, setShowAddOpportunity] = useState(false);
  const [showAddBlockedEmail, setShowAddBlockedEmail] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedOpportunityForChat, setSelectedOpportunityForChat] = useState(null);
  const [adminUser, setAdminUser] = useState(null); // To store admin user data for ChatModal
  const [sessionWarning, setSessionWarning] = useState(false);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(null);
  
  // Theme management states
  const [themes, setThemes] = useState([]);
  const [activeTheme, setActiveTheme] = useState(null);
  const [showAddTheme, setShowAddTheme] = useState(false);
  const [editingTheme, setEditingTheme] = useState(null);
  
  // Search states
  const [searchTerms, setSearchTerms] = useState({
    users: '',
    pendingUsers: '',
    organizations: '',
    pendingOrganizations: '',
    opportunities: '',
    blockedEmails: '',
    themes: ''
  });
  
  // Email management states
  const [emailRecipients, setEmailRecipients] = useState({
    users: [],
    organizations: [],
    pas: []
  });
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const router = useRouter();

  // Check if already authenticated on page load
  useEffect(() => {
    console.log('🚀 Admin page loaded, checking authentication...');
    
    const adminAuth = localStorage.getItem('adminAuth');
    console.log('🔑 Admin auth from localStorage:', adminAuth);
    
    if (adminAuth === 'true') {
      console.log('✅ Found admin auth in localStorage, validating token...');
      
      // Validate token by making a test API call
      validateTokenAndFetchData();
    } else {
      console.log('❌ No admin auth found, user needs to login');
    }
  }, []);

  // New function to validate token and fetch data
  const validateTokenAndFetchData = async () => {
    try {
      console.log('🔍 Validating JWT token...');
      
      // Make a test call to verify token is still valid
      const testResponse = await fetch('/api/admin/users', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (testResponse.ok) {
        console.log('✅ Token is valid, setting up admin session...');
        
        const storedAdminUser = localStorage.getItem('adminUser');
        console.log('👤 Stored admin user:', storedAdminUser);
        
        if (storedAdminUser) {
          try {
            const parsedAdminUser = JSON.parse(storedAdminUser);
            console.log('👤 Parsed admin user:', parsedAdminUser);
            setAdminUser(parsedAdminUser);
          } catch (e) {
            console.error('❌ Failed to parse stored admin user:', e);
            setAdminUser({ _id: 'admin_user_id_placeholder', name: 'Admin', isAdmin: true });
          }
        } else {
          console.log('⚠️ No stored admin user, using fallback');
          setAdminUser({ _id: 'admin_user_id_placeholder', name: 'Admin', isAdmin: true });
        }
        
        setIsAuthenticated(true);
        console.log('📊 Starting initial data fetch...');
        fetchData();
      } else if (testResponse.status === 401) {
        console.log('❌ Token expired or invalid, clearing session...');
        handleTokenExpiration();
      } else {
        console.error('❌ Unexpected response during token validation:', testResponse.status);
        setError(`Authentication check failed: ${testResponse.status} ${testResponse.statusText}`);
      }
    } catch (error) {
      console.error('💥 Error validating token:', error);
      // Network error - could be offline, don't clear session immediately
      console.log('⚠️ Network error during token validation, trying to proceed...');
      
      const storedAdminUser = localStorage.getItem('adminUser');
      if (storedAdminUser) {
        try {
          const parsedAdminUser = JSON.parse(storedAdminUser);
          setAdminUser(parsedAdminUser);
          setIsAuthenticated(true);
        } catch (e) {
          console.error('❌ Failed to parse stored admin user:', e);
          handleTokenExpiration();
        }
      } else {
        handleTokenExpiration();
      }
    }
  };

  // New function to handle token expiration
  const handleTokenExpiration = () => {
    console.log('🔄 Handling token expiration...');
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminUser');
    setAdminUser(null);
    setError('Your session has expired. Please log in again.');
    
    // Clear any existing data
    setUsers([]);
    setOrganizations([]);
    setOpportunities([]);
    setBlockedEmails([]);
    setPendingUsers([]);
    setPendingOrganizations([]);
  };

  // Utility function for making authenticated API calls with automatic 401 handling
  const makeAuthenticatedRequest = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include'
      });

      if (response.status === 401) {
        console.log(`❌ 401 error for ${url} - token expired`);
        handleTokenExpiration();
        throw new Error('Session expired');
      }

      return response;
    } catch (error) {
      if (error.message === 'Session expired') {
        throw error;
      }
      console.error(`💥 Network error for ${url}:`, error);
      throw error;
    }
  };

  // Session management with automatic refresh
  useEffect(() => {
    if (!isAuthenticated) return;

    console.log('🕒 Setting up session management...');
    
    // Check session every 5 minutes
    const sessionCheckInterval = setInterval(async () => {
      try {
        console.log('🔍 Checking session validity...');
        const response = await fetch('/api/admin/users', {
          method: 'HEAD', // Use HEAD to avoid transferring data
          credentials: 'include'
        });

        if (response.status === 401) {
          console.log('❌ Session expired during check');
          handleTokenExpiration();
        } else {
          console.log('✅ Session still valid');
        }
      } catch (error) {
        console.error('💥 Error checking session:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Warning 5 minutes before expiration (23 hours after login)
    const warningTimeout = setTimeout(() => {
      setSessionWarning(true);
      setSessionTimeRemaining(5 * 60); // 5 minutes in seconds
      
      // Start countdown
      const countdownInterval = setInterval(() => {
        setSessionTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            handleTokenExpiration();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Store countdown interval to clear it if user refreshes session
      window.countdownInterval = countdownInterval;
    }, 23 * 60 * 60 * 1000); // 23 hours

    return () => {
      clearInterval(sessionCheckInterval);
      clearTimeout(warningTimeout);
      if (window.countdownInterval) {
        clearInterval(window.countdownInterval);
      }
    };
  }, [isAuthenticated]);

  // Function to refresh session
  const refreshSession = async () => {
    try {
      setLoading(true);
      console.log('🔄 Refreshing session...');
      
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          username: adminUser?.email || localStorage.getItem('adminEmail'), 
          password: 'refresh_token' // Special case for refresh
        }),
      });

      if (response.ok) {
        console.log('✅ Session refreshed successfully');
        setSessionWarning(false);
        setSessionTimeRemaining(null);
        if (window.countdownInterval) {
          clearInterval(window.countdownInterval);
        }
      } else {
        console.log('❌ Failed to refresh session');
        handleTokenExpiration();
      }
    } catch (error) {
      console.error('💥 Error refreshing session:', error);
      handleTokenExpiration();
    } finally {
      setLoading(false);
    }
  };

  // Function to extend session (simpler alternative to full refresh)
  const extendSession = async () => {
    try {
      console.log('⏰ Extending session...');
      // Make a simple authenticated request to reset the token timer
      const response = await makeAuthenticatedRequest('/api/admin/users', {
        method: 'HEAD'
      });

      if (response.ok) {
        console.log('✅ Session extended');
        setSessionWarning(false);
        setSessionTimeRemaining(null);
        if (window.countdownInterval) {
          clearInterval(window.countdownInterval);
        }
      }
    } catch (error) {
      console.error('💥 Error extending session:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Attempting admin login...');
      console.log('📧 Username:', username);
      
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({ username, password }),
      });

      console.log('📊 Login response status:', response.status);
      console.log('📊 Login response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const adminData = await response.json();
        console.log('✅ Login successful, admin data:', adminData);
        
        const adminUserDetails = {
           _id: adminData.admin?.id || adminData.admin?._id || adminData.id || adminData._id || 'default_admin_id',
           name: adminData.admin?.name || adminData.name || adminData.username || 'Admin',
           email: adminData.admin?.email || adminData.email || username,
           isAdmin: true
        };
        
        console.log('👤 Setting admin user details:', adminUserDetails);
        setAdminUser(adminUserDetails);
        localStorage.setItem('adminUser', JSON.stringify(adminUserDetails));
        localStorage.setItem('adminEmail', username); // Store email for session refresh
        setIsAuthenticated(true);
        localStorage.setItem('adminAuth', 'true');
        
        console.log('🔄 Starting data fetch after login...');
        fetchData();
      } else {
        const errorText = await response.text();
        console.error('❌ Login failed:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        try {
          const data = JSON.parse(errorText);
          setError(data.error || 'Invalid credentials');
        } catch {
          setError(`Login failed: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      setError('Network error during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    console.log('👋 Logging out admin user...');
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminEmail');
    setAdminUser(null);
    setUsername('');
    setPassword('');
    setSessionWarning(false);
    setSessionTimeRemaining(null);
    
    // Clear any session timers
    if (window.countdownInterval) {
      clearInterval(window.countdownInterval);
    }
    
    // Clear error state
    setError('');
    
    console.log('✅ Admin logout complete');
  };

  const openChatModalForAdmin = (opportunity) => {
    // Ensure opportunity has organizationId, if not, try to find it or use a placeholder
    console.log('Selected opportunity for chat:', opportunity);
    const opportunityWithOrganizationId = {
      ...opportunity,
      organizationId: opportunity.organizationId || opportunity.organization?._id || opportunity.organization, // Adjust based on actual structure
    };
    if (!opportunityWithOrganizationId.organizationId) {
      alert("Error: Organization ID missing for this opportunity. Admin cannot chat as host.");
      return;
    }
    setSelectedOpportunityForChat(opportunityWithOrganizationId);
    setIsChatModalOpen(true);
  };

  const viewChatHistory = async (opportunity) => {
    try {
      const response = await fetch(`/api/chat/history/${opportunity.id || opportunity._id}`);
      if (response.ok) {
        const chatHistory = await response.json();
        // For now, show an alert with basic info. In a real app, you'd open a detailed modal
        alert(`Chat History for "${opportunity.title}":\n\nTotal Messages: ${chatHistory.messages?.length || 0}\nParticipants: ${chatHistory.participants?.length || 0}\nLast Activity: ${chatHistory.lastActivity ? new Date(chatHistory.lastActivity).toLocaleString() : 'No activity'}`);
      } else {
        alert('Failed to fetch chat history');
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      alert('Error fetching chat history');
    }
  };

  const manageChatParticipants = async (opportunity) => {
    try {
      const response = await fetch(`/api/chat/participants/${opportunity.id || opportunity._id}`);
      if (response.ok) {
        const participants = await response.json();
        // For now, show an alert with participant info. In a real app, you'd open a management modal
        const participantList = participants.map(p => `${p.name} (${p.email})`).join('\n');
        alert(`Chat Participants for "${opportunity.title}":\n\n${participantList || 'No participants yet'}`);
      } else {
        alert('Failed to fetch chat participants');
      }
    } catch (error) {
      console.error('Error fetching chat participants:', error);
      alert('Error fetching chat participants');
    }
  };

  const fetchData = async () => {
    try {
      console.log('🔍 Starting fetchData...');
      
      // Fetch users
      console.log('📡 Fetching users from /api/admin/users...');
      const usersResponse = await fetch('/api/admin/users', {
        credentials: 'include'
      });
      
      console.log('📊 Users response status:', usersResponse.status);
      console.log('📊 Users response headers:', Object.fromEntries(usersResponse.headers.entries()));
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        console.log('✅ Users data received:', usersData.length, 'users');
        console.log('👥 Users data:', usersData);
        setUsers(usersData);
      } else if (usersResponse.status === 401) {
        console.log('❌ 401 error fetching users - token expired');
        handleTokenExpiration();
        return; // Stop further API calls
      } else {
        const errorText = await usersResponse.text();
        console.error('❌ Failed to fetch users:', {
          status: usersResponse.status,
          statusText: usersResponse.statusText,
          errorBody: errorText
        });
        setError(`Failed to fetch users: ${usersResponse.status} ${usersResponse.statusText}`);
        return; // Stop further API calls on error
      }

      // Fetch organizations
      const organizationsResponse = await fetch('/api/organizations', {
        credentials: 'include'
      });
      if (organizationsResponse.ok) {
        const organizationsData = await organizationsResponse.json();
        setOrganizations(organizationsData);
      } else if (organizationsResponse.status === 401) {
        console.log('❌ 401 error fetching organizations - token expired');
        handleTokenExpiration();
        return;
      }

      // Fetch opportunities
      const opportunitiesResponse = await fetch('/api/opportunities', {
        credentials: 'include'
      });
      if (opportunitiesResponse.ok) {
        const opportunitiesData = await opportunitiesResponse.json();
        setOpportunities(opportunitiesData);
      } else if (opportunitiesResponse.status === 401) {
        console.log('❌ 401 error fetching opportunities - token expired');
        handleTokenExpiration();
        return;
      }

      // Fetch blocked emails
      const blockedEmailsResponse = await fetch('/api/admin/blocked-emails', {
        credentials: 'include'
      });
      if (blockedEmailsResponse.ok) {
        const blockedEmailsData = await blockedEmailsResponse.json();
        setBlockedEmails(blockedEmailsData);
      } else if (blockedEmailsResponse.status === 401) {
        console.log('❌ 401 error fetching blocked emails - token expired');
        handleTokenExpiration();
        return;
      }

      // Fetch pending users
      const pendingUsersResponse = await fetch('/api/admin/pending-users', {
        credentials: 'include'
      });
      if (pendingUsersResponse.ok) {
        const pendingUsersData = await pendingUsersResponse.json();
        setPendingUsers(pendingUsersData);
      } else if (pendingUsersResponse.status === 401) {
        console.log('❌ 401 error fetching pending users - token expired');
        handleTokenExpiration();
        return;
      }

      // Fetch pending organizations
      const pendingOrganizationsResponse = await fetch('/api/admin/pending-organizations', {
        credentials: 'include'
      });
      if (pendingOrganizationsResponse.ok) {
        const pendingOrganizationsData = await pendingOrganizationsResponse.json();
        setPendingOrganizations(pendingOrganizationsData);
      } else if (pendingOrganizationsResponse.status === 401) {
        console.log('❌ 401 error fetching pending organizations - token expired');
        handleTokenExpiration();
        return;
      }

      // Fetch themes
      const themesResponse = await fetch('/api/admin/themes/list', {
        credentials: 'include'
      });
      if (themesResponse.ok) {
        const themesData = await themesResponse.json();
        setThemes(themesData);
        
        // Find and set active theme
        const activeThemeData = themesData.find(theme => theme.isActive);
        setActiveTheme(activeThemeData);
      } else if (themesResponse.status === 401) {
        console.log('❌ 401 error fetching themes - token expired');
        handleTokenExpiration();
        return;
      }

      console.log('✅ All data fetched successfully');
    } catch (error) {
      console.error('💥 Error in fetchData:', error);
      setError(`Network error: ${error.message}`);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await makeAuthenticatedRequest(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setUsers(users.filter(user => user._id !== userId));
        console.log('✅ User deleted successfully');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        alert(errorData.error || 'Failed to delete user');
      }
    } catch (error) {
      if (error.message !== 'Session expired') {
        alert('Error deleting user');
      }
    }
  };

  const deleteOpportunity = async (opportunityId) => {
    if (!confirm('Are you sure you want to delete this opportunity?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/opportunities/${opportunityId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setOpportunities(opportunities.filter(opp => opp.id !== opportunityId && opp._id !== opportunityId));
        alert('Opportunity deleted successfully');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete opportunity');
      }
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      alert('Error deleting opportunity');
    } finally {
      setLoading(false);
    }
  };

  const deleteOrganization = async (organizationId) => {
    if (!confirm('Are you sure you want to delete this organization?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/organizations/${organizationId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setOrganizations(organizations.filter(organization => organization._id !== organizationId && (organization.id !== organizationId || !organization.id)));
        alert('Organization deleted successfully');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete organization');
      }
    } catch (error) {
      console.error('Error deleting organization:', error);
      alert('Error deleting organization');
    } finally {
      setLoading(false);
    }
  };

  const addBlockedEmail = async (email) => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/blocked-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const newBlockedEmail = await response.json();
        setBlockedEmails([...blockedEmails, newBlockedEmail]);
        setShowAddBlockedEmail(false);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to block email');
      }
    } catch (error) {
      alert('Error blocking email');
    } finally {
      setLoading(false);
    }
  };

  const removeBlockedEmail = async (id) => {
    if (!confirm('Are you sure you want to unblock this email?')) return;

    try {
      const response = await fetch('/api/admin/blocked-emails', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setBlockedEmails(blockedEmails.filter(item => item._id !== id));
      } else {
        alert('Failed to unblock email');
      }
    } catch (error) {
      alert('Error unblocking email');
    }
  };

  const approveUser = async (userId) => {
    if (!confirm('Are you sure you want to approve this user?')) return;

    try {
      const response = await fetch('/api/admin/pending-users?approve=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setPendingUsers(pendingUsers.filter(user => user._id !== userId));
        // Refresh users list to include the newly approved user
        fetchData();
      } else {
        alert('Failed to approve user');
      }
    } catch (error) {
      alert('Error approving user');
    }
  };

  const rejectUser = async (userId) => {
    if (!confirm('Are you sure you want to reject this user?')) return;

    try {
      const response = await fetch('/api/admin/pending-users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setPendingUsers(pendingUsers.filter(user => user._id !== userId));
      } else {
        alert('Failed to reject user');
      }
    } catch (error) {
      alert('Error rejecting user');
    }
  };

  const approveOrganization = async (organizationId) => {
    if (!confirm('Are you sure you want to approve this organization?')) return;

    try {
      const response = await fetch('/api/admin/pending-organizations?approve=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ organizationId }),
      });

      if (response.ok) {
        setPendingOrganizations(pendingOrganizations.filter(organization => organization._id !== organizationId));
        // Refresh data to include the newly approved organization
        fetchData();
      } else {
        alert('Failed to approve organization');
      }
    } catch (error) {
      alert('Error approving organization');
    }
  };

  const rejectOrganization = async (organizationId) => {
    if (!confirm('Are you sure you want to reject this organization?')) return;

    try {
      const response = await fetch('/api/admin/pending-organizations', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ organizationId }),
      });

      if (response.ok) {
        setPendingOrganizations(pendingOrganizations.filter(organization => organization._id !== organizationId));
      } else {
        alert('Failed to reject organization');
      }
    } catch (error) {
      alert('Error rejecting organization');
    }
  };

  const promoteUser = async (userId, newRole) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest('/api/admin/promote-user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update the user in the local state
        setUsers(users.map(user => 
          user._id === userId ? data.user : user
        ));
        alert(data.message);
        console.log('✅ User promoted successfully');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        alert(errorData.error || 'Failed to promote user');
      }
    } catch (error) {
      if (error.message !== 'Session expired') {
        console.error('Error promoting user:', error);
        alert('Error promoting user');
      }
    } finally {
      setLoading(false);
    }
  };

  // Theme management functions
  const createTheme = async (themeData) => {
    try {
      console.log('🎨 Admin: Creating theme...', themeData);
      setLoading(true);
      const response = await makeAuthenticatedRequest('/api/admin/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(themeData)
      });

      if (response.ok) {
        const newTheme = await response.json();
        console.log('✅ Admin: Theme created successfully', newTheme);
        
        setThemes([...themes, newTheme]);
        setActiveTheme(newTheme);
        setShowAddTheme(false);
        
        // Refresh the theme in context immediately
        console.log('🔄 Admin: Refreshing theme context...');
        await refreshTheme();
        
        alert('Theme created and activated successfully!');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Admin: Failed to create theme:', errorData);
        alert(errorData.error || 'Failed to create theme');
      }
    } catch (error) {
      console.error('❌ Admin: Error creating theme:', error);
      if (error.message !== 'Session expired') {
        alert('Error creating theme');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateTheme = async (themeId, themeData) => {
    try {
      console.log('🎨 Admin: Updating theme...', { themeId, themeData });
      setLoading(true);
      const response = await makeAuthenticatedRequest('/api/admin/themes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId, ...themeData })
      });

      if (response.ok) {
        const updatedTheme = await response.json();
        console.log('✅ Admin: Theme updated successfully', updatedTheme);
        
        setThemes(themes.map(theme => theme._id === themeId ? updatedTheme : theme));
        
        if (updatedTheme.isActive) {
          setActiveTheme(updatedTheme);
        }
        
        setEditingTheme(null);
        
        // Refresh the theme in context if it's the active theme
        if (updatedTheme.isActive) {
          console.log('🔄 Admin: Refreshing theme context for active theme...');
          await refreshTheme();
        }
        
        alert('Theme updated successfully!');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Admin: Failed to update theme:', errorData);
        alert(errorData.error || 'Failed to update theme');
      }
    } catch (error) {
      console.error('❌ Admin: Error updating theme:', error);
      if (error.message !== 'Session expired') {
        alert('Error updating theme');
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteTheme = async (themeId) => {
    if (!confirm('Are you sure you want to delete this theme?')) return;

    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest('/api/admin/themes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId })
      });

      if (response.ok) {
        setThemes(themes.filter(theme => theme._id !== themeId));
        alert('Theme deleted successfully!');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        alert(errorData.error || 'Failed to delete theme');
      }
    } catch (error) {
      if (error.message !== 'Session expired') {
        alert('Error deleting theme');
      }
    } finally {
      setLoading(false);
    }
  };

  const activateTheme = async (themeId) => {
    if (!confirm('Are you sure you want to activate this theme? This will make it the active theme for all users.')) return;

    try {
      console.log('🎨 Admin: Activating theme...', themeId);
      setLoading(true);
      const response = await makeAuthenticatedRequest('/api/admin/themes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId, isActive: true })
      });

      if (response.ok) {
        const updatedTheme = await response.json();
        console.log('✅ Admin: Theme activated successfully', updatedTheme);
        
        // Update themes list: deactivate all others, activate selected
        setThemes(themes.map(theme => ({
          ...theme,
          isActive: theme._id === themeId
        })));
        
        setActiveTheme(updatedTheme);
        
        // Refresh the theme in context immediately
        console.log('🔄 Admin: Refreshing theme context for newly activated theme...');
        await refreshTheme();
        
        alert('Theme activated successfully!');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Admin: Failed to activate theme:', errorData);
        alert(errorData.error || 'Failed to activate theme');
      }
    } catch (error) {
      console.error('❌ Admin: Error activating theme:', error);
      if (error.message !== 'Session expired') {
        alert('Error activating theme');
      }
    } finally {
      setLoading(false);
    }
  };

  // Search filtering functions
  const handleSearchChange = (tab, value) => {
    setSearchTerms(prev => ({
      ...prev,
      [tab]: value
    }));
  };

  const filterUsers = (usersList, searchTerm) => {
    if (!searchTerm.trim()) return usersList;
    const term = searchTerm.toLowerCase();
    return usersList.filter(user => 
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term)
    );
  };

  const filterOrganizations = (organizationsList, searchTerm) => {
    if (!searchTerm.trim()) return organizationsList;
    const term = searchTerm.toLowerCase();
    return organizationsList.filter(organization => 
      organization.name?.toLowerCase().includes(term) ||
      organization.email?.toLowerCase().includes(term) ||
      organization.website?.toLowerCase().includes(term) ||
      organization.phone?.toLowerCase().includes(term) ||
      organization.description?.toLowerCase().includes(term)
    );
  };

  const filterOpportunities = (opportunitiesList, searchTerm) => {
    if (!searchTerm.trim()) return opportunitiesList;
    const term = searchTerm.toLowerCase();
    return opportunitiesList.filter(opportunity => 
      opportunity.title?.toLowerCase().includes(term) ||
      opportunity.description?.toLowerCase().includes(term) ||
      opportunity.category?.toLowerCase().includes(term) ||
      opportunity.location?.toLowerCase().includes(term) ||
      opportunity.priority?.toLowerCase().includes(term)
    );
  };

  const filterBlockedEmails = (emailsList, searchTerm) => {
    if (!searchTerm.trim()) return emailsList;
    const term = searchTerm.toLowerCase();
    return emailsList.filter(item => 
      item.email?.toLowerCase().includes(term)
    );
  };

  const filterThemes = (themesList, searchTerm) => {
    if (!searchTerm.trim()) return themesList;
    const term = searchTerm.toLowerCase();
    return themesList.filter(theme => 
      theme.name?.toLowerCase().includes(term) ||
      theme.fonts?.primary?.toLowerCase().includes(term) ||
      theme.fonts?.secondary?.toLowerCase().includes(term)
    );
  };

  // Email management functions
  const handleRecipientSelection = (type, items) => {
    setEmailRecipients(prev => ({
      ...prev,
      [type]: items
    }));
  };

  const handleEventSelection = (events) => {
    setSelectedEvents(events);
  };

  const generateEmailBody = () => {
    let body = emailBody;
    
    if (selectedEvents.length > 0) {
      const eventsInfo = selectedEvents.map(event => {
        return `
Event: ${event.title}
Date: ${event.date}
Time: ${event.arrivalTime} - ${event.departureTime}
Location: ${event.location}
Description: ${event.description}
Organization: ${event.organizationName}
Spots Available: ${event.spotsTotal - (event.spotsFilled || 0)}/${event.spotsTotal}
        `.trim();
      }).join('\n\n');
      
      body += `\n\n${eventsInfo}`;
    }
    
    return body;
  };

  const openEmailClient = async () => {
    const recipients = [
      ...emailRecipients.users.map(user => ({ type: 'user', id: user._id, email: user.email })),
      ...emailRecipients.organizations.map(org => ({ type: 'organization', id: org._id, email: org.email })),
      ...emailRecipients.pas.map(pa => ({ type: 'pa', id: pa._id, email: pa.email }))
    ].filter(r => r.email);

    if (recipients.length === 0) {
      alert('Please select at least one recipient');
      return;
    }

    const subject = emailSubject || 'Community Connect Update';
    const body = emailBody || '';

    setEmailLoading(true);
    
    try {
      const response = await fetch('/api/admin/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          recipients,
          events: selectedEvents,
          subject,
          body
        }),
      });

      if (response.ok) {
        const data = await response.json();
        window.open(data.mailtoLink, '_blank');
        
        // Reset form
        setEmailRecipients({ users: [], organizations: [], pas: [] });
        setSelectedEvents([]);
        setEmailSubject('');
        setEmailBody('');
        
        alert(`Email prepared for ${data.recipientCount} recipients. Your email client should open automatically.`);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to prepare email');
      }
    } catch (error) {
      console.error('Error preparing email:', error);
      alert('Error preparing email. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  const getPAs = () => {
    return users.filter(user => user.isPA || user.role === 'PA');
  };

  // Get filtered data
  const filteredUsers = filterUsers(users, searchTerms.users);
  const filteredPendingUsers = filterUsers(pendingUsers, searchTerms.pendingUsers);
  const filteredOrganizations = filterOrganizations(organizations, searchTerms.organizations);
  const filteredPendingOrganizations = filterOrganizations(pendingOrganizations, searchTerms.pendingOrganizations);
  const filteredOpportunities = filterOpportunities(opportunities, searchTerms.opportunities);
  const filteredBlockedEmails = filterBlockedEmails(blockedEmails, searchTerms.blockedEmails);
  const filteredThemes = filterThemes(themes, searchTerms.themes);

  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Admin Login - Community Connect</title>
        </Head>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  // Add User Modal
  const AddUserModal = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', dorm: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formData)
        });
        if (response.ok) {
          const newUser = await response.json();
          setUsers([...users, newUser]);
          setShowAddUser(false);
          setFormData({ name: '', email: '', password: '', dorm: '' });
        } else {
          alert('Failed to create user');
        }
      } catch (error) {
        alert('Error creating user');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-96">
          <h3 className="text-lg font-semibold mb-4">Add New User</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Dorm</label>
              <select
                value={formData.dorm}
                onChange={(e) => setFormData({...formData, dorm: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Choose dorm/building...</option>
                {Object.keys(DORM_DATA).sort().map((dorm) => (
                  <option key={dorm} value={dorm}>{dorm}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddUser(false)}
                className="px-4 py-2 text-gray-600 border rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Add Opportunity Modal
  const AddOpportunityModal = () => {
    const [formData, setFormData] = useState({
      title: '', description: '', category: 'Community', priority: 'Medium',
      date: '', time: '', totalSpots: '', location: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        const response = await fetch('/api/admin/opportunities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formData)
        });
        if (response.ok) {
          const newOpportunity = await response.json();
          setOpportunities([...opportunities, newOpportunity]);
          setShowAddOpportunity(false);
          setFormData({
            title: '', description: '', category: 'Community', priority: 'Medium',
            date: '', time: '', totalSpots: '', location: ''
          });
        } else {
          alert('Failed to create opportunity');
        }
      } catch (error) {
        alert('Error creating opportunity');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-96 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Add New Opportunity</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                rows="3"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="Community">Community</option>
                <option value="Education">Education</option>
                <option value="Environment">Environment</option>
                <option value="Health">Health</option>
                <option value="Fundraising">Fundraising</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Total Spots</label>
              <input
                type="number"
                value={formData.totalSpots}
                onChange={(e) => setFormData({...formData, totalSpots: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddOpportunity(false)}
                className="px-4 py-2 text-gray-600 border rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Opportunity'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Edit User Modal
  const EditUserModal = () => {
    const [formData, setFormData] = useState({
      _id: editingUser?._id || '',
      name: editingUser?.name || '',
      email: editingUser?.email || '',
      password: '',
      dorm: editingUser?.dorm || '',
      commitments: editingUser?.commitments || []
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        const updateData = { ...formData };
        // Only include password if it was changed
        if (!updateData.password) {
          delete updateData.password;
        }

        const response = await fetch(`/api/admin/users/${formData._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(updateData)
        });

        if (response.ok) {
          const updatedUser = await response.json();
          setUsers(users.map(user => user._id === updatedUser._id ? updatedUser : user));
          setEditingUser(null);
        } else {
          alert('Failed to update user');
        }
      } catch (error) {
        alert('Error updating user');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-96">
          <h3 className="text-lg font-semibold mb-4">Edit User</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Password (leave blank to keep current)</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Dorm</label>
              <select
                value={formData.dorm}
                onChange={(e) => setFormData({...formData, dorm: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Choose dorm/building...</option>
                {Object.keys(DORM_DATA).sort().map((dorm) => (
                  <option key={dorm} value={dorm}>{dorm}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-gray-600 border rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Edit Opportunity Modal
  const EditOpportunityModal = () => {
    const [formData, setFormData] = useState({
      title: editingOpportunity?.title || '',
      description: editingOpportunity?.description || '',
      category: editingOpportunity?.category || 'Community',
      priority: editingOpportunity?.priority || 'Medium',
      date: editingOpportunity?.date || '',
      time: editingOpportunity?.time || '',
      totalSpots: editingOpportunity?.totalSpots || '',
      location: editingOpportunity?.location || ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/opportunities/${editingOpportunity.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          const updatedOpportunity = await response.json();
          setOpportunities(opportunities.map(opp => 
            opp.id === updatedOpportunity.id ? updatedOpportunity : opp
          ));
          setEditingOpportunity(null);
        } else {
          alert('Failed to update opportunity');
        }
      } catch (error) {
        alert('Error updating opportunity');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-96 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Edit Opportunity</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                rows="3"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="Community">Community</option>
                <option value="Education">Education</option>
                <option value="Environment">Environment</option>
                <option value="Health">Health</option>
                <option value="Fundraising">Fundraising</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Total Spots</label>
              <input
                type="number"
                value={formData.totalSpots}
                onChange={(e) => setFormData({...formData, totalSpots: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setEditingOpportunity(null)}
                className="px-4 py-2 text-gray-600 border rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Opportunity'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Edit Company Modal
  const EditOrganizationModal = () => {
    const [formData, setFormData] = useState({
      _id: editingOrganization?._id || '',
      name: editingOrganization?.name || '',
      email: editingOrganization?.email || '',
      website: editingOrganization?.website || '',
      phone: editingOrganization?.phone || '',
      description: editingOrganization?.description || ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/organizations/${formData._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          const updatedOrganization = await response.json();
          setOrganizations(organizations.map(organization => 
            organization._id === updatedOrganization._id ? updatedOrganization : organization
          ));
          setEditingOrganization(null);
        } else {
          alert('Failed to update organization');
        }
      } catch (error) {
        alert('Error updating organization');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-96 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Edit Organization</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                required
                disabled
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Website</label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                rows="3"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setEditingOrganization(null)}
                className="px-4 py-2 text-gray-600 border rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Organization'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Add Blocked Email Modal
  const AddBlockedEmailModal = () => {
    const [email, setEmail] = useState('');
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      setModalError('');
      
      if (!email) {
        setModalError('Email is required');
        return;
      }

      setModalLoading(true);
      await addBlockedEmail(email);
      setModalLoading(false);
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Block Email Address</h2>
          {modalError && <div className="mb-4 text-red-500">{modalError}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter email to block"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddBlockedEmail(false)}
                className="px-4 py-2 text-gray-600 border rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={modalLoading}
                className="px-4 py-2 bg-red-500 text-white rounded-md disabled:opacity-50"
              >
                {modalLoading ? 'Blocking...' : 'Block Email'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Add Theme Modal
  const AddThemeModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      colors: {
        primary: '#1B365F',
        primaryLight: '#284B87',
        primaryDark: '#14284A',
        accent1: '#00AFCE',
        accent1Light: '#00C4E6',
        accent1Dark: '#0095AF',
        accent2: '#E14F3D',
        textPrimary: '#2C2C2E',
        textSecondary: '#6C6C70',
        textTertiary: '#8E8E93',
        background: '#FFFFFF',
        surface: '#F8F8F9',
        surfaceHover: '#F1F5F9',
        border: '#E2E8F0',
        borderLight: '#F1F5F9'
      },
      fonts: {
        primary: 'Montserrat',
        secondary: 'Source Serif 4',
        primaryWeight: '700',
        secondaryWeight: '400'
      }
    });
    const [modalLoading, setModalLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setModalLoading(true);
      await createTheme(formData);
      setModalLoading(false);
    };

    const handleColorChange = (colorKey, value) => {
      setFormData(prev => ({
        ...prev,
        colors: {
          ...prev.colors,
          [colorKey]: value
        }
      }));
    };

    const handleFontChange = (fontKey, value) => {
      setFormData(prev => ({
        ...prev,
        fonts: {
          ...prev.fonts,
          [fontKey]: value
        }
      }));
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Create New Theme</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Theme Name */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium mb-2">Theme Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter theme name"
                  required
                />
              </div>

              {/* Colors */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Colors</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Primary Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.colors.primary}
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        className="w-10 h-8 border rounded"
                      />
                      <input
                        type="text"
                        value={formData.colors.primary}
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        className="flex-1 px-2 py-1 text-xs border rounded"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Primary Light</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.colors.primaryLight}
                        onChange={(e) => handleColorChange('primaryLight', e.target.value)}
                        className="w-10 h-8 border rounded"
                      />
                      <input
                        type="text"
                        value={formData.colors.primaryLight}
                        onChange={(e) => handleColorChange('primaryLight', e.target.value)}
                        className="flex-1 px-2 py-1 text-xs border rounded"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Primary Dark</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.colors.primaryDark}
                        onChange={(e) => handleColorChange('primaryDark', e.target.value)}
                        className="w-10 h-8 border rounded"
                      />
                      <input
                        type="text"
                        value={formData.colors.primaryDark}
                        onChange={(e) => handleColorChange('primaryDark', e.target.value)}
                        className="flex-1 px-2 py-1 text-xs border rounded"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Accent Color 1</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.colors.accent1}
                        onChange={(e) => handleColorChange('accent1', e.target.value)}
                        className="w-10 h-8 border rounded"
                      />
                      <input
                        type="text"
                        value={formData.colors.accent1}
                        onChange={(e) => handleColorChange('accent1', e.target.value)}
                        className="flex-1 px-2 py-1 text-xs border rounded"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Accent Color 2</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.colors.accent2}
                        onChange={(e) => handleColorChange('accent2', e.target.value)}
                        className="w-10 h-8 border rounded"
                      />
                      <input
                        type="text"
                        value={formData.colors.accent2}
                        onChange={(e) => handleColorChange('accent2', e.target.value)}
                        className="flex-1 px-2 py-1 text-xs border rounded"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Background</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.colors.background}
                        onChange={(e) => handleColorChange('background', e.target.value)}
                        className="w-10 h-8 border rounded"
                      />
                      <input
                        type="text"
                        value={formData.colors.background}
                        onChange={(e) => handleColorChange('background', e.target.value)}
                        className="flex-1 px-2 py-1 text-xs border rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Fonts */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Fonts</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Primary Font (Headers)</label>
                    <select
                      value={formData.fonts.primary}
                      onChange={(e) => handleFontChange('primary', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="Montserrat">Montserrat</option>
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Nunito">Nunito</option>
                      <option value="Source Sans Pro">Source Sans Pro</option>
                      <option value="Raleway">Raleway</option>
                      <option value="Ubuntu">Ubuntu</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Secondary Font (Body)</label>
                    <select
                      value={formData.fonts.secondary}
                      onChange={(e) => handleFontChange('secondary', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="Source Serif 4">Source Serif 4</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Inter">Inter</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Nunito">Nunito</option>
                      <option value="Source Sans Pro">Source Sans Pro</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Times New Roman">Times New Roman</option>
                    </select>
                  </div>
                  
                  {/* Font Preview */}
                  <div className="mt-4 p-3 border rounded-lg bg-gray-50">
                    <h4 className="text-sm font-medium mb-2">Preview</h4>
                    <div 
                      style={{ fontFamily: formData.fonts.primary }}
                      className="text-lg font-bold mb-1"
                    >
                      Header Text ({formData.fonts.primary})
                    </div>
                    <div 
                      style={{ fontFamily: formData.fonts.secondary }}
                      className="text-sm"
                    >
                      Body text content goes here. This is how your regular text will appear throughout the site. ({formData.fonts.secondary})
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={() => setShowAddTheme(false)}
                className="px-4 py-2 text-gray-600 border rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={modalLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
              >
                {modalLoading ? 'Creating...' : 'Create Theme'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Edit Theme Modal
  const EditThemeModal = () => {
    const [formData, setFormData] = useState({
      name: editingTheme?.name || '',
      colors: editingTheme?.colors || {
        primary: '#1B365F',
        primaryLight: '#284B87',
        primaryDark: '#14284A',
        accent1: '#00AFCE',
        accent1Light: '#00C4E6',
        accent1Dark: '#0095AF',
        accent2: '#E14F3D',
        textPrimary: '#2C2C2E',
        textSecondary: '#6C6C70',
        textTertiary: '#8E8E93',
        background: '#FFFFFF',
        surface: '#F8F8F9',
        surfaceHover: '#F1F5F9',
        border: '#E2E8F0',
        borderLight: '#F1F5F9'
      },
      fonts: editingTheme?.fonts || {
        primary: 'Montserrat',
        secondary: 'Source Serif 4',
        primaryWeight: '700',
        secondaryWeight: '400'
      }
    });
    const [modalLoading, setModalLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setModalLoading(true);
      await updateTheme(editingTheme._id, formData);
      setModalLoading(false);
    };

    const handleColorChange = (colorKey, value) => {
      setFormData(prev => ({
        ...prev,
        colors: {
          ...prev.colors,
          [colorKey]: value
        }
      }));
    };

    const handleFontChange = (fontKey, value) => {
      setFormData(prev => ({
        ...prev,
        fonts: {
          ...prev.fonts,
          [fontKey]: value
        }
      }));
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Edit Theme: {editingTheme?.name}</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Theme Name */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium mb-2">Theme Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter theme name"
                  required
                />
              </div>

              {/* Colors */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Colors</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Primary Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.colors.primary}
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        className="w-10 h-8 border rounded"
                      />
                      <input
                        type="text"
                        value={formData.colors.primary}
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        className="flex-1 px-2 py-1 text-xs border rounded"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Primary Light</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.colors.primaryLight}
                        onChange={(e) => handleColorChange('primaryLight', e.target.value)}
                        className="w-10 h-8 border rounded"
                      />
                      <input
                        type="text"
                        value={formData.colors.primaryLight}
                        onChange={(e) => handleColorChange('primaryLight', e.target.value)}
                        className="flex-1 px-2 py-1 text-xs border rounded"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Primary Dark</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.colors.primaryDark}
                        onChange={(e) => handleColorChange('primaryDark', e.target.value)}
                        className="w-10 h-8 border rounded"
                      />
                      <input
                        type="text"
                        value={formData.colors.primaryDark}
                        onChange={(e) => handleColorChange('primaryDark', e.target.value)}
                        className="flex-1 px-2 py-1 text-xs border rounded"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Accent Color 1</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.colors.accent1}
                        onChange={(e) => handleColorChange('accent1', e.target.value)}
                        className="w-10 h-8 border rounded"
                      />
                      <input
                        type="text"
                        value={formData.colors.accent1}
                        onChange={(e) => handleColorChange('accent1', e.target.value)}
                        className="flex-1 px-2 py-1 text-xs border rounded"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Accent Color 2</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.colors.accent2}
                        onChange={(e) => handleColorChange('accent2', e.target.value)}
                        className="w-10 h-8 border rounded"
                      />
                      <input
                        type="text"
                        value={formData.colors.accent2}
                        onChange={(e) => handleColorChange('accent2', e.target.value)}
                        className="flex-1 px-2 py-1 text-xs border rounded"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Background</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.colors.background}
                        onChange={(e) => handleColorChange('background', e.target.value)}
                        className="w-10 h-8 border rounded"
                      />
                      <input
                        type="text"
                        value={formData.colors.background}
                        onChange={(e) => handleColorChange('background', e.target.value)}
                        className="flex-1 px-2 py-1 text-xs border rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Fonts */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Fonts</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Primary Font (Headers)</label>
                    <select
                      value={formData.fonts.primary}
                      onChange={(e) => handleFontChange('primary', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="Montserrat">Montserrat</option>
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Nunito">Nunito</option>
                      <option value="Source Sans Pro">Source Sans Pro</option>
                      <option value="Raleway">Raleway</option>
                      <option value="Ubuntu">Ubuntu</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Secondary Font (Body)</label>
                    <select
                      value={formData.fonts.secondary}
                      onChange={(e) => handleFontChange('secondary', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="Source Serif 4">Source Serif 4</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Inter">Inter</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Nunito">Nunito</option>
                      <option value="Source Sans Pro">Source Sans Pro</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Times New Roman">Times New Roman</option>
                    </select>
                  </div>
                  
                  {/* Font Preview */}
                  <div className="mt-4 p-3 border rounded-lg bg-gray-50">
                    <h4 className="text-sm font-medium mb-2">Preview</h4>
                    <div 
                      style={{ fontFamily: formData.fonts.primary }}
                      className="text-lg font-bold mb-1"
                    >
                      Header Text ({formData.fonts.primary})
                    </div>
                    <div 
                      style={{ fontFamily: formData.fonts.secondary }}
                      className="text-sm"
                    >
                      Body text content goes here. This is how your regular text will appear throughout the site. ({formData.fonts.secondary})
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={() => setEditingTheme(null)}
                className="px-4 py-2 text-gray-600 border rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={modalLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
              >
                {modalLoading ? 'Updating...' : 'Update Theme'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>Admin Console - Community Connect</title>
      </Head>
      <div className="min-h-screen bg-gray-100">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold text-gray-900">Admin Console</h1>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Users ({users.length})
              </button>
              <button
                onClick={() => setActiveTab('pendingUsers')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pendingUsers'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending Users ({pendingUsers.length})
              </button>
              <button
                onClick={() => setActiveTab('organizations')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'organizations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Organizations ({organizations.length})
              </button>
              <button
                onClick={() => setActiveTab('pendingOrganizations')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pendingOrganizations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending Organizations ({pendingOrganizations.length})
              </button>
              <button
                onClick={() => setActiveTab('opportunities')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'opportunities'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Opportunities ({opportunities.length})
              </button>
              <button
                onClick={() => setActiveTab('blockedEmails')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'blockedEmails'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Blocked Emails ({blockedEmails.length})
              </button>
              <button
                onClick={() => setActiveTab('themes')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'themes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Themes
              </button>
              <button
                onClick={() => setActiveTab('content')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'content'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Content
              </button>
              <button
                onClick={() => setActiveTab('email')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'email'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Email
              </button>
            </nav>
          </div>

          {/* Session Warning */}
          {sessionWarning && (
            <div className="mb-6 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-bold">Session Expiring Soon!</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">
                    {sessionTimeRemaining ? (
                      `${Math.floor(sessionTimeRemaining / 60)}:${(sessionTimeRemaining % 60).toString().padStart(2, '0')} remaining`
                    ) : 'Session will expire soon'}
                  </span>
                  <button
                    onClick={extendSession}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm font-medium"
                    disabled={loading}
                  >
                    {loading ? 'Extending...' : 'Extend Session'}
                  </button>
                  <button
                    onClick={() => setSessionWarning(false)}
                    className="text-yellow-700 hover:text-yellow-900"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
              <button
                onClick={() => setError('')}
                className="absolute top-0 bottom-0 right-0 px-4 py-3"
              >
                <span className="sr-only">Close</span>
                ×
              </button>
            </div>
          )}

          {/* Debug Info - Remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
              <p><strong>Debug Info:</strong></p>
              <p>Users count: {users.length} | Organizations: {organizations.length} | Opportunities: {opportunities.length}</p>
              <p>Auth: {isAuthenticated ? '✅' : '❌'} | Admin User: {adminUser ? '✅' : '❌'}</p>
              <p>Active Tab: {activeTab}</p>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Users Management</h2>
                <button
                  onClick={() => setShowAddUser(true)}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Add User
                </button>
              </div>
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerms.users}
                    onChange={(e) => handleSearchChange('users', e.target.value)}
                    className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dorm</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map(user => (
                        <tr key={user._id} className="hover:bg-gray-50">
                          {/* Name */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.name}
                            {user.isPA && <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">PA</span>}
                            {user.isAdmin && <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">ADMIN</span>}
                          </td>
                          {/* Email */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                          {/* Dorm */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.dorm || '—'}</td>
                          {/* Role (with inline select) */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <select
                              value={user.role || 'user'}
                              onChange={(e) => promoteUser(user._id, e.target.value)}
                              className="px-2 py-1 text-xs border rounded bg-white shadow-sm"
                            >
                              <option value="user">User</option>
                              <option value="PA">PA</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          {/* Actions */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2 min-w-[120px]">
                            <button
                              onClick={() => setEditingUser(user)}
                              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteUser(user._id)}
                              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                            {users.length ? 'No users found matching your search' : 'No users found'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Opportunities Tab */}
          {activeTab === 'opportunities' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Opportunities & Chat Management</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    💬 Total Active Chats: {opportunities.filter(o => (o.chatParticipants || 0) > 0).length} | 
                    📊 Total Messages: {opportunities.reduce((sum, o) => sum + (o.messageCount || 0), 0)} | 
                    👥 Total Chat Participants: {opportunities.reduce((sum, o) => sum + (o.chatParticipants || 0), 0)}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddOpportunity(true)}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Add Opportunity
                </button>
              </div>
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search opportunities by title, description, category, location, or priority..."
                    value={searchTerms.opportunities}
                    onChange={(e) => handleSearchChange('opportunities', e.target.value)}
                    className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spots</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chat</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOpportunities.map(opportunity => (
                        <tr key={opportunity.id} className="hover:bg-gray-50">
                          {/* Title & description tooltip */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 max-w-xs truncate" title={opportunity.description}>
                            {opportunity.title}
                            {opportunity.priority && <span className="ml-1 text-xs text-gray-400">({opportunity.priority})</span>}
                          </td>
                          {/* Organization */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{opportunity.organizationName || '—'}</td>
                          {/* Date */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{opportunity.date}</td>
                          {/* Spots */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(opportunity.spotsFilled || 0)} / {opportunity.totalSpots}</td>
                          {/* Chat stats */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            👥 {opportunity.chatParticipants || 0} / 💬 {opportunity.messageCount || 0}
                          </td>
                          {/* Actions */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2 min-w-[140px]">
                            <button
                              onClick={() => setEditingOpportunity(opportunity)}
                              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteOpportunity(opportunity.id)}
                              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => openChatModalForAdmin(opportunity)}
                              className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-xs"
                            >
                              Chat
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredOpportunities.length === 0 && (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                            {opportunities.length ? 'No opportunities found matching your search' : 'No opportunities found'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Pending Users Tab */}
          {activeTab === 'pendingUsers' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Pending Users Management</h2>
              </div>
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search pending users by name or email..."
                    value={searchTerms.pendingUsers}
                    onChange={(e) => handleSearchChange('pendingUsers', e.target.value)}
                    className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPendingUsers.map(user => (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2 min-w-[120px]">
                            <button
                              onClick={() => approveUser(user._id)}
                              className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-xs"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectUser(user._id)}
                              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs"
                            >
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredPendingUsers.length === 0 && (
                        <tr>
                          <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                            {pendingUsers.length ? 'No pending users found matching your search' : 'No pending users found'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Organizations Tab */}
          {activeTab === 'organizations' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Organizations Management</h2>
              </div>
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search organizations by name, email, website, phone, or description..."
                    value={searchTerms.organizations}
                    onChange={(e) => handleSearchChange('organizations', e.target.value)}
                    className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOrganizations.map(organization => (
                        <tr key={organization._id} className="hover:bg-gray-50">
                          {/* Name */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {organization.name}
                            <div className="text-xs text-gray-400">Registered: {new Date(organization.createdAt).toLocaleDateString()}</div>
                          </td>
                          {/* Description */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                            {organization.description || '—'}
                          </td>
                          {/* Website */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 underline">
                            {organization.website ? (
                              <a href={organization.website.startsWith('http') ? organization.website : `https://${organization.website}`} target="_blank" rel="noopener noreferrer">
                                {organization.website}
                              </a>
                            ) : '—'}
                          </td>
                          {/* Phone */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{organization.phone || '—'}</td>
                          {/* Actions */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2 min-w-[120px]">
                            <button
                              onClick={() => setEditingOrganization(organization)}
                              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteOrganization(organization._id)}
                              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredOrganizations.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                            {organizations.length ? 'No organizations found matching your search' : 'No organizations found'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Pending Organizations Tab */}
          {activeTab === 'pendingOrganizations' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Pending Organizations Management</h2>
              </div>
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search pending organizations by name, email, website, phone, or description..."
                    value={searchTerms.pendingOrganizations}
                    onChange={(e) => handleSearchChange('pendingOrganizations', e.target.value)}
                    className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPendingOrganizations.map(organization => (
                        <tr key={organization._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {organization.name}
                            <div className="text-xs text-gray-400">{organization.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 underline">
                            {organization.website ? (
                              <a href={organization.website.startsWith('http') ? organization.website : `https://${organization.website}`} target="_blank" rel="noopener noreferrer">
                                {organization.website}
                              </a>
                            ) : '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(organization.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2 min-w-[120px]">
                            <button
                              onClick={() => approveOrganization(organization._id)}
                              className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-xs"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectOrganization(organization._id)}
                              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs"
                            >
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredPendingOrganizations.length === 0 && (
                        <tr>
                          <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                            {pendingOrganizations.length ? 'No pending organizations found matching your search' : 'No pending organizations found'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Blocked Emails Tab */}
          {activeTab === 'blockedEmails' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Blocked Emails Management</h2>
                <button
                  onClick={() => setShowAddBlockedEmail(true)}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Block New Email
                </button>
              </div>
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search blocked emails..."
                    value={searchTerms.blockedEmails}
                    onChange={(e) => handleSearchChange('blockedEmails', e.target.value)}
                    className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email Address</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blocked On</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBlockedEmails.map(item => (
                        <tr key={item._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right min-w-[120px]">
                            <button
                              onClick={() => removeBlockedEmail(item._id)}
                              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs"
                            >
                              Unblock
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredBlockedEmails.length === 0 && (
                        <tr>
                          <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                            {blockedEmails.length ? 'No blocked emails found matching your search' : 'No blocked emails found'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Themes Tab */}
          {activeTab === 'themes' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Theme Management</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    🎨 Manage the global appearance and fonts for the entire site
                    {activeTheme && <span className="ml-2 text-green-600">• Active: {activeTheme.name}</span>}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddTheme(true)}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Create New Theme
                </button>
              </div>
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search themes by name or font family..."
                    value={searchTerms.themes}
                    onChange={(e) => handleSearchChange('themes', e.target.value)}
                    className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Theme Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Primary Colors</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fonts</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredThemes.map(theme => (
                        <tr key={theme._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {theme.name}
                            {theme.isActive && <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">ACTIVE</span>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {theme.isActive ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ● Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                ○ Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <div 
                                className="w-4 h-4 rounded border border-gray-300" 
                                style={{ backgroundColor: theme.colors?.primary || '#000' }}
                                title={`Primary: ${theme.colors?.primary || 'N/A'}`}
                              ></div>
                              <div 
                                className="w-4 h-4 rounded border border-gray-300" 
                                style={{ backgroundColor: theme.colors?.accent1 || '#000' }}
                                title={`Accent: ${theme.colors?.accent1 || 'N/A'}`}
                              ></div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="max-w-32 truncate">
                              <div className="text-xs">{theme.fonts?.primary || 'N/A'}</div>
                              <div className="text-xs text-gray-400">{theme.fonts?.secondary || 'N/A'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(theme.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2 min-w-[160px]">
                            {!theme.isActive && (
                              <button
                                onClick={() => activateTheme(theme._id)}
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-xs"
                              >
                                Activate
                              </button>
                            )}
                            <button
                              onClick={() => setEditingTheme(theme)}
                              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xs"
                            >
                              Edit
                            </button>
                            {!theme.isActive && (
                              <button
                                onClick={() => deleteTheme(theme._id)}
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredThemes.length === 0 && (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                            {themes.length ? 'No themes found matching your search' : 'No themes found'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Email Management Tab */}
          {activeTab === 'email' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Email Management</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    📧 Send emails to users, PAs, and organizations with event information
                  </p>
                </div>
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Compose Email
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recipients Selection */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4">Select Recipients</h3>
                  
                  {/* Users */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium">Users ({users.length})</label>
                      <button
                        type="button"
                        onClick={() => {
                          const allUsers = users.map(user => ({
                            _id: user._id,
                            name: user.name,
                            email: user.email
                          }));
                          handleRecipientSelection('users', allUsers);
                        }}
                        className="text-xs bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded"
                      >
                        Select All
                      </button>
                    </div>
                    <select
                      multiple
                      className="w-full p-2 border rounded-md h-32"
                      onChange={(e) => {
                        const selectedOptions = Array.from(e.target.selectedOptions, option => ({
                          _id: option.value,
                          name: option.text,
                          email: option.getAttribute('data-email')
                        }));
                        handleRecipientSelection('users', selectedOptions);
                      }}
                    >
                      {users.map(user => (
                        <option key={user._id} value={user._id} data-email={user.email}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* PAs */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium">PAs ({getPAs().length})</label>
                      <button
                        type="button"
                        onClick={() => {
                          const allPAs = getPAs().map(pa => ({
                            _id: pa._id,
                            name: pa.name,
                            email: pa.email
                          }));
                          handleRecipientSelection('pas', allPAs);
                        }}
                        className="text-xs bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded"
                      >
                        Select All
                      </button>
                    </div>
                    <select
                      multiple
                      className="w-full p-2 border rounded-md h-32"
                      onChange={(e) => {
                        const selectedOptions = Array.from(e.target.selectedOptions, option => ({
                          _id: option.value,
                          name: option.text,
                          email: option.getAttribute('data-email')
                        }));
                        handleRecipientSelection('pas', selectedOptions);
                      }}
                    >
                      {getPAs().map(pa => (
                        <option key={pa._id} value={pa._id} data-email={pa.email}>
                          {pa.name} ({pa.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Organizations */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium">Organizations ({organizations.length})</label>
                      <button
                        type="button"
                        onClick={() => {
                          const allOrgs = organizations.map(org => ({
                            _id: org._id,
                            name: org.name,
                            email: org.email
                          }));
                          handleRecipientSelection('organizations', allOrgs);
                        }}
                        className="text-xs bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded"
                      >
                        Select All
                      </button>
                    </div>
                    <select
                      multiple
                      className="w-full p-2 border rounded-md h-32"
                      onChange={(e) => {
                        const selectedOptions = Array.from(e.target.selectedOptions, option => ({
                          _id: option.value,
                          name: option.text,
                          email: option.getAttribute('data-email')
                        }));
                        handleRecipientSelection('organizations', selectedOptions);
                      }}
                    >
                      {organizations.map(org => (
                        <option key={org._id} value={org._id} data-email={org.email}>
                          {org.name} ({org.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Event Selection */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4">Select Events (Optional)</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Selected events will be included in the email body
                  </p>
                  
                  <select
                    multiple
                    className="w-full p-2 border rounded-md h-64"
                    onChange={(e) => {
                      const selectedOptions = Array.from(e.target.selectedOptions, option => ({
                        _id: option.value,
                        title: option.text,
                        date: option.getAttribute('data-date'),
                        arrivalTime: option.getAttribute('data-arrival-time'),
                        departureTime: option.getAttribute('data-departure-time'),
                        location: option.getAttribute('data-location'),
                        description: option.getAttribute('data-description'),
                        organizationName: option.getAttribute('data-org-name'),
                        spotsTotal: option.getAttribute('data-spots-total'),
                        spotsFilled: option.getAttribute('data-spots-filled')
                      }));
                      handleEventSelection(selectedOptions);
                    }}
                  >
                    {opportunities.map(opp => (
                      <option 
                        key={opp._id} 
                        value={opp._id}
                        data-date={opp.date}
                        data-arrival-time={opp.arrivalTime}
                        data-departure-time={opp.departureTime}
                        data-location={opp.location}
                        data-description={opp.description}
                        data-org-name={opp.organizationName}
                        data-spots-total={opp.spotsTotal}
                        data-spots-filled={opp.spotsFilled}
                      >
                        {opp.title} - {opp.date} ({opp.organizationName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Email Preview */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4">Email Preview</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Enter email subject..."
                      className="w-full p-2 border rounded-md"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Body (Optional)</label>
                    <textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="Enter custom email body (optional - events will be automatically formatted)..."
                      className="w-full p-2 border rounded-md h-32"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty to send only event information
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Selected Recipients</label>
                    <div className="text-sm text-gray-600">
                      <div>Users: {emailRecipients.users.length}</div>
                      <div>PAs: {emailRecipients.pas.length}</div>
                      <div>Organizations: {emailRecipients.organizations.length}</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Selected Events</label>
                    <div className="text-sm text-gray-600">
                      {selectedEvents.length} events selected
                    </div>
                    {selectedEvents.length > 0 && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-md text-xs">
                        <div className="font-medium mb-2">Email Preview:</div>
                        <div className="whitespace-pre-line text-gray-700">
                          {emailBody && (
                            <>
                              {emailBody}
                              <br />
                              <br />
                              ---
                              <br />
                              <br />
                            </>
                          )}
                          {selectedEvents.map(event => (
                            <div key={event._id} className="mb-3">
                              📅 <strong>{event.title}</strong><br />
                              📅 Date: {event.date}<br />
                              ⏰ Time: {event.arrivalTime} - {event.departureTime}<br />
                              📍 Location: {event.location}<br />
                              📝 Description: {event.description}<br />
                              🏢 Organization: {event.organizationName}<br />
                              👥 Spots Available: {event.spotsTotal - (event.spotsFilled || 0)}/{event.spotsTotal}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={openEmailClient}
                    disabled={emailLoading}
                    className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                  >
                    {emailLoading ? 'Preparing Email...' : 'Open in Email Client'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Content Management Tab */}
          {activeTab === 'content' && (
            <ContentManager />
          )}

        </div>

        {/* Modals */}
        {showAddUser && <AddUserModal />}
        {showAddOpportunity && <AddOpportunityModal />}
        {editingUser && <EditUserModal />}
        {editingOpportunity && <EditOpportunityModal />}
        {editingOrganization && <EditOrganizationModal />}
        {showAddBlockedEmail && <AddBlockedEmailModal />}
        {showAddTheme && <AddThemeModal />}
        {editingTheme && <EditThemeModal />}

        {/* Chat Modal for Admin */}
        {selectedOpportunityForChat && adminUser && (
          <ChatModal
            isOpen={isChatModalOpen}
            onClose={() => {
              setIsChatModalOpen(false);
              setSelectedOpportunityForChat(null);
            }}
            opportunity={selectedOpportunityForChat}
            currentUser={adminUser} // Pass admin user object
            isCompany={false} // Admin is not the organization, but will act as them
                              // ChatModal logic uses currentUser.isAdmin to set viewerIs='admin'
          />
        )}
      </div>
    </>
  );

}