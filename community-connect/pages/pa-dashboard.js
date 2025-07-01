import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function PADashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [userRecommendations, setUserRecommendations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in and is a PA
    const userData = localStorage.getItem('userData');
    if (!userData) {
      router.push('/');
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== 'pa') {
      router.push('/');
      return;
    }

    setCurrentUser(user);
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const response = await fetch('/api/opportunities');
      if (response.ok) {
        const data = await response.json();
        setOpportunities(data);
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    }
  };

  const fetchUserRecommendations = async (opportunityId = null) => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        paUserId: currentUser._id,
        searchTerm: searchTerm
      });
      
      if (opportunityId) {
        params.append('opportunityId', opportunityId);
      }

      const response = await fetch(`/api/pa/get-user-recommendations?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUserRecommendations(data.users);
      } else {
        showMessage('Failed to fetch user recommendations', 'error');
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      showMessage('Error fetching recommendations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addUserToEvent = async (userEmail, opportunityId) => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const response = await fetch('/api/pa/add-user-to-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paUserId: currentUser._id,
          userEmail: userEmail,
          opportunityId: opportunityId
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        showMessage(data.message, 'success');
        fetchOpportunities(); // Refresh opportunities to show updated spots
        fetchUserRecommendations(selectedOpportunity?.id); // Refresh recommendations
        setCustomEmail(''); // Clear custom email input
      } else {
        showMessage(data.error || 'Failed to add user to event', 'error');
      }
    } catch (error) {
      console.error('Error adding user to event:', error);
      showMessage('Error adding user to event', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleOpportunitySelect = (opportunity) => {
    setSelectedOpportunity(opportunity);
    setUserRecommendations([]);
    setSearchTerm('');
    setCustomEmail('');
    fetchUserRecommendations(opportunity.id);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUserRecommendations(selectedOpportunity?.id);
  };

  const handleCustomEmailAdd = (e) => {
    e.preventDefault();
    if (!customEmail.trim()) {
      showMessage('Please enter an email address', 'error');
      return;
    }
    if (!selectedOpportunity) {
      showMessage('Please select an opportunity first', 'error');
      return;
    }
    addUserToEvent(customEmail.trim(), selectedOpportunity.id);
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>PA Dashboard - Community Connect</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">PA Dashboard</h1>
                <p className="text-gray-600">Welcome, {currentUser.name} ({currentUser.dorm})</p>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('userData');
                  window.dispatchEvent(new Event('userLogout'));
                  router.push('/');
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4`}>
            <div className={`p-4 rounded-md ${
              messageType === 'success' 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Opportunities List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Available Opportunities</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {opportunities.map((opportunity) => (
                  <div
                    key={opportunity.id || opportunity._id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedOpportunity?.id === opportunity.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleOpportunitySelect(opportunity)}
                  >
                    <h3 className="font-medium text-gray-900">{opportunity.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{opportunity.description}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500">
                        📍 {opportunity.location}
                      </span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        (opportunity.spotsFilled || 0) >= (opportunity.spotsTotal || opportunity.totalSpots || 0)
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {opportunity.spotsFilled || 0}/{opportunity.spotsTotal || opportunity.totalSpots || 0} spots filled
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      📅 {opportunity.date} • 🕐 {opportunity.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User Management */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Add Users to Event</h2>
              
              {!selectedOpportunity ? (
                <p className="text-gray-500">Select an opportunity to manage users</p>
              ) : (
                <div>
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-900">{selectedOpportunity.title}</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      {selectedOpportunity.spotsFilled || 0}/{selectedOpportunity.spotsTotal || selectedOpportunity.totalSpots || 0} spots filled
                    </p>
                  </div>

                  {/* Custom Email Input */}
                  <form onSubmit={handleCustomEmailAdd} className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add user by email (can add anyone):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        placeholder="Enter user's email"
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        disabled={loading || !customEmail.trim()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        Add User
                      </button>
                    </div>
                  </form>

                  {/* Search and Recommendations */}
                  <form onSubmit={handleSearch} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search recommended users (prioritizes your dorm):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name or email..."
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                      >
                        Search
                      </button>
                    </div>
                  </form>

                  {/* User Recommendations */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {loading ? (
                      <p className="text-gray-500">Loading...</p>
                    ) : userRecommendations.length > 0 ? (
                      userRecommendations.map((user) => (
                        <div
                          key={user._id}
                          className={`p-3 border rounded-lg ${
                            user.isFromSameDorm ? 'border-green-200 bg-green-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{user.name}</h4>
                              <p className="text-sm text-gray-600">{user.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-1 rounded ${
                                  user.isFromSameDorm 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {user.recommendationReason}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {user.commitmentCount}/2 commitments
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => addUserToEvent(user.email, selectedOpportunity.id)}
                              disabled={loading}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">
                        {searchTerm ? 'No users found matching your search' : 'Search for users to see recommendations'}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}