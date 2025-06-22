import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import axios from 'axios';
import Header from '../components/Header/Header.jsx';
import Modal from '../components/Modal/Modal.jsx';
import GooglePlacesAutocomplete from '../components/GooglePlacesAutocomplete';

export default function CompanyDashboard() {
  const router = useRouter();
  const [companyData, setCompanyData] = useState(null);
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
    priority: 'Medium',
    date: '',
    time: '',
    totalSpots: '',
    location: '',
    isRecurring: false,
    recurringFrequency: 'daily',
    recurringDays: []
  });
  const [isCompanyInfoModalOpen, setIsCompanyInfoModalOpen] = useState(false);
  const [companyFormData, setCompanyFormData] = useState({
    name: '',
    description: '',
    website: '',
    phone: ''
  });

  useEffect(() => {
    // Check if company is logged in
    const storedCompanyData = localStorage.getItem('companyData');
    if (!storedCompanyData) {
      router.push('/');
      return;
    }

    const parsedCompanyData = JSON.parse(storedCompanyData);
    
    // Check if company is approved
    if (!parsedCompanyData.approved) {
      // Remove the stored data
      localStorage.removeItem('companyData');
      // Redirect to login page with error message
      router.push('/company-login?error=not_approved');
      return;
    }
    
    setCompanyData(parsedCompanyData);
    
    // Initialize company form data
    setCompanyFormData({
      name: parsedCompanyData.name || '',
      description: parsedCompanyData.description || '',
      website: parsedCompanyData.website || '',
      phone: parsedCompanyData.phone || ''
    });
    
    // Fetch company opportunities
    fetchOpportunities(parsedCompanyData._id);
  }, []);

  const fetchOpportunities = async (companyId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/companies/opportunities?companyId=${companyId}`);
      setOpportunities(response.data);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      setError('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('companyData');
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
        priority: opportunity.priority || 'Medium',
        date: opportunity.date || '',
        time: opportunity.time || '',
        totalSpots: opportunity.totalSpots || '',
        location: opportunity.location || '',
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
        priority: 'Medium',
        date: '',
        totalSpots: '',
        location: '',
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
    
    try {
      const opportunityData = {
        ...opportunityFormData,
        companyId: companyData._id
      };
      
      // If it's not recurring, remove recurring fields
      if (!opportunityData.isRecurring) {
        delete opportunityData.recurringFrequency;
        delete opportunityData.recurringDays;
      }
      
      if (currentOpportunity) {
        // Update existing opportunity
        await axios.put('/api/companies/opportunities', {
          ...opportunityData,
          id: currentOpportunity.id
        });
      } else {
        // Create new opportunity
        await axios.post('/api/companies/opportunities', opportunityData);
      }
      
      // Refresh opportunities list
      fetchOpportunities(companyData._id);
      setIsOpportunityModalOpen(false);
    } catch (error) {
      console.error('Error saving opportunity:', error);
      setError(error.response?.data?.error || 'Failed to save opportunity');
    }
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
      await axios.delete(`/api/companies/opportunities?id=${id}&companyId=${companyData._id}&deleteAllRecurring=${deleteAllRecurring}`);
      // Refresh opportunities list
      fetchOpportunities(companyData._id);
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      setError(error.response?.data?.error || 'Failed to delete opportunity');
    }
  };

  const handleCompanyFormChange = (e) => {
    const { name, value } = e.target;
    setCompanyFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCompanyInfoSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Update company info
      const response = await axios.put('/api/companies', {
        ...companyFormData,
        id: companyData._id
      });
      
      // Update local state and storage
      const updatedCompanyData = { ...companyData, ...companyFormData };
      setCompanyData(updatedCompanyData);
      localStorage.setItem('companyData', JSON.stringify(updatedCompanyData));
      
      setIsCompanyInfoModalOpen(false);
    } catch (error) {
      console.error('Error updating company info:', error);
      setError(error.response?.data?.error || 'Failed to update company information');
    }
  };

  const openCompanyInfoModal = () => {
    setCompanyFormData({
      name: companyData.name || '',
      description: companyData.description || '',
      website: companyData.website || '',
      phone: companyData.phone || ''
    });
    setIsCompanyInfoModalOpen(true);
  };

  if (!companyData) {
    return <div className="text-center p-10">Loading...</div>;
  }

  return (
    <div>
      <Head>
        <title>Company Dashboard | Main Street Opportunities</title>
        <meta name="description" content="Manage your volunteer opportunities" />
      </Head>

      <Header />

      <main className="container mx-auto px-4 pt-24 pb-8"> {/* Added pt-24 for padding top */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{companyData.name} Dashboard</h1>
            <p className="text-gray-600">{companyData.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Company Information</h2>
            <button
              onClick={openCompanyInfoModal}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Edit Information
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Description:</p>
              <p>{companyData.description || 'No description provided'}</p>
            </div>
            <div>
              <p className="text-gray-600">Website:</p>
              <p>{companyData.website || 'No website provided'}</p>
            </div>
            <div>
              <p className="text-gray-600">Phone:</p>
              <p>{companyData.phone || 'No phone number provided'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Your Opportunities</h2>
            <button
              onClick={() => setIsOpportunityModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Add New Opportunity
            </button>
          </div>
          
          {opportunities.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No opportunities yet. Create your first one!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">Title</th>
                    <th className="py-3 px-6 text-left">Category</th>
                    <th className="py-3 px-6 text-left">Date</th>
                    <th className="py-3 px-6 text-left">Spots</th>
                    <th className="py-3 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm">
                  {opportunities.map((opportunity) => (
                    <tr key={opportunity._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-6 text-left">{opportunity.title}</td>
                      <td className="py-3 px-6 text-left">{opportunity.category}</td>
                      <td className="py-3 px-6 text-left">{new Date(opportunity.date).toLocaleDateString()}</td>
                      <td className="py-3 px-6 text-left">{opportunity.filledSpots || 0} / {opportunity.totalSpots}</td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex item-center justify-center">
                          <button
                            onClick={() => openOpportunityModal(opportunity)}
                            className="transform hover:text-blue-500 hover:scale-110 transition-all duration-150 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteOpportunity(opportunity._id)}
                            className="transform hover:text-red-500 hover:scale-110 transition-all duration-150"
                          >
                            Delete
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
          <form onSubmit={handleOpportunitySubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                Title
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
                Description
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
                Category
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
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="priority">
                Priority
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="priority"
                name="priority"
                value={opportunityFormData.priority}
                onChange={handleOpportunityFormChange}
                required
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
                Date
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
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="time">
                Time
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="time"
                type="time"
                name="time"
                value={opportunityFormData.time}
                onChange={handleOpportunityFormChange}
                required
              />
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
                Total Volunteer Spots
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="totalSpots"
                type="number"
                name="totalSpots"
                value={opportunityFormData.totalSpots}
                onChange={handleOpportunityFormChange}
                min="1"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
                Location
              </label>
              <GooglePlacesAutocomplete
                value={opportunityFormData.location}
                onChange={e => setOpportunityFormData(prev => ({ ...prev, location: e.target.value }))}
                onSelect={address => setOpportunityFormData(prev => ({ ...prev, location: address }))}
                placeholder="Search for a valid address"
              />
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
      {/* Company Info Edit Modal */}
      <Modal isOpen={isCompanyInfoModalOpen} onClose={() => setIsCompanyInfoModalOpen(false)}>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Edit Company Information</h2>
          <form onSubmit={handleCompanyInfoSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Company Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={companyFormData.name}
                onChange={handleCompanyFormChange}
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
                value={companyFormData.description}
                onChange={handleCompanyFormChange}
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
                value={companyFormData.website}
                onChange={handleCompanyFormChange}
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
                value={companyFormData.phone}
                onChange={handleCompanyFormChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            {error && <p className="text-red-500 mb-4">{error}</p>}
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsCompanyInfoModalOpen(false)}
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
    </div>
  );
}