import React, { useState, useEffect, useRef } from 'react';
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

// Helper function to format date and time for calendar events
const formatDateTimeForCalendar = (date, time) => {
  if (!date) return null;
  
  // Parse the date (assuming format like "2025-06-20")
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return null;
  
  // If time is provided, parse it
  if (time) {
    const timeStr = time.toString().trim();
    let hours = 9; // Default to 9 AM if parsing fails
    let minutes = 0;
    
    // Parse various time formats
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
    if (timeMatch) {
      hours = parseInt(timeMatch[1]);
      minutes = parseInt(timeMatch[2]);
      const period = timeMatch[3];
      
      if (period) {
        // 12-hour format
        if (period.toUpperCase() === 'PM' && hours !== 12) {
          hours += 12;
        } else if (period.toUpperCase() === 'AM' && hours === 12) {
          hours = 0;
        }
      }
    }
    
    dateObj.setHours(hours, minutes, 0, 0);
  } else {
    // Default to 9 AM if no time specified
    dateObj.setHours(9, 0, 0, 0);
  }
  
  return dateObj;
};

// Helper function to add event to Microsoft Calendar
const addToMicrosoftCalendar = (commitment) => {
  const startDate = formatDateTimeForCalendar(commitment.date, commitment.time);
  if (!startDate) return;
  
  // Create end date (2 hours after start)
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
  
  // Format dates for Microsoft Calendar
  const formatMicrosoftDate = (date) => {
    return date.toISOString();
  };
  
  const title = encodeURIComponent(commitment.title);
  const description = encodeURIComponent(
    `${commitment.description || ''}\n\nHosted by: ${commitment.companyName || 'N/A'}\n` +
    `Location: ${commitment.location || 'TBD'}\n` +
    `Contact: ${commitment.companyEmail || 'N/A'}`
  );
  const location = encodeURIComponent(commitment.location || '');
  
  // Create Microsoft Calendar URL (Outlook Web)
  const microsoftCalendarUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${formatMicrosoftDate(startDate)}&enddt=${formatMicrosoftDate(endDate)}&body=${description}&location=${location}`;
  
  // Open in new window
  window.open(microsoftCalendarUrl, '_blank');
};

// Helper function to add event to Google Calendar
const addToGoogleCalendar = (commitment) => {
  const startDate = formatDateTimeForCalendar(commitment.date, commitment.time);
  if (!startDate) return;
  
  // Create end date (2 hours after start)
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
  
  // Format dates for Google Calendar
  const formatGoogleDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const title = encodeURIComponent(commitment.title);
  const description = encodeURIComponent(
    `${commitment.description || ''}\n\nHosted by: ${commitment.companyName || 'N/A'}\n` +
    `Contact: ${commitment.companyEmail || 'N/A'}`
  );
  const location = encodeURIComponent(commitment.location || '');
  
  // Create Google Calendar URL
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}&details=${description}&location=${location}`;
  
  // Open in new window
  window.open(googleCalendarUrl, '_blank');
};

