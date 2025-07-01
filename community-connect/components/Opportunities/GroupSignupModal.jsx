import React, { useState, useEffect } from 'react';
import Icon from '../ui/Icon';
import Button from '../ui/Button';

const GroupSignupModal = ({ isOpen, onClose, opportunity, currentUser, onGroupSignup }) => {
  const [floorUsers, setFloorUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOnlyDorm, setShowOnlyDorm] = useState(false);

  const fetchFloorUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      let url = `/api/users/floor-users?userId=${currentUser._id}&search=${searchTerm}`;
      if (showOnlyDorm && currentUser.dorm) {
        url += `&dorm=${encodeURIComponent(currentUser.dorm)}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const users = await response.json();
        setFloorUsers(users);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching floor users:', error);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && currentUser?._id) {
      fetchFloorUsers();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentUser, showOnlyDorm]);

  const handleSearch = () => {
    fetchFloorUsers();
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleGroupSignup = async () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one user to sign up');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/users/group-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paUserId: currentUser._id,
          opportunityId: opportunity.id,
          userIds: selectedUsers
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onGroupSignup(data);
        onClose();
        setSelectedUsers([]);
        setSearchTerm('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to sign up users');
      }
    } catch (error) {
      console.error('Error performing group signup:', error);
      setError('Failed to sign up users');
    } finally {
      setLoading(false);
    }
  };

  const availableSpots = opportunity ? ((opportunity.spotsTotal || opportunity.totalSpots || 0) - (opportunity.spotsFilled || 0)) : 0;
  const canSelectMore = selectedUsers.length < availableSpots;

  if (!isOpen || !opportunity || !currentUser) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Group Signup</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <Icon path="M6 18L18 6M6 6l12 12" className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Sign up multiple people for: <strong>{opportunity?.title || 'Event'}</strong>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Available spots: {availableSpots} | Selected: {selectedUsers.length}
          </p>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Search and Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Users
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="px-4 py-2"
              >
                Search
              </Button>
            </div>
            
            {/* Filter Toggle */}
            {currentUser.dorm && (
              <div className="mb-2">
                <label className="flex items-center text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={showOnlyDorm}
                                         onChange={(e) => setShowOnlyDorm(e.target.checked)}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Show only users from {currentUser.dorm}
                </label>
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-1">
              {searchTerm ? 
                `Showing search results${showOnlyDorm ? ` from ${currentUser.dorm}` : ' from all users'}` : 
                (showOnlyDorm ? 
                  `Showing users from ${currentUser.dorm}` : 
                  `Showing all users (${currentUser.dorm || 'your dorm'} users listed first)`
                )
              }
            </p>
          </div>

          {/* Users List */}
          <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading users...</div>
            ) : floorUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'No users found matching your search' : 'No users found'}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {floorUsers.map(user => {
                  const isSelected = selectedUsers.includes(user._id);
                  const isDisabled = !canSelectMore && !isSelected;
                  const hasMaxCommitments = (user.commitments || []).length >= 2;
                  const isAlreadyCommitted = opportunity?.id && ((user.commitments || []).includes(opportunity.id) || 
                                              (user.commitments || []).includes(parseInt(opportunity.id)));
                  const isFromSameDorm = user.dorm === currentUser.dorm;

                  return (
                    <div
                      key={user._id}
                      className={`p-3 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'
                      } ${(isDisabled || hasMaxCommitments || isAlreadyCommitted) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => {
                        if (!isDisabled && !hasMaxCommitments && !isAlreadyCommitted) {
                          toggleUserSelection(user._id);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 flex items-center">
                            {user.name}
                            {user.isPA && <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">PA</span>}
                            {isFromSameDorm && <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Your Dorm</span>}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                          <p className="text-xs text-gray-400">
                            {user.dorm} | Commitments: {(user.commitments || []).length}/2
                          </p>
                          {hasMaxCommitments && (
                            <p className="text-xs text-red-500">Maximum commitments reached</p>
                          )}
                          {isAlreadyCommitted && (
                            <p className="text-xs text-orange-500">Already signed up for this opportunity</p>
                          )}
                        </div>
                        <div className="flex items-center">
                          {isSelected && (
                            <Icon
                              path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              className="w-5 h-5 text-blue-500"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-gray-600">
              {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGroupSignup}
                disabled={loading || selectedUsers.length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Signing Up...' : `Sign Up ${selectedUsers.length} User${selectedUsers.length !== 1 ? 's' : ''}`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupSignupModal;