import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import axios from 'axios';
import Header from '../components/Header/Header.jsx';
import Modal from '../components/Modal/Modal.jsx';
import ChatModal from '../components/Modal/ChatModal.jsx'; // Import ChatModal
import GooglePlacesAutocomplete from '../components/GooglePlacesAutocomplete';
import SafetyInfoModal from '../components/Safety/SafetyInfoModal';

export default function OrganizationDashboard() {
  const router = useRouter();
  const [organizationData, setOrganizationData] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [isOpportunityModalOpen, setIsOpportunityModalOpen] = useState(false);
  const [currentOpportunity, setCurrentOpportunity] = useState(null);
  const [opportunityFormData, setOpportunityFormData] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    arrivalTime: '',
    departureTime: '',
    totalSpots: '',
    location: '',
    specialInstructions: '',
    whatToBring: '',
    meetingPoint: '',
    contactPerson: '',
    contactPhone: '',
    isRecurring: false,
    recurringFrequency: 'daily',
    recurringDays: []
  });
  const [isOrganizationInfoModalOpen, setIsOrganizationInfoModalOpen] = useState(false);
  const [organizationFormData, setOrganizationFormData] = useState({
    name: '',
    description: '',
    website: '',
    phone: ''
  });
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedOpportunityForChat, setSelectedOpportunityForChat] = useState(null);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [safetyContent, setSafetyContent] = useState({});
  
  // Notification settings state
  const [notificationFrequency, setNotificationFrequency] = useState('immediate');
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  useEffect(() => {
    // Check if organization is logged in
    const storedOrganizationData = localStorage.getItem('organizationData');
    if (!storedOrganizationData) {
      router.push('/');
      return;
    }

    const parsedOrganizationData = JSON.parse(storedOrganizationData);
    
    // Check if organization is approved
    if (!parsedOrganizationData.approved) {
      // Remove the stored data
      localStorage.removeItem('organizationData');
      // Redirect to login page with error message
      router.push('/organization-login?error=not_approved');
      return;
    }
    
    setOrganizationData(parsedOrganizationData);
    
    // Initialize organization form data
    setOrganizationFormData({
      name: parsedOrganizationData.name || '',
      description: parsedOrganizationData.description || '',
      website: parsedOrganizationData.website || '',
      phone: parsedOrganizationData.phone || ''
    });
    
    // Initialize notification frequency
    setNotificationFrequency(parsedOrganizationData.chatNotificationFrequency || 'immediate');
    
    // Fetch organization opportunities
    fetchOpportunities(parsedOrganizationData._id);
  }, [router]);

  const fetchOpportunities = async (organizationId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/organizations/opportunities?organizationId=${organizationId}`);
      setOpportunities(response.data);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      setError('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('organizationData');
    router.push('/');
  };

  const openOpportunityModal = (opportunity = null) => {
    setCurrentOpportunity(opportunity);
    if (opportunity) {
      // Edit existing opportunity
      setOpportunityFormData({
        title: opportunity.title || '',
        description: opportunity.description || '',
        category: opportunity.category || '',
        date: opportunity.date || '',
        arrivalTime: opportunity.arrivalTime || '',
        departureTime: opportunity.departureTime || '',
        totalSpots: opportunity.totalSpots || '',
        location: opportunity.location || '',
        specialInstructions: opportunity.specialInstructions || '',
        whatToBring: opportunity.whatToBring || '',
        meetingPoint: opportunity.meetingPoint || '',
        contactPerson: opportunity.contactPerson || '',
        contactPhone: opportunity.contactPhone || '',
        isRecurring: opportunity.isRecurring || false,
        recurringFrequency: opportunity.recurringFrequency || 'daily',
        recurringDays: opportunity.recurringDays || []
      });
    } else {
      // New opportunity
      setOpportunityFormData({
        title: '',
        description: '',
        category: '',
        date: '',
        arrivalTime: '',
        departureTime: '',
        totalSpots: '',
        location: '',
        specialInstructions: '',
        whatToBring: '',
        meetingPoint: '',
        contactPerson: '',
        contactPhone: '',
        isRecurring: false,
        recurringFrequency: 'daily',
        recurringDays: []
      });
    }
    setIsOpportunityModalOpen(true);
  };

  const handleOpportunityFormChange = (e) => {
    const { name, value } = e.target;
    setOpportunityFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpportunitySubmit = async (e) => {
    e.preventDefault();

    // Ensure minimum 6 volunteers
    if (parseInt(opportunityFormData.totalSpots, 10) < 6) {
      setError('Please specify at least 6 volunteer spots');
      return;
    }

    // For new opportunities, show safety modal first
    if (!currentOpportunity) {
      try {
        const response = await fetch('/api/content');
        if (response.ok) {
          const content = await response.json();
          setSafetyContent(content);
          setShowSafetyModal(true);
          return;
        }
      } catch (error) {
        console.error('Error fetching safety content:', error);
      }
    }

    // If safety content fetch fails or it's an update, proceed without safety modal
    await performOpportunitySubmit();
  };

  const performOpportunitySubmit = async () => {
    try {
      const opportunityData = {
        ...opportunityFormData,
        organizationId: organizationData._id
      };
      
      // If it's not recurring, remove recurring fields
      if (!opportunityData.isRecurring) {
        delete opportunityData.recurringFrequency;
        delete opportunityData.recurringDays;
      }
      
      if (currentOpportunity) {
        // Update existing opportunity
        await axios.put('/api/organizations/opportunities', {
          ...opportunityData,
          id: currentOpportunity._id
        });
      } else {
        // Create new opportunity
        await axios.post('/api/organizations/opportunities', opportunityData);
      }
      
      // Refresh opportunities list
      fetchOpportunities(organizationData._id);
      setIsOpportunityModalOpen(false);
    } catch (error) {
      console.error('Error saving opportunity:', error);
      setError(error.response?.data?.error || 'Failed to save opportunity');
    }
  };

  const handleSafetyAcknowledge = async () => {
    setShowSafetyModal(false);
    await performOpportunitySubmit();
  };

  const handleDeleteOpportunity = async (id) => {
    // Check if this is a recurring opportunity
    const opportunity = opportunities.find(opp => opp._id === id);
    let deleteAllRecurring = false;
    
    if (!opportunity) return;
    
    if (opportunity.isRecurring || opportunity.parentOpportunityId) {
      // Ask if they want to delete all recurring instances
      if (confirm('This is a recurring opportunity. Do you want to delete all future instances?')) {
        deleteAllRecurring = true;
      } else if (!confirm('Do you want to delete only this instance?')) {
        return; // User cancelled
      }
    } else if (!confirm('Are you sure you want to delete this opportunity?')) {
      return; // User cancelled
    }
    
    try {
      await axios.delete(`/api/organizations/opportunities?id=${id}&organizationId=${organizationData._id}&deleteAllRecurring=${deleteAllRecurring}`);
      // Refresh opportunities list
      fetchOpportunities(organizationData._id);
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      setError(error.response?.data?.error || 'Failed to delete opportunity');
    }
  };

  const handleOrganizationFormChange = (e) => {
    const { name, value } = e.target;
    setOrganizationFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOrganizationInfoSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Update organization info
      const response = await axios.put('/api/organizations', {
        ...organizationFormData,
        id: organizationData._id
      });
      
      // Update local state and storage
      const updatedOrganizationData = { ...organizationData, ...organizationFormData };
      setOrganizationData(updatedOrganizationData);
      localStorage.setItem('organizationData', JSON.stringify(updatedOrganizationData));
      
      setIsOrganizationInfoModalOpen(false);
    } catch (error) {
      console.error('Error updating organization info:', error);
      setError(error.response?.data?.error || 'Failed to update organization information');
    }
  };

  const openChatModal = (opportunity) => {
    setSelectedOpportunityForChat(opportunity);
    setIsChatModalOpen(true);
  };

  const openOrganizationInfoModal = () => {
    setOrganizationFormData({
      name: organizationData.name || '',
      description: organizationData.description || '',
      website: organizationData.website || '',
      phone: organizationData.phone || ''
    });
    setIsOrganizationInfoModalOpen(true);
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
      const response = await axios.put('/api/organizations/notification-settings', {
        organizationId: organizationData._id,
        chatNotificationFrequency: notificationFrequency
      });
      
      // Update local organization data
      const updatedOrganizationData = {
        ...organizationData,
        chatNotificationFrequency: notificationFrequency
      };
      setOrganizationData(updatedOrganizationData);
      localStorage.setItem('organizationData', JSON.stringify(updatedOrganizationData));
      
      setIsNotificationModalOpen(false);
      setError('');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      setError('Failed to update notification settings');
    } finally {
      setNotificationLoading(false);
    }
  };

  if (!organizationData) {
    return <div className="text-center p-10">Loading...</div>;
  }

  return (
    <div>
      <Head>
        <title>Organization Dashboard | Main Street Opportunities</title>
        <meta name="description" content="Manage your volunteer opportunities" />
      </Head>

      <Header />

      <main className="container mx-auto px-4 pt-24 pb-8"> {/* Added pt-24 for padding top */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary font-montserrat">{organizationData.name} Dashboard</h1>
            <p className="text-text-secondary font-source-serif">{organizationData.email}</p>
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
            <h2 className="text-xl font-semibold text-primary font-montserrat">Organization Information</h2>
            <button
              onClick={openOrganizationInfoModal}
              className="bg-accent1 hover:bg-accent1-dark text-white font-bold py-2 px-4 rounded font-montserrat"
            >
              Edit Information
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-text-secondary font-montserrat">Description:</p>
              <p className="text-text-primary font-source-serif">{organizationData.description || 'No description provided'}</p>
            </div>
            <div>
              <p className="text-text-secondary font-montserrat">Website:</p>
              <p className="text-text-primary font-source-serif">{organizationData.website || 'No website provided'}</p>
            </div>
            <div>
              <p className="text-text-secondary font-montserrat">Phone:</p>
              <p className="text-text-primary font-source-serif">{organizationData.phone || 'No phone number provided'}</p>
            </div>
          </div>
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
                {organizationData.chatNotificationFrequency === 'never' && 'Never'}
                {organizationData.chatNotificationFrequency === 'immediate' && 'Immediate (as soon as a new message is posted)'}
                {organizationData.chatNotificationFrequency === '5min' && 'Every 5 minutes'}
                {organizationData.chatNotificationFrequency === '30min' && 'Every 30 minutes'}
                {!organizationData.chatNotificationFrequency && 'Immediate (default)'}
              </p>
            </div>
            <div>
              <p className="text-text-secondary font-montserrat">Current Setting:</p>
              <p className="text-text-primary font-source-serif">
                {organizationData.chatNotificationFrequency || 'immediate'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-background shadow-md rounded-lg p-6 border border-border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-primary font-montserrat">Your Opportunities</h2>
            <button
              onClick={() => setIsOpportunityModalOpen(true)}
              className="bg-accent1 hover:bg-accent1-dark text-white font-bold py-2 px-4 rounded font-montserrat"
            >
              Add New Opportunity
            </button>
          </div>
          
          {opportunities.length === 0 ? (
            <p className="text-text-secondary text-center py-4 font-source-serif">No opportunities yet. Create your first one!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-background">
                <thead>
                  <tr className="bg-surface text-text-secondary uppercase text-sm leading-normal font-montserrat">
                    <th className="py-3 px-6 text-left">Title</th>
                    <th className="py-3 px-6 text-left">Category</th>
                    <th className="py-3 px-6 text-left">Date</th>
                    <th className="py-3 px-6 text-left">Spots</th>
                    <th className="py-3 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-text-primary text-sm font-source-serif">
                  {opportunities.map((opportunity) => (
                    <tr key={opportunity._id} className="border-b border-border hover:bg-surface-hover">
                      <td className="py-3 px-6 text-left">{opportunity.title}</td>
                      <td className="py-3 px-6 text-left">{opportunity.category}</td>
                      <td className="py-3 px-6 text-left">{new Date(opportunity.date).toLocaleDateString()}</td>
                      <td className="py-3 px-6 text-left">{opportunity.spotsFilled || 0} / {opportunity.spotsTotal || opportunity.totalSpots || 0}</td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex item-center justify-center space-x-2">
                          <button
                            onClick={() => openOpportunityModal(opportunity)}
                            className="text-accent1 hover:text-accent1-dark transition-colors duration-150 text-xs font-medium font-montserrat"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteOpportunity(opportunity._id)}
                            className="text-accent2 hover:text-red-800 transition-colors duration-150 text-xs font-medium font-montserrat"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => openChatModal(opportunity)}
                            className="text-accent1 hover:text-accent1-dark transition-colors duration-150 text-xs font-medium font-montserrat"
                          >
                            Chat
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

      {/* Opportunity Form Modal */}
      <Modal
        isOpen={isOpportunityModalOpen}
        onClose={() => setIsOpportunityModalOpen(false)}
        title={currentOpportunity ? 'Edit Opportunity' : 'Create New Opportunity'}
      >
        <div className="p-4">
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="text-red-500">*</span> indicates required fields
            </p>
          </div>
          <form onSubmit={handleOpportunitySubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="title"
                type="text"
                name="title"
                value={opportunityFormData.title}
                onChange={handleOpportunityFormChange}
                placeholder="Opportunity Title"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="description"
                name="description"
                value={opportunityFormData.description}
                onChange={handleOpportunityFormChange}
                placeholder="Describe the opportunity"
                rows="4"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="category"
                name="category"
                value={opportunityFormData.category}
                onChange={handleOpportunityFormChange}
                required
              >
                <option value="">Select a category</option>
                <option value="community">Community</option>
                <option value="education">Education</option>
                <option value="environment">Environment</option>
                <option value="health">Health</option>
                <option value="fundraising">Fundraising</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="date"
                type="date"
                name="date"
                value={opportunityFormData.date}
                onChange={handleOpportunityFormChange}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="arrivalTime">
                Arrival Time <span className="text-red-500">*</span>
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="arrivalTime"
                type="time"
                name="arrivalTime"
                value={opportunityFormData.arrivalTime}
                onChange={handleOpportunityFormChange}
                required
              />
              <p className="text-xs text-gray-500 mt-1">What time should volunteers arrive? (e.g., &quot;Arrive by 12:00 PM&quot;)</p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="departureTime">
                Expected End Time <span className="text-red-500">*</span>
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="departureTime"
                type="time"
                name="departureTime"
                value={opportunityFormData.departureTime}
                onChange={handleOpportunityFormChange}
                required
              />
              <p className="text-xs text-gray-500 mt-1">When will the volunteers be done? This helps volunteers plan their day.</p>
            </div>

            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  id="isRecurring"
                  type="checkbox"
                  name="isRecurring"
                  checked={opportunityFormData.isRecurring}
                  onChange={(e) => {
                    setOpportunityFormData(prev => ({
                      ...prev,
                      isRecurring: e.target.checked
                    }));
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isRecurring" className="ml-2 block text-gray-700 text-sm font-bold">
                  Recurring Opportunity
                </label>
              </div>
              
              {opportunityFormData.isRecurring && (
                <div className="pl-6 border-l-2 border-gray-200">
                  <div className="mb-3">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="recurringFrequency">
                      Frequency
                    </label>
                    <select
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="recurringFrequency"
                      name="recurringFrequency"
                      value={opportunityFormData.recurringFrequency}
                      onChange={handleOpportunityFormChange}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  
                  {opportunityFormData.recurringFrequency === 'weekly' && (
                    <div className="mb-3">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Days of Week
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                          <div key={day} className="flex items-center">
                            <input
                              id={`day-${day}`}
                              type="checkbox"
                              checked={opportunityFormData.recurringDays.includes(day)}
                              onChange={(e) => {
                                const updatedDays = e.target.checked
                                  ? [...opportunityFormData.recurringDays, day]
                                  : opportunityFormData.recurringDays.filter(d => d !== day);
                                setOpportunityFormData(prev => ({
                                  ...prev,
                                  recurringDays: updatedDays
                                }));
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`day-${day}`} className="ml-2 text-sm text-gray-700">
                              {day}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {opportunityFormData.recurringFrequency === 'daily' && (
                    <div className="mb-3">
                      <div className="flex items-center">
                        <input
                          id="weekdaysOnly"
                          type="checkbox"
                          checked={opportunityFormData.recurringDays.includes('weekdays')}
                          onChange={(e) => {
                            const updatedDays = e.target.checked
                              ? ['weekdays']
                              : opportunityFormData.recurringDays.filter(d => d !== 'weekdays');
                            setOpportunityFormData(prev => ({
                              ...prev,
                              recurringDays: updatedDays
                            }));
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="weekdaysOnly" className="ml-2 text-sm text-gray-700">
                          Weekdays Only (Monday-Friday)
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="totalSpots">
                Total Volunteer Spots <span className="text-red-500">*</span>
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="totalSpots"
                type="number"
                name="totalSpots"
                value={opportunityFormData.totalSpots}
                onChange={handleOpportunityFormChange}
                min="6"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Minimum required: 6</p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
                Location Address <span className="text-red-500">*</span>
              </label>
              <GooglePlacesAutocomplete
                value={opportunityFormData.location}
                onChange={e => setOpportunityFormData(prev => ({ ...prev, location: e.target.value }))}
                onSelect={address => setOpportunityFormData(prev => ({ ...prev, location: address }))}
                placeholder="Search for a valid address"
              />
              <p className="text-xs text-gray-500 mt-1">The main address where volunteers will be working</p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="meetingPoint">
                Meeting Point
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="meetingPoint"
                type="text"
                name="meetingPoint"
                value={opportunityFormData.meetingPoint}
                onChange={handleOpportunityFormChange}
                placeholder="Where exactly should volunteers meet? (e.g., Main entrance, Room 101, etc.)"
              />
              <p className="text-xs text-gray-500 mt-1">Specific meeting spot at the location (Optional but recommended)</p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contactPerson">
                Contact Person
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="contactPerson"
                type="text"
                name="contactPerson"
                value={opportunityFormData.contactPerson}
                onChange={handleOpportunityFormChange}
                placeholder="Name of person volunteers should ask for on arrival"
              />
              <p className="text-xs text-gray-500 mt-1">Who should volunteers ask for when they arrive?</p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contactPhone">
                Contact Phone Number
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="contactPhone"
                type="tel"
                name="contactPhone"
                value={opportunityFormData.contactPhone}
                onChange={handleOpportunityFormChange}
                placeholder="Phone number for day-of questions"
              />
              <p className="text-xs text-gray-500 mt-1">Phone number volunteers can call if they&apos;re lost or running late</p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="whatToBring">
                What to Bring
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="whatToBring"
                name="whatToBring"
                value={opportunityFormData.whatToBring}
                onChange={handleOpportunityFormChange}
                placeholder="What should volunteers bring? (e.g., Work gloves, water bottle, closed-toe shoes, etc.)"
                rows="3"
              />
              <p className="text-xs text-gray-500 mt-1">List any specific items volunteers should bring</p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="specialInstructions">
                Special Instructions & Important Details
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="specialInstructions"
                name="specialInstructions"
                value={opportunityFormData.specialInstructions}
                onChange={handleOpportunityFormChange}
                placeholder="Any special instructions, parking info, dress code, or other important details volunteers should know"
                rows="4"
              />
              <p className="text-xs text-gray-500 mt-1">Include parking instructions, dress code, safety requirements, etc.</p>
            </div>

            {error && (
              <div className="mb-4 text-red-500 text-sm">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                {currentOpportunity ? 'Update Opportunity' : 'Create Opportunity'}
              </button>
              <button
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button"
                onClick={() => setIsOpportunityModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </Modal>
      {/* Organization Info Edit Modal */}
      <Modal isOpen={isOrganizationInfoModalOpen} onClose={() => setIsOrganizationInfoModalOpen(false)}>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Edit Organization Information</h2>
          <form onSubmit={handleOrganizationInfoSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Organization Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={organizationFormData.name}
                onChange={handleOrganizationFormChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={organizationFormData.description}
                onChange={handleOrganizationFormChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="website">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={organizationFormData.website}
                onChange={handleOrganizationFormChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={organizationFormData.phone}
                onChange={handleOrganizationFormChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            {error && <p className="text-red-500 mb-4">{error}</p>}
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsOrganizationInfoModalOpen(false)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Chat Modal */}
      {selectedOpportunityForChat && (
        <ChatModal
          isOpen={isChatModalOpen}
          onClose={() => {
            setIsChatModalOpen(false);
            setSelectedOpportunityForChat(null);
          }}
          opportunity={selectedOpportunityForChat}
          currentUser={organizationData} // Pass organizationData as currentUser
          isCompany={true} // Indicate that the sender is an organization
        />
      )}

      {/* Safety Information Modal */}
      <SafetyInfoModal
        isOpen={showSafetyModal}
        onClose={() => setShowSafetyModal(false)}
        onAcknowledge={handleSafetyAcknowledge}
        type="org"
        content={safetyContent}
      />

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
                Choose how often you want to receive email notifications for new chat messages in your opportunities.
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