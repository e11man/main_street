import React, { forwardRef } from 'react';
import Icon from '../ui/Icon';
import Button from '../ui/Button';
import ProgressBar from './ProgressBar';

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

// Helper function to format date as month and day only
const formatDateShort = (dateStr) => {
  if (!dateStr) return dateStr;
  
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  } catch (error) {
    return dateStr;
  }
};

// Function to dynamically assign priority based on how close the date is
const getPriority = (dateStr) => {
  if (!dateStr) return 'Low Priority';
  try {
    const today = new Date(); // Use actual current date
    const oppDate = new Date(dateStr);
    
    // Check if date is valid
    if (isNaN(oppDate.getTime())) return 'Low Priority';
    
    const diffDays = Math.ceil((oppDate - today) / (1000 * 60 * 60 * 24));
    if (diffDays <= 3) return 'High Priority';
    if (diffDays <= 7) return 'Medium Priority';
    return 'Low Priority';
  } catch (error) {
    return 'Low Priority';
  }
};

const OpportunityCard = forwardRef(({ opportunity, onJoinClick, onLearnMoreClick, onGroupSignupClick, currentUser }, ref) => {
  // Early return if opportunity is null or undefined
  if (!opportunity) {
    return null;
  }

  // Handle both spotsTotal and totalSpots fields for backward compatibility
  const spotsTotal = opportunity.spotsTotal || opportunity.totalSpots || 0;
  const spotsFilled = opportunity.spotsFilled || 0;
  const progress = spotsTotal === 0 ? 0 : (spotsFilled / spotsTotal) * 100;

  // Get priority based on the opportunity date
  const priority = getPriority(opportunity.date);

  // Check if current user is PA
  const isPA = currentUser?.isPA || currentUser?.isAdmin;

  return (
    <div
      ref={ref}
      className="opportunity-card bg-white rounded-xl md:rounded-2xl border border-border/80 overflow-hidden shadow-md h-full flex flex-col
                 transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]
                 hover:translate-y-[-8px] hover:scale-[1.02] hover:shadow-xl hover:border-accent1/50 group"
    >
      <div className="p-4 md:p-6 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-4">
          <span className="card-category bg-accent2 text-white px-3 py-1.5 rounded-full font-montserrat text-xs font-semibold tracking-wide uppercase shadow-sm">
            {opportunity?.category || 'Event'}
          </span>
          <div className="card-priority flex items-center gap-1.5 font-montserrat text-xs font-medium text-text-tertiary uppercase tracking-wide transition-all duration-300 group-hover:text-accent1">
            <Icon 
              path={priority === 'High Priority' ? "M13 10V3L4 14h7v7l9-11h-7z" : "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"} 
              className={`w-4 h-4 ${priority === 'High Priority' ? 'text-accent2' : 'text-accent2/80'} transition-all duration-300`} 
            />
            {priority}
          </div>
        </div>
        
        <h3 className="font-montserrat text-lg md:text-xl font-bold mb-3 text-primary tracking-tight leading-tight group-hover:text-primary-light transition-all duration-300">
          {opportunity?.title || 'Event Title'}
        </h3>
        
        <p className="text-text-secondary font-source-serif text-sm leading-relaxed mb-4 line-clamp-3">
          {opportunity?.description || 'Event description'}
        </p>
        
        {/* Company Information */}
        {opportunity?.companyName && (
          <div className="bg-accent1/5 border border-accent1/20 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon 
                path="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
                className="w-4 h-4 text-accent1" 
              />
              <span className="font-montserrat font-semibold text-primary text-sm">Hosted by</span>
            </div>
            <p className="font-montserrat font-bold text-accent1 text-sm">{opportunity.companyName}</p>
          </div>
        )}
        
        {/* Essential Details Section - Simplified */}
        <div className="bg-gradient-to-r from-accent1/5 to-accent2/5 border border-accent1/20 rounded-lg p-4 mb-4">
          <h4 className="font-montserrat font-bold text-primary text-sm mb-3 flex items-center gap-2">
            <Icon path="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-4 h-4 text-accent1" />
            Key Details
          </h4>
          
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-sm font-medium text-text-secondary">
              <Icon 
                path="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                className="w-4 h-4 text-accent1/70" 
              />
              <span className="font-semibold text-accent1">Date:</span> {formatDateShort(opportunity?.date)}
            </div>
            
            {opportunity?.time && (
              <div className="flex items-center gap-1.5 text-sm font-medium text-text-secondary">
                <Icon 
                  path="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                  className="w-4 h-4 text-accent1/70" 
                />
                <span className="font-semibold text-accent1">Start:</span> {formatTime(opportunity.time)}
              </div>
            )}
            
            {opportunity?.departureTime && (
              <div className="flex items-center gap-1.5 text-sm font-medium text-text-secondary">
                <Icon 
                  path="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                  className="w-4 h-4 text-accent1/70" 
                />
                <span className="font-semibold text-accent1">End:</span> {formatTime(opportunity.departureTime)}
              </div>
            )}
            
            {opportunity?.location && (
              <div className="flex items-center gap-1.5 text-sm font-medium text-text-secondary">
                <Icon 
                  path="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                  className="w-4 h-4 text-accent1/70" 
                />
                <span className="font-semibold text-accent1">Location:</span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(opportunity.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-accent1 transition-colors truncate"
                >
                  {opportunity.location}
                </a>
              </div>
            )}
          </div>
        </div>
        
        <div className="card-spots bg-surface/70 p-4 rounded-lg border-2 border-accent1/20 w-full flex flex-col gap-3 transition-all duration-300 group-hover:border-accent1/40 group-hover:shadow-md">
          <div className="flex items-center gap-2 font-montserrat font-bold text-sm text-primary">
            <div className="bg-accent1/10 p-1.5 rounded-full">
              <Icon 
                path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
                className="w-5 h-5 text-accent1 transition-all duration-300" 
              />
            </div>
            <span className="text-lg text-accent1 font-bold">{spotsFilled}</span>{spotsTotal > 0 && ` / ${spotsTotal}`}
          </div>
          <ProgressBar progress={progress} />
          <div className="font-montserrat text-xs font-medium text-accent1/80 uppercase tracking-wider">
            Volunteers Signed Up
          </div>
        </div>
        
        <div className="flex justify-center mt-auto gap-2 pt-4">
          <Button 
            variant="secondary" 
            className="py-2.5 px-6 md:px-8 rounded-full bg-accent1 hover:bg-accent1/90 flex-1 max-w-[180px] text-sm md:text-base"
            onClick={() => onJoinClick(opportunity)}
          >
            Join Now
          </Button>
          {isPA && onGroupSignupClick && (
            <Button 
              variant="secondary" 
              className="py-2.5 px-3 md:px-4 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 text-sm"
              onClick={() => onGroupSignupClick(opportunity)}
              title="Sign up multiple people"
            >
              <Icon 
                path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
                className="w-4 h-4" 
              />
              <span className="hidden sm:inline">Group</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});

OpportunityCard.displayName = 'OpportunityCard';

export default OpportunityCard;