const MyCommitments = ({ currentUser, opportunities, onLoginClick, onDecommit }) => {
  const [userCommitments, setUserCommitments] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollContainerRef = useRef(null);

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
        <>
          {/* Desktop: Grid layout */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-6">
          {userCommitments.map((commitment) => {
            const spotsTotal = commitment.spotsTotal || commitment.totalSpots || 0;
            const spotsFilled = commitment.spotsFilled || 0;
            const progress = spotsTotal === 0 ? 0 : (spotsFilled / spotsTotal) * 100;
            
            return (
              <CommitmentCard 
                key={commitment.id} 
                commitment={commitment} 
                spotsTotal={spotsTotal} 
                spotsFilled={spotsFilled} 
                progress={progress} 
                onDecommit={onDecommit}
              />
            );
          })}
          </div>
        
          {/* Mobile: Swipeable carousel */}
          <div className="lg:hidden relative">
           <div 
              ref={scrollContainerRef}
              className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
              style={{
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch',
                scrollSnapType: 'x mandatory'
              }}
              onScroll={(e) => {
                const container = e.target;
                const scrollLeft = container.scrollLeft;
                const cardWidth = container.clientWidth;
                const newSlide = Math.round(scrollLeft / cardWidth);
                setCurrentSlide(newSlide);
              }}
            >
            {userCommitments.map((commitment, index) => {
               const spotsTotal = commitment.spotsTotal || commitment.totalSpots || 0;
               const spotsFilled = commitment.spotsFilled || commitment.filledSpots || 0;
               const progress = spotsTotal > 0 ? (spotsFilled / spotsTotal) * 100 : 0;
               
               return (
                 <div key={commitment.id} className="flex-none w-full snap-center px-1">
                   <CommitmentCard 
                     commitment={commitment}
                     spotsTotal={spotsTotal}
                     spotsFilled={spotsFilled}
                     progress={progress}
                     onDecommit={onDecommit}
                   />
                 </div>
               );
             })}
          </div>
          
          {/* Swipe indicators */}
           {userCommitments.length > 1 && (
             <div className="flex justify-center gap-2 mt-4">
               {userCommitments.map((_, index) => (
                 <button
                   key={index}
                   className={`w-2 h-2 rounded-full transition-all duration-300 ${
                     index === currentSlide 
                       ? 'bg-accent1 scale-125' 
                       : 'bg-accent1/30 hover:bg-accent1/50'
                   }`}
                   onClick={() => {
                     if (scrollContainerRef.current) {
                       const cardWidth = scrollContainerRef.current.clientWidth;
                       scrollContainerRef.current.scrollTo({
                         left: index * cardWidth,
                         behavior: 'smooth'
                       });
                     }
                   }}
                   aria-label={`Go to commitment ${index + 1}`}
                 />
               ))}
             </div>
           )}
          </div>
        </>
      )}
      
      {userCommitments.length > 0 && userCommitments.length < 2 && (
        <p className="text-text-secondary font-source-serif text-xs leading-relaxed mt-4 text-center">
          You can join {2 - userCommitments.length} more {userCommitments.length === 1 ? 'opportunity' : 'opportunities'}.
        </p>
      )}
    </div>
  );
};

