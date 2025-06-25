import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [blockedEmails, setBlockedEmails] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [editingCompany, setEditingCompany] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddOpportunity, setShowAddOpportunity] = useState(false);
  const [showAddBlockedEmail, setShowAddBlockedEmail] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Check if already authenticated on page load
  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

  const fetchData = async () => {
    try {
      // Fetch users
      const usersResponse = await fetch('/api/admin/users');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }

      // Fetch companies
      const companiesResponse = await fetch('/api/companies');
      if (companiesResponse.ok) {
        const companiesData = await companiesResponse.json();
        setCompanies(companiesData);
      }

      // Fetch opportunities
      const opportunitiesResponse = await fetch('/api/opportunities');
      if (opportunitiesResponse.ok) {
        const opportunitiesData = await opportunitiesResponse.json();
        setOpportunities(opportunitiesData);
      }

      // Fetch blocked emails
      const blockedEmailsResponse = await fetch('/api/admin/blocked-emails');
      if (blockedEmailsResponse.ok) {
        const blockedEmailsData = await blockedEmailsResponse.json();
        setBlockedEmails(blockedEmailsData);
      }

      // Fetch pending users
      const pendingUsersResponse = await fetch('/api/admin/pending-users');
      if (pendingUsersResponse.ok) {
        const pendingUsersData = await pendingUsersResponse.json();
        setPendingUsers(pendingUsersData);
      }

      // Fetch pending companies
      const pendingCompaniesResponse = await fetch('/api/admin/pending-companies');
      if (pendingCompaniesResponse.ok) {
        const pendingCompaniesData = await pendingCompaniesResponse.json();
        setPendingCompanies(pendingCompaniesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter(user => user._id !== userId));
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      alert('Error deleting user');
    }
  };

  const deleteOpportunity = async (opportunityId) => {
    if (!confirm('Are you sure you want to delete this opportunity?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/opportunities/${opportunityId}`, {
        method: 'DELETE',
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

  const deleteCompany = async (companyId) => {
    if (!confirm('Are you sure you want to delete this company?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/companies/${companyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCompanies(companies.filter(company => company._id !== companyId && (company.id !== companyId || !company.id)));
        alert('Company deleted successfully');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete company');
      }
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('Error deleting company');
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

  const approveCompany = async (companyId) => {
    if (!confirm('Are you sure you want to approve this company?')) return;

    try {
      const response = await fetch('/api/admin/pending-companies?approve=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyId }),
      });

      if (response.ok) {
        setPendingCompanies(pendingCompanies.filter(company => company._id !== companyId));
        // Refresh data to include the newly approved company
        fetchData();
      } else {
        alert('Failed to approve company');
      }
    } catch (error) {
      alert('Error approving company');
    }
  };

  const rejectCompany = async (companyId) => {
    if (!confirm('Are you sure you want to reject this company?')) return;

    try {
      const response = await fetch('/api/admin/pending-companies', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyId }),
      });

      if (response.ok) {
        setPendingCompanies(pendingCompanies.filter(company => company._id !== companyId));
      } else {
        alert('Failed to reject company');
      }
    } catch (error) {
      alert('Error rejecting company');
    }
  };

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
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (response.ok) {
          const newUser = await response.json();
          setUsers([...users, newUser]);
          setShowAddUser(false);
          setFormData({ name: '', email: '', password: '' });
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
  const EditCompanyModal = () => {
    const [formData, setFormData] = useState({
      _id: editingCompany?._id || '',
      name: editingCompany?.name || '',
      email: editingCompany?.email || '',
      website: editingCompany?.website || '',
      phone: editingCompany?.phone || '',
      description: editingCompany?.description || ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/companies/${formData._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          const updatedCompany = await response.json();
          setCompanies(companies.map(company => 
            company._id === updatedCompany._id ? updatedCompany : company
          ));
          setEditingCompany(null);
        } else {
          alert('Failed to update company');
        }
      } catch (error) {
        alert('Error updating company');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-96 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Edit Company</h3>
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
                onClick={() => setEditingCompany(null)}
                className="px-4 py-2 text-gray-600 border rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Company'}
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
                onClick={() => setActiveTab('companies')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'companies'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Companies ({companies.length})
              </button>
              <button
                onClick={() => setActiveTab('pendingCompanies')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pendingCompanies'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending Companies ({pendingCompanies.length})
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
            </nav>
          </div>

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
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <li key={user._id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                              <p className="text-xs text-gray-400">
                                Commitments: {user.commitments ? user.commitments.length : 0}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteUser(user._id)}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Opportunities Tab */}
          {activeTab === 'opportunities' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Opportunities Management</h2>
                <button
                  onClick={() => setShowAddOpportunity(true)}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Add Opportunity
                </button>
              </div>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {opportunities.map((opportunity) => (
                    <li key={opportunity.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{opportunity.title}</p>
                              <p className="text-sm text-gray-500">{opportunity.category}</p>
                              <p className="text-xs text-gray-400">
                                {opportunity.spotsFilled || 0}/{opportunity.totalSpots} spots filled
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingOpportunity(opportunity)}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteOpportunity(opportunity.id)}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Pending Users Tab */}
          {activeTab === 'pendingUsers' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Pending Users Management</h2>
              </div>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {pendingUsers.map((user) => (
                    <li key={user._id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                              <p className="text-xs text-gray-400">
                                Requested on: {new Date(user.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => approveUser(user._id)}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectUser(user._id)}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                  {pendingUsers.length === 0 && (
                    <li className="px-6 py-4 text-center text-gray-500">
                      No pending users found
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Companies Tab */}
          {activeTab === 'companies' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Companies Management</h2>
              </div>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {companies.map((company) => (
                    <li key={company._id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{company.name}</p>
                              <p className="text-sm text-gray-500">{company.email}</p>
                              <p className="text-xs text-gray-400">
                                Registered on: {new Date(company.createdAt).toLocaleDateString()}
                              </p>
                              {company.website && (
                                <p className="text-xs text-gray-400">
                                  Website: {company.website}
                                </p>
                              )}
                              {company.phone && (
                                <p className="text-xs text-gray-400">
                                  Phone: {company.phone}
                                </p>
                              )}
                              {company.description && (
                                <p className="text-xs text-gray-400 mt-1">
                                  Description: {company.description}
                                </p>
                              )}
                              <p className="text-xs text-gray-400">
                                Opportunities: {company.opportunities ? company.opportunities.length : 0}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingCompany(company)}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteCompany(company._id)}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                  {companies.length === 0 && (
                    <li className="px-6 py-4 text-center text-gray-500">
                      No companies found
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Pending Companies Tab */}
          {activeTab === 'pendingCompanies' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Pending Companies Management</h2>
              </div>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {pendingCompanies.map((company) => (
                    <li key={company._id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{company.name}</p>
                              <p className="text-sm text-gray-500">{company.email}</p>
                              <p className="text-xs text-gray-400">
                                Requested on: {new Date(company.createdAt).toLocaleDateString()}
                              </p>
                              {company.website && (
                                <p className="text-xs text-gray-400">
                                  Website: {company.website}
                                </p>
                              )}
                              {company.phone && (
                                <p className="text-xs text-gray-400">
                                  Phone: {company.phone}
                                </p>
                              )}
                              {company.description && (
                                <p className="text-xs text-gray-400 mt-1">
                                  Description: {company.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => approveCompany(company._id)}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectCompany(company._id)}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                  {pendingCompanies.length === 0 && (
                    <li className="px-6 py-4 text-center text-gray-500">
                      No pending companies found
                    </li>
                  )}
                </ul>
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
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {blockedEmails.map((item) => (
                    <li key={item._id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.email}</p>
                              <p className="text-xs text-gray-400">
                                Blocked on: {new Date(item.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => removeBlockedEmail(item._id)}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                          >
                            Unblock
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                  {blockedEmails.length === 0 && (
                    <li className="px-6 py-4 text-center text-gray-500">
                      No blocked emails found
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Modals */}
        {showAddUser && <AddUserModal />}
        {showAddOpportunity && <AddOpportunityModal />}
        {editingUser && <EditUserModal />}
        {editingOpportunity && <EditOpportunityModal />}
        {editingCompany && <EditCompanyModal />}
        {showAddBlockedEmail && <AddBlockedEmailModal />}
      </div>
    </>
  );

}