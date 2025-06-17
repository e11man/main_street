import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Icon from '../ui/Icon';

const MyCommitments = ({ currentUser, opportunities, onLoginClick, onDecommit }) => {
  const [userCommitments, setUserCommitments] = useState([]);

  useEffect(() => {
    if (currentUser && currentUser.commitments && opportunities.length > 0) {
      // Find the full opportunity objects that match the user's commitment IDs
      const userCommitmentObjects = currentUser.commitments
        .map(commitmentId => opportunities.find(opp => opp.id === commitmentId))
        .filter(Boolean); // Filter out any undefined values
      
      setUserCommitments(userCommitmentObjects);
    } else {
      setUserCommitments([]);
    }
  }, [currentUser, opportunities]);

  if (!currentUser) {
    return (
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-border/60 p-6 mb-6 transition-all duration-300 hover:shadow-xl">
        <div className="flex flex-col items-center justify-center text-center">
          <h3 className="font-montserrat text-xl font-bold mb-3 text-primary tracking-tight">My Commitments</h3>
          <p className="text-text-secondary font-source-serif text-sm leading-relaxed mb-4">
            Sign in to view and manage your volunteer commitments
          </p>
          <Button 
            variant="secondary" 
            className="py-2.5 px-5 rounded-full bg-accent1 hover:bg-accent1/90"
            onClick={onLoginClick}
          >
            Log In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-border/60 p-6 mb-6 transition-all duration-300 hover:shadow-xl">
      <h3 className="font-montserrat text-xl font-bold mb-4 text-primary tracking-tight">My Commitments</h3>
      
      {userCommitments.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-text-secondary font-source-serif text-sm leading-relaxed mb-2">
            You haven't committed to any opportunities yet.
          </p>
          <p className="text-text-secondary font-source-serif text-sm leading-relaxed">
            Browse below and join up to 2 opportunities.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {userCommitments.map((commitment) => (
            <div key={commitment.id} className="border border-border/80 rounded-lg p-4 hover:border-accent1/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="card-category bg-accent2 text-white px-2 py-1 rounded-full font-montserrat text-xs font-semibold tracking-wide uppercase shadow-sm">
                  {commitment.category}
                </span>
                <div className="card-priority flex items-center gap-1.5 font-montserrat text-xs font-medium text-text-tertiary uppercase tracking-wide">
                  <Icon 
                    path={commitment.priority === 'High Priority' ? "M13 10V3L4 14h7v7l9-11h-7z" : "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"} 
                    className={`w-3 h-3 ${commitment.priority === 'High Priority' ? 'text-accent2' : 'text-accent2/80'} transition-all duration-300`} 
                  />
                  {commitment.priority}
                </div>
              </div>
              <h4 className="font-montserrat text-base font-bold text-primary tracking-tight leading-tight">
                {commitment.title}
              </h4>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                  <Icon 
                    path="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                    className="w-3 h-3 text-accent1/70" 
                  />
                  {commitment.date}
                </div>
                <Button 
                  variant="outline" 
                  className="py-1 px-3 rounded-full border-red-400 text-red-500 hover:bg-red-50 text-xs"
                  onClick={() => onDecommit(commitment)}
                >
                  Cancel Commitment
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {userCommitments.length > 0 && userCommitments.length < 2 && (
        <p className="text-text-secondary font-source-serif text-xs leading-relaxed mt-4 text-center">
          You can join {2 - userCommitments.length} more {userCommitments.length === 1 ? 'opportunity' : 'opportunities'}.
        </p>
      )}
    </div>
  );
};

export default MyCommitments;