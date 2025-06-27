import React, { useState, useEffect, useCallback } from 'react';

// --- Helper Modal Components (defined outside the main component) ---

/**
 * A reusable modal for displaying alert messages.
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Whether the modal is visible.
 * @param {string} props.message - The message to display.
 * @param {function} props.onClose - Function to call when the modal is closed.
 */
const AlertModal = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm mx-auto">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Notification</h3>
        <p className="mb-6 text-gray-600">{message}</p>
        <div className="flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * A reusable modal for confirming user actions.
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Whether the modal is visible.
 * @param {string} props.message - The confirmation message.
 * @param {function} props.onConfirm - Function to call when the action is confirmed.
 * @param {function} props.onCancel - Function to call when the action is cancelled.
 */
const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm mx-auto">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Confirm Action</h3>
        <p className="mb-6 text-gray-600">{message}</p>
        <div className="flex justify-end space-x-3">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Admin Page Component ---

export default function AdminPage() {
  // Authentication and Core State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Data State
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [blockedEmails, setBlockedEmails] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingCompanies, setPendingCompanies] = useState([]);

  // Modal and Editing State
  const [editingUser, setEditingUser] = useState(null);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [editingCompany, setEditingCompany] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddOpportunity, setShowAddOpportunity] = useState(false);
  const [showAddBlockedEmail, setShowAddBlockedEmail] = useState(false);
  
  // Custom Modal State
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, message: '' });
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, message: '', onConfirm: () => {} });

  // Search states
  const [userSearch, setUserSearch] = useState('');
  const [pendingUserSearch, setPendingUserSearch] = useState('');
  const [companySearch, setCompanySearch] = useState('');
  const [pendingCompanySearch, setPendingCompanySearch] = useState('');
  const [opportunitySearch, setOpportunitySearch] = useState('');
  const [blockedEmailSearch, setBlockedEmailSearch] = useState('');
  
  // --- Data Fetching and Authentication ---

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
        const responses = await Promise.all([
            fetch('/api/admin/users'),
            fetch('/api/companies'),
            fetch('/api/opportunities'),
            fetch('/api/admin/blocked-emails'),
            fetch('/api/admin/pending-users'),
            fetch('/api/admin/pending-companies')
        ]);

        const data = await Promise.all(responses.map(res => res.ok ? res.json() : Promise.resolve(null)));
        
        if (data[0]) setUsers(data[0]);
        if (data[1]) setCompanies(data[1]);
        if (data[2]) setOpportunities(data[2]);
        if (data[3]) setBlockedEmails(data[3]);
        if (data[4]) setPendingUsers(data[4]);
        if (data[5]) setPendingCompanies(data[5]);

    } catch (error) {
        console.error('Error fetching data:', error);
        setAlertConfig({ isOpen: true, message: 'Failed to load data from the server.' });
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Set document title, since next/head is not available
    document.title = isAuthenticated ? "Admin Console - Community Connect" : "Admin Login - Community Connect";
    
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
      fetchData();
    } else {
      setLoading(false);
    }
  }, [fetchData, isAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        setIsAuthenticated(true);
        localStorage.setItem('adminAuth', 'true');
        fetchData();
      } else {
        const data = await response.json();
        setError(data.error || 'Invalid credentials');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuth');
    setUsername('');
    setPassword('');
  };
  
  // --- Generic Action Handlers ---

  const handleAction = async (endpoint, options, successCallback, successMessage, errorMessage) => {
    setLoading(true);
    try {
        const response = await fetch(endpoint, options);
        if (response.ok) {
            if (successCallback) successCallback(await response.json().catch(() => ({}))); // Handle empty JSON response
            if (successMessage) setAlertConfig({ isOpen: true, message: successMessage });
        } else {
            const errorData = await response.json();
            setAlertConfig({ isOpen: true, message: errorData.error || errorMessage });
        }
    } catch (error) {
        console.error(`Error with action on ${endpoint}:`, error);
        setAlertConfig({ isOpen: true, message: `An error occurred. Please try again.` });
    } finally {
        setLoading(false);
    }
  };


  // --- CRUD Operations with Confirmation ---

  const confirmAndDelete = (id, type) => {
    let endpoint, successCallback, message;
    switch(type) {
        case 'user':
            endpoint = `/api/admin/users/${id}`;
            message = 'Are you sure you want to delete this user?';
            successCallback = () => setUsers(prev => prev.filter(u => u._id !== id));
            break;
        case 'opportunity':
            endpoint = `/api/admin/opportunities/${id}`;
            message = 'Are you sure you want to delete this opportunity?';
            successCallback = () => setOpportunities(prev => prev.filter(o => o.id !== id));
            break;
        case 'company':
            endpoint = `/api/admin/companies/${id}`;
            message = 'Are you sure you want to delete this company?';
            successCallback = () => setCompanies(prev => prev.filter(c => c._id !== id));
            break;
        default: return;
    }
    
    setConfirmConfig({
        isOpen: true,
        message,
        onConfirm: () => {
            setConfirmConfig({ isOpen: false });
            handleAction(endpoint, { method: 'DELETE' }, successCallback, `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully.`, `Failed to delete ${type}.`);
        }
    });
  };

  const confirmAndApprove = (id, type) => {
    let endpoint, successCallback, message;
    switch(type) {
        case 'user':
            endpoint = '/api/admin/pending-users?approve=true';
            message = 'Are you sure you want to approve this user?';
            successCallback = () => {
                setPendingUsers(prev => prev.filter(u => u._id !== id));
                fetchData(); // Refresh data to show approved user
            };
            break;
        case 'company':
            endpoint = '/api/admin/pending-companies?approve=true';
            message = 'Are you sure you want to approve this company?';
            successCallback = () => {
                setPendingCompanies(prev => prev.filter(c => c._id !== id));
                fetchData(); // Refresh data to show approved company
            };
            break;
        default: return;
    }

    setConfirmConfig({
        isOpen: true,
        message,
        onConfirm: () => {
            setConfirmConfig({ isOpen: false });
            const body = type === 'user' ? { userId: id } : { companyId: id };
            handleAction(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, successCallback, `${type.charAt(0).toUpperCase() + type.slice(1)} approved.`, `Failed to approve ${type}.`);
        }
    });
  };
  
  const confirmAndReject = (id, type) => {
    let endpoint, successCallback, message, body;
    switch(type) {
        case 'user':
            endpoint = `/api/admin/pending-users`;
            message = 'Are you sure you want to reject this user?';
            successCallback = () => setPendingUsers(prev => prev.filter(u => u._id !== id));
            body = { userId: id };
            break;
        case 'company':
            endpoint = `/api/admin/pending-companies`;
            message = 'Are you sure you want to reject this company?';
            successCallback = () => setPendingCompanies(prev => prev.filter(c => c._id !== id));
            body = { companyId: id };
            break;
        default: return;
    }
    
    setConfirmConfig({
        isOpen: true,
        message,
        onConfirm: () => {
            setConfirmConfig({ isOpen: false });
            handleAction(endpoint, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, successCallback, `${type.charAt(0).toUpperCase() + type.slice(1)} rejected.`, `Failed to reject ${type}.`);
        }
    });
  };

  const removeBlockedEmail = (id) => {
      setConfirmConfig({
          isOpen: true,
          message: 'Are you sure you want to unblock this email?',
          onConfirm: () => {
              setConfirmConfig({ isOpen: false });
              handleAction(
                  '/api/admin/blocked-emails',
                  { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) },
                  () => setBlockedEmails(prev => prev.filter(item => item._id !== id)),
                  'Email unblocked successfully.',
                  'Failed to unblock email.'
              );
          }
      });
  };


  // --- Render Logic ---

  if (loading && !isAuthenticated) {
      return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return (
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
                        <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
                        <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
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
    );
  }

  // Filtered data for rendering
  const filteredUsers = users.filter(user => user.name?.toLowerCase().includes(userSearch.toLowerCase()) || user.email?.toLowerCase().includes(userSearch.toLowerCase()));
  const filteredPendingUsers = pendingUsers.filter(user => user.name?.toLowerCase().includes(pendingUserSearch.toLowerCase()) || user.email?.toLowerCase().includes(pendingUserSearch.toLowerCase()));
  const filteredCompanies = companies.filter(company => company.name?.toLowerCase().includes(companySearch.toLowerCase()) || company.email?.toLowerCase().includes(companySearch.toLowerCase()));
  const filteredPendingCompanies = pendingCompanies.filter(company => company.name?.toLowerCase().includes(pendingCompanySearch.toLowerCase()) || company.email?.toLowerCase().includes(pendingCompanySearch.toLowerCase()));
  const filteredOpportunities = opportunities.filter(opp => opp.title?.toLowerCase().includes(opportunitySearch.toLowerCase()) || opp.category?.toLowerCase().includes(opportunitySearch.toLowerCase()));
  const filteredBlockedEmails = blockedEmails.filter(item => item.email?.toLowerCase().includes(blockedEmailSearch.toLowerCase()));

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-40">
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
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
             <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
              {Object.entries({
                  users: { label: 'Users', count: users.length },
                  pendingUsers: { label: 'Pending Users', count: pendingUsers.length },
                  companies: { label: 'Companies', count: companies.length },
                  pendingCompanies: { label: 'Pending Companies', count: pendingCompanies.length },
                  opportunities: { label: 'Opportunities', count: opportunities.length },
                  blockedEmails: { label: 'Blocked Emails', count: blockedEmails.length },
              }).map(([key, {label, count}]) => (
                  <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === key
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                      {label} <span className="bg-gray-200 text-gray-700 ml-2 py-0.5 px-2.5 rounded-full text-xs font-bold">{count}</span>
                  </button>
              ))}
            </nav>
          </div>
          
          {/* Content Area */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
              {/* Users Tab */}
              {activeTab === 'users' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Users Management</h2>
                    <button onClick={() => setShowAddUser(true)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Add User</button>
                  </div>
                  <input type="text" placeholder="Search users by name or email..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"/>
                  <ul>
                    {filteredUsers.map(user => (
                      <li key={user._id} className="border-b py-2 flex justify-between items-center">
                        <div>{user.name} ({user.email})</div>
                        <div>
                          <button onClick={() => setEditingUser(user)} className="bg-blue-500 text-white py-1 px-3 rounded text-sm mr-2">Edit</button>
                          <button onClick={() => confirmAndDelete(user._id, 'user')} className="bg-red-500 text-white py-1 px-3 rounded text-sm">Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Pending Users Tab */}
            {activeTab === 'pendingUsers' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Pending Users Management</h2>
                <input type="text" placeholder="Search pending users..." value={pendingUserSearch} onChange={(e) => setPendingUserSearch(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4" />
                <ul>
                  {filteredPendingUsers.map(user => (
                    <li key={user._id} className="border-b py-2 flex justify-between items-center">
                      <div>{user.name} ({user.email})</div>
                      <div>
                        <button onClick={() => confirmAndApprove(user._id, 'user')} className="bg-green-500 text-white py-1 px-3 rounded text-sm mr-2">Approve</button>
                        <button onClick={() => confirmAndReject(user._id, 'user')} className="bg-red-500 text-white py-1 px-3 rounded text-sm">Reject</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Opportunities Tab */}
            {activeTab === 'opportunities' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Opportunities Management</h2>
                    <button onClick={() => setShowAddOpportunity(true)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Add Opportunity</button>
                  </div>
                  <input type="text" placeholder="Search opportunities..." value={opportunitySearch} onChange={(e) => setOpportunitySearch(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"/>
                  <ul>
                    {filteredOpportunities.map(opp => (
                      <li key={opp.id} className="border-b py-2 flex justify-between items-center">
                        <div>{opp.title} ({opp.category})</div>
                        <div>
                          <button onClick={() => setEditingOpportunity(opp)} className="bg-blue-500 text-white py-1 px-3 rounded text-sm mr-2">Edit</button>
                          <button onClick={() => confirmAndDelete(opp.id, 'opportunity')} className="bg-red-500 text-white py-1 px-3 rounded text-sm">Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
             {/* Note: Other tabs (Companies, Pending Companies, Blocked Emails) can be built out using the same pattern as above */}
          </div>
        </main>
      </div>

      {/* Modals */}
      <AlertModal 
        isOpen={alertConfig.isOpen} 
        message={alertConfig.message} 
        onClose={() => setAlertConfig({ isOpen: false, message: '' })}
      />
      <ConfirmationModal 
        isOpen={confirmConfig.isOpen} 
        message={confirmConfig.message} 
        onConfirm={() => confirmConfig.onConfirm()} 
        onCancel={() => setConfirmConfig({ isOpen: false, message: '', onConfirm: () => {} })}
      />

      {/* TODO: Convert remaining modals (Add/Edit) to be external components if desired */}
      
    </>
  );
}
