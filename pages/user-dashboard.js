import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import axios from 'axios';
import Header from '../components/Header/Header.jsx';
import Modal from '../components/Modal/Modal.jsx';

export default function UserDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [commitments, setCommitments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Notification settings state
  const [notificationFrequency, setNotificationFrequency] = useState('immediate');
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const storedUserData = localStorage.getItem('userData');
    if (!storedUserData) {
      router.push('/');
      return;
    }

    const parsedUserData = JSON.parse(storedUserData);
    
    // Check if user is approved
    if (!parsedUserData.approved) {
      // Remove the stored data
      localStorage.removeItem('userData');
      // Redirect to login page with error message
      router.push('/?error=not_approved');
      return;
    }
    
    setUserData(parsedUserData);
    
    // Initialize notification frequency
    setNotificationFrequency(parsedUserData.chatNotificationFrequency || 'immediate');
    
    // Fetch user commitments
    fetchCommitments(parsedUserData._id);
  }, [router]);

  const fetchCommitments = async (userId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/users/commitments?userId=${userId}`);
      setCommitments(response.data);
    } catch (error) {
      console.error('Error fetching commitments:', error);
      setError('Failed to load commitments');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    router.push('/');
  };

  const openNotificationSettingsModal = () => {
    setIsNotificationModalOpen(true);
  };

  const handleNotificationFrequencyChange = (e) => {
    setNotificationFrequency(e.target.value);
  };

  const handleNotificationSettingsSubmit = async (e) => {
    e.preventDefault();
    setNotificationLoading(true);
    
    try {
      const response = await axios.put('/api/users/notification-settings', {
        userId: userData._id,
        chatNotificationFrequency: notificationFrequency
      });
      
      // Update local user data
      const updatedUserData = {
        ...userData,
        chatNotificationFrequency: notificationFrequency
      };
      setUserData(updatedUserData);
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      
      setIsNotificationModalOpen(false);
      setError('');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      setError('Failed to update notification settings');
    } finally {
      setNotificationLoading(false);
    }
  };

  const handleRemoveCommitment = async (opportunityId) => {
    if (!confirm('Are you sure you want to remove this commitment?')) {
      return;
    }

    try {
      await axios.post('/api/users/remove-commitment', {
        userId: userData._id,
        opportunityId: opportunityId
      });
      
      // Refresh commitments
      fetchCommitments(userData._id);
    } catch (error) {
      console.error('Error removing commitment:', error);
      setError('Failed to remove commitment');
    }
  };

  if (!userData) {
    return <div className="text-center p-10">Loading...</div>;
  }

  return (
    <div>
      <Head>
        <title>User Dashboard | Main Street Opportunities</title>
        <meta name="description" content="Manage your volunteer commitments" />
      </Head>

      <Header />

      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary font-montserrat">Welcome, {userData.name}!</h1>
            <p className="text-text-secondary font-source-serif">{userData.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-text-secondary hover:bg-text-primary text-white font-bold py-2 px-4 rounded font-montserrat"
          >
            Logout
          </button>
        </div>

        <div className="bg-background shadow-md rounded-lg p-6 mb-8 border border-border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-primary font-montserrat">Notification Settings</h2>
            <button
              onClick={openNotificationSettingsModal}
              className="bg-accent1 hover:bg-accent1-dark text-white font-bold py-2 px-4 rounded font-montserrat"
            >
              Configure Notifications
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-text-secondary font-montserrat">Chat Notification Frequency:</p>
              <p className="text-text-primary font-source-serif capitalize">
                {userData.chatNotificationFrequency === 'never' && 'Never'}
                {userData.chatNotificationFrequency === 'immediate' && 'Immediate (as soon as a new message is posted)'}
                {userData.chatNotificationFrequency === '5min' && 'Every 5 minutes'}
                {userData.chatNotificationFrequency === '30min' && 'Every 30 minutes'}
                {!userData.chatNotificationFrequency && 'Immediate (default)'}
              </p>
            </div>
            <div>
              <p className="text-text-secondary font-montserrat">Current Setting:</p>
              <p className="text-text-primary font-source-serif">
                {userData.chatNotificationFrequency || 'immediate'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-background shadow-md rounded-lg p-6 border border-border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-primary font-montserrat">Your Commitments</h2>
          </div>
          
          {loading ? (
            <p className="text-text-secondary text-center py-4 font-source-serif">Loading commitments...</p>
          ) : commitments.length === 0 ? (
            <p className="text-text-secondary text-center py-4 font-source-serif">No commitments yet. Browse opportunities to get started!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-background">
                <thead>
                  <tr className="bg-surface text-text-secondary uppercase text-sm leading-normal font-montserrat">
                    <th className="py-3 px-6 text-left">Title</th>
                    <th className="py-3 px-6 text-left">Organization</th>
                    <th className="py-3 px-6 text-left">Date</th>
                    <th className="py-3 px-6 text-left">Time</th>
                    <th className="py-3 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-text-primary text-sm font-source-serif">
                  {commitments.map((commitment) => (
                    <tr key={commitment._id} className="border-b border-border hover:bg-surface-hover">
                      <td className="py-3 px-6 text-left">{commitment.title}</td>
                      <td className="py-3 px-6 text-left">{commitment.organizationName}</td>
                      <td className="py-3 px-6 text-left">{new Date(commitment.date).toLocaleDateString()}</td>
                      <td className="py-3 px-6 text-left">{commitment.arrivalTime} - {commitment.departureTime}</td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex item-center justify-center space-x-2">
                          <button
                            onClick={() => handleRemoveCommitment(commitment._id)}
                            className="text-accent2 hover:text-red-800 transition-colors duration-150 text-xs font-medium font-montserrat"
                          >
                            Remove
                          </button>
                          <button
                            onClick={() => router.push(`/?opportunity=${commitment._id}`)}
                            className="text-accent1 hover:text-accent1-dark transition-colors duration-150 text-xs font-medium font-montserrat"
                          >
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Notification Settings Modal */}
      <Modal isOpen={isNotificationModalOpen} onClose={() => setIsNotificationModalOpen(false)}>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Chat Notification Settings</h2>
          <form onSubmit={handleNotificationSettingsSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notificationFrequency">
                Email Notification Frequency for New Chat Messages
              </label>
              <select
                id="notificationFrequency"
                name="notificationFrequency"
                value={notificationFrequency}
                onChange={handleNotificationFrequencyChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="never">Never</option>
                <option value="immediate">Immediate (as soon as a new message is posted)</option>
                <option value="5min">Every 5 minutes</option>
                <option value="30min">Every 30 minutes</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose how often you want to receive email notifications for new chat messages in your commitments.
              </p>
            </div>
            
            {error && <p className="text-red-500 mb-4">{error}</p>}
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsNotificationModalOpen(false)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
                disabled={notificationLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                disabled={notificationLoading}
              >
                {notificationLoading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}