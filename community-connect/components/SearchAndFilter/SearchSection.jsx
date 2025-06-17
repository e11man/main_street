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
    <section className="max-w-screen-xl mx-auto px-6 md:px-8 mb-16 md:mb-20">
      {/* My Commitments Section */}
      <MyCommitments 
        currentUser={currentUser} 
        opportunities={opportunities} 
        onLoginClick={handleLoginClick} 
        onDecommit={handleDecommit}
      />
      
      {/* Search Bar */}
      <div className="relative bg-white rounded-xl md:rounded-2xl shadow-lg border border-border/60 mb-10 transition-all duration-300 hover:shadow-xl group">
        <Input
          type="text"
          placeholder="Discover opportunities that matter to you"
          className="h-14 md:h-16 pl-14 pr-6 focus:ring-0 focus:border-accent1 focus:shadow-[0_0_0_3px_rgba(0,175,206,0.2)] rounded-xl md:rounded-2xl font-montserrat text-text-primary"
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
        />
        <Icon
          path="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-accent1 transition-all duration-300 group-hover:scale-110"
        />
      </div>

      <FilterTabs currentFilter={filter} setFilter={setFilter} />
    </section>
  );
};

export default SearchSection;