// Extracted CommitmentCard component for reusability
const CommitmentCard = ({ commitment, spotsTotal, spotsFilled, progress, onDecommit }) => {
  // Helper function to format time display
  const formatTime = (time) => {
    if (!time) return time;
    
    // Convert to string and trim
    const timeStr = time.toString().trim();
    
    // If it's already in a good format, return it
    if (timeStr.includes('AM') || timeStr.includes('PM')) {
      return timeStr;
    }
    
    // Try to parse as 24-hour format and convert to 12-hour
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2];
      const period = hours >= 12 ? 'PM' : 'AM';
      
      if (hours > 12) {
        hours -= 12;
      } else if (hours === 0) {
        hours = 12;
      }
      
      return `${hours}:${minutes} ${period}`;
    }
    
    // Return original if parsing fails
    return timeStr;
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
 
 // Calendar integration functions
 const addToMicrosoftCalendar = (commitment) => {
   const startDate = formatDateTimeForCalendar(commitment.date, commitment.time);
   if (!startDate) return;
   
   const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
   const formatMicrosoftDate = (date) => date.toISOString();
   
   const title = encodeURIComponent(commitment.title);
   const description = encodeURIComponent(
     `${commitment.description || ''}\n\nHosted by: ${commitment.companyName || 'N/A'}\n` +
     `Location: ${commitment.location || 'TBD'}\n` +
     `Contact: ${commitment.companyEmail || 'N/A'}`
   );
   const location = encodeURIComponent(commitment.location || '');
   
   const microsoftCalendarUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${formatMicrosoftDate(startDate)}&enddt=${formatMicrosoftDate(endDate)}&body=${description}&location=${location}`;
   window.open(microsoftCalendarUrl, '_blank');
 };
 
 const addToGoogleCalendar = (commitment) => {
   const startDate = formatDateTimeForCalendar(commitment.date, commitment.time);
   if (!startDate) return;
   
   const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
   const formatGoogleDate = (date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
   
   const title = encodeURIComponent(commitment.title);
   const description = encodeURIComponent(
     `${commitment.description || ''}\n\nHosted by: ${commitment.companyName || 'N/A'}\n` +
     `Contact: ${commitment.companyEmail || 'N/A'}`
   );
   const location = encodeURIComponent(commitment.location || '');
   
   const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}&details=${description}&location=${location}`;
   window.open(googleCalendarUrl, '_blank');
 };
 
 const formatDateTimeForCalendar = (date, time) => {
   if (!date) return null;
   const dateObj = new Date(date);
   if (isNaN(dateObj.getTime())) return null;
   
   if (time) {
     const timeStr = time.toString().trim();
     let hours = 9;
     let minutes = 0;
     
     const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
     if (timeMatch) {
       hours = parseInt(timeMatch[1]);
       minutes = parseInt(timeMatch[2]);
       const period = timeMatch[3];
       
       if (period) {
         if (period.toUpperCase() === 'PM' && hours !== 12) {
           hours += 12;
         } else if (period.toUpperCase() === 'AM' && hours === 12) {
           hours = 0;
         }
       }
     }
     
     dateObj.setHours(hours, minutes, 0, 0);
   } else {
     dateObj.setHours(9, 0, 0, 0);
   }
   
   return dateObj;
 };

  return (
    <div className="bg-gradient-to-br from-white to-accent1/5 border border-accent1/20 rounded-xl p-6 hover:border-accent1/40 hover:shadow-lg transition-all duration-300">
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
                
                {/* Calendar Integration */}
                <div className="bg-white/60 border border-accent1/20 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon 
                      path="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                      className="w-4 h-4 text-accent1" 
                    />
                    <span className="font-montserrat font-semibold text-primary text-sm">Add to Calendar</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      className="py-1.5 px-3 rounded-full border-accent1/30 text-accent1 hover:bg-accent1/10 hover:border-accent1 text-xs font-medium transition-all duration-300 flex items-center gap-1.5"
                      onClick={() => addToMicrosoftCalendar({
                        title: commitment.title,
                        description: commitment.description,
                        date: commitment.date,
                        time: commitment.time,
                        location: commitment.location,
                        companyName: commitment.companyName,
                        companyEmail: commitment.companyEmail
                      })}
                    >
                      <Icon path="M21.53 4.306v15.363H2.47V4.306h19.06zM20.61 5.226H3.39v13.523h17.22V5.226z M5.32 7.147h2.842v1.84H5.32v-1.84z M9.003 7.147h9.677v.613H9.003v-.613z M5.32 10.067h2.842v1.84H5.32v-1.84z M9.003 10.067h9.677v.613H9.003v-.613z M5.32 12.987h2.842v1.84H5.32v-1.84z M9.003 12.987h9.677v.613H9.003v-.613z M5.32 15.907h2.842v1.84H5.32v-1.84z M9.003 15.907h9.677v.613H9.003v-.613z" className="w-3 h-3" />
                      Microsoft Calendar
                    </Button>
                    <Button 
                      variant="outline" 
                      className="py-1.5 px-3 rounded-full border-accent1/30 text-accent1 hover:bg-accent1/10 hover:border-accent1 text-xs font-medium transition-all duration-300 flex items-center gap-1.5"
                      onClick={() => addToGoogleCalendar({
                        title: commitment.title,
                        description: commitment.description,
                        date: commitment.date,
                        time: commitment.time,
                        location: commitment.location,
                        companyName: commitment.companyName,
                        companyEmail: commitment.companyEmail
                      })}
                    >
                      <Icon path="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" className="w-3 h-3" />
                      Google Calendar
                    </Button>
                  </div>
                </div>
                
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
 };
 
 export default MyCommitments;