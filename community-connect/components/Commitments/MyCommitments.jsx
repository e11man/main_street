import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Icon from '../ui/Icon';

// Helper function to format time from 24-hour to 12-hour format
const formatTime = (time) => {
  if (!time) return time;
  
  // Handle various time formats
  const timeStr = time.toString().trim();
  
  // If already in 12-hour format, return as is
  if (timeStr.includes('AM') || timeStr.includes('PM') || timeStr.includes('am') || timeStr.includes('pm')) {
    return timeStr;
  }
  
  // Parse 24-hour format (e.g., "13:30", "1:30", "13:30:00")
  const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!timeMatch) return time; // Return original if format not recognized
  
  let hours = parseInt(timeMatch[1]);
  const minutes = timeMatch[2];
  
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; // Convert to 12-hour format
  
  return `${hours}:${minutes} ${period}`;
};

// Helper function to format phone number with parentheses and dashes
const formatPhoneNumber = (phone) => {
  if (!phone) return phone;
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX for 10-digit numbers
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  // Format as +X (XXX) XXX-XXXX for 11-digit numbers starting with 1
  if (digits.length === 11 && digits[0] === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  
  // Return original if format not recognized
  return phone;
};

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
        <div className="space-y-6">
          {userCommitments.map((commitment) => {
            const spotsTotal = commitment.spotsTotal || commitment.totalSpots || 0;
            const spotsFilled = commitment.spotsFilled || 0;
            const progress = spotsTotal === 0 ? 0 : (spotsFilled / spotsTotal) * 100;
            
            return (
              <div key={commitment.id} className="bg-gradient-to-br from-white to-accent1/5 border border-accent1/20 rounded-xl p-6 hover:border-accent1/40 hover:shadow-lg transition-all duration-300">
                {/* Header with category and priority */}
                <div className="flex items-center justify-between mb-4">
                  <span className="card-category bg-accent2 text-white px-3 py-1.5 rounded-full font-montserrat text-xs font-semibold tracking-wide uppercase shadow-sm">
                    {commitment.category}
                  </span>
                  <div className="card-priority flex items-center gap-1.5 font-montserrat text-xs font-medium text-text-tertiary uppercase tracking-wide">
                    <Icon 
                      path={commitment.priority === 'High Priority' ? "M13 10V3L4 14h7v7l9-11h-7z" : "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"} 
                      className={`w-4 h-4 ${commitment.priority === 'High Priority' ? 'text-accent2' : 'text-accent2/80'} transition-all duration-300`} 
                    />
                    {commitment.priority}
                  </div>
                </div>
                
                {/* Title */}
                <h4 className="font-montserrat text-lg font-bold text-primary tracking-tight leading-tight mb-3">
                  {commitment.title}
                </h4>
                
                {/* Description */}
                {commitment.description && (
                  <p className="text-text-secondary font-source-serif text-sm leading-relaxed mb-4">
                    {commitment.description}
                  </p>
                )}
                
                {/* Company Information */}
                {(commitment.companyName || commitment.companyEmail || commitment.companyPhone || commitment.companyWebsite) && (
                  <div className="bg-accent1/5 border border-accent1/20 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon 
                        path="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
                        className="w-4 h-4 text-accent1" 
                      />
                      <span className="font-montserrat font-semibold text-primary text-sm">Hosted by</span>
                    </div>
                    {commitment.companyName && (
                      <p className="font-montserrat font-bold text-accent1 text-sm mb-1">{commitment.companyName}</p>
                    )}
                    <div className="space-y-1">
                      {commitment.companyEmail && (
                        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                          <Icon path="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" className="w-3 h-3 text-accent1/70" />
                          {commitment.companyEmail}
                        </div>
                      )}
                      {commitment.companyPhone && (
                        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                          <Icon path="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" className="w-3 h-3 text-accent1/70" />
                          {formatPhoneNumber(commitment.companyPhone)}
                        </div>
                      )}
                      {commitment.companyWebsite && (
                        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                          <Icon path="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" className="w-3 h-3 text-accent1/70" />
                          <a href={commitment.companyWebsite.startsWith('http') ? commitment.companyWebsite : `https://${commitment.companyWebsite}`} target="_blank" rel="noopener noreferrer" className="hover:text-accent1 transition-colors">
                            {commitment.companyWebsite}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Event Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  {/* Date and Time */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                      <Icon 
                        path="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                        className="w-4 h-4 text-accent1/70" 
                      />
                      <span className="font-montserrat font-semibold text-primary">Date:</span>
                      {commitment.date}
                    </div>
                    {commitment.time && (
                      <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                        <Icon 
                          path="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                          className="w-4 h-4 text-accent1/70" 
                        />
                        <span className="font-montserrat font-semibold text-primary">Time:</span>
                        {formatTime(commitment.time)}
                      </div>
                    )}
                  </div>
                  
                  {/* Location */}
                  {commitment.location && (
                    <div className="flex items-start gap-2 text-sm font-medium text-text-secondary">
                      <Icon 
                        path="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                        className="w-4 h-4 text-accent1/70 mt-0.5 flex-shrink-0" 
                      />
                      <div>
                        <span className="font-montserrat font-semibold text-primary block">Location:</span>
                        <span className="text-text-secondary">{commitment.location}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Volunteer Progress */}
                {spotsTotal > 0 && (
                  <div className="bg-white/60 border border-accent1/20 rounded-lg p-4 mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon 
                          path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
                          className="w-4 h-4 text-accent1" 
                        />
                        <span className="font-montserrat font-semibold text-primary text-sm">Volunteer Progress</span>
                      </div>
                      <span className="font-montserrat font-bold text-accent1">
                        {spotsFilled} / {spotsTotal}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-accent1 to-accent2 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.max(progress, 3)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-text-secondary mt-1 font-source-serif">
                      {spotsTotal - spotsFilled} spots remaining
                    </p>
                  </div>
                )}
                
                {/* Action Button */}
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    className="py-2 px-4 rounded-full border-red-400 text-red-500 hover:bg-red-50 hover:border-red-500 text-sm font-medium transition-all duration-300"
                    onClick={() => onDecommit(commitment)}
                  >
                    Cancel Commitment
                  </Button>
                </div>
              </div>
            );
          })}
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