import React, { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Icon from '../ui/Icon';
import FilterTabs from './FilterTabs';
import { toast } from 'react-hot-toast';
import MyCommitments from '../Commitments/MyCommitments';

const SearchSection = ({ filter, setFilter, searchTerm, setSearchTerm, currentUser, opportunities, openAuthModal, onJoinOpportunity, onUserUpdate }) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(localSearchTerm);
    }, 300); // Debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [localSearchTerm, setSearchTerm]);

  const handleLoginClick = () => {
    openAuthModal();
  };
  
  const handleDecommit = async (commitment) => {
    if (!currentUser) return;
    
    try {
      console.log('Decommitting from opportunity:', commitment);
      
      // Show loading toast
      const loadingToastId = toast.loading('Removing your commitment...');
      
      const response = await fetch('/api/users?removeCommitment=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser._id,
          opportunityId: Number(commitment.id), // Convert to number explicitly
        }),
      });
      
      // Dismiss loading toast
      toast.dismiss(loadingToastId);
      
      if (response.ok) {
        const updatedUser = await response.json();
        // Update the current user with the new commitments
        onUserUpdate(updatedUser);
        toast.success(`Successfully removed commitment to ${commitment.title}`);
      } else {
        const error = await response.json();
        console.error('Server error:', error);
        toast.error(error.error || 'Failed to remove commitment. Please try again.');
      }
    } catch (error) {
      console.error('Error removing commitment:', error);
      toast.error('An error occurred while removing your commitment. Please try again later.');
    }
  };

  return (
    <section className="max-w-screen-xl mx-auto px-6 md:px-8 mb-20 md:mb-24">
      {/* My Commitments Section */}
      <div className="mb-16">
        <MyCommitments 
          currentUser={currentUser} 
          opportunities={opportunities} 
          onLoginClick={handleLoginClick} 
          onDecommit={handleDecommit}
          onDormUpdate={onUserUpdate} // Pass down user update handler
        />
      </div>
      
      {/* Search Section */}
      <div className="bg-gradient-to-r from-surface/20 via-white to-surface/20 rounded-3xl p-8 border border-border/30 shadow-lg mb-12">
        <div className="text-center mb-6">
          <h2 className="font-montserrat text-2xl font-bold text-primary mb-2">Find Your Perfect Opportunity</h2>
          <p className="text-text-secondary font-medium">Search and filter through meaningful volunteer opportunities</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative bg-white rounded-2xl shadow-lg border-2 border-border/40 mb-8 transition-all duration-300 hover:shadow-xl hover:border-accent1/50 group max-w-2xl mx-auto">
          <Input
            type="text"
            placeholder="Search by title, description, or category..."
            className="h-16 pl-16 pr-6 focus:ring-0 focus:border-accent1 focus:shadow-[0_0_0_4px_rgba(0,175,206,0.15)] rounded-2xl font-montserrat text-text-primary text-lg"
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
          />
          <div className="absolute left-5 top-1/2 -translate-y-1/2 bg-accent1/10 p-2 rounded-full transition-all duration-300 group-hover:bg-accent1/20 group-hover:scale-110">
            <Icon
              path="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              className="w-6 h-6 text-accent1 transition-all duration-300"
            />
          </div>
          {localSearchTerm && (
            <button
              onClick={() => setLocalSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-text-tertiary/20 hover:bg-text-tertiary/40 p-1 rounded-full transition-all duration-200"
              aria-label="Clear search"
            >
              <Icon
                path="M6 18L18 6M6 6l12 12"
                className="w-4 h-4 text-text-tertiary"
              />
            </button>
          )}
        </div>

        <FilterTabs currentFilter={filter} setFilter={setFilter} />
      </div>
    </section>
  );
};

export default SearchSection;
