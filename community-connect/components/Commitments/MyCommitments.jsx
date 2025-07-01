import React, { useState, useEffect, useRef } from 'react';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import ChatModal from '../Modal/ChatModal'; // Import ChatModal

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

// Helper function to ensure opportunity has proper ID format
const ensureOpportunityId = (opportunity) => {
  if (!opportunity) return null;
  
  // Create a copy to avoid modifying the original object
  const opportunityCopy = { ...opportunity };
  
  // Ensure the opportunity has both id and _id properties for compatibility
  if (!opportunityCopy._id && opportunityCopy.id) {
    opportunityCopy._id = opportunityCopy.id;
    console.log('Added _id property to opportunity:', opportunityCopy.id);
  }
  
  if (!opportunityCopy.id && opportunityCopy._id) {
    opportunityCopy.id = opportunityCopy._id.toString ? opportunityCopy._id.toString() : opportunityCopy._id;
    console.log('Added id property to opportunity:', opportunityCopy._id);
  }
  
  // Verify both properties exist now
  if (!opportunityCopy.id || !opportunityCopy._id) {
    console.error('Failed to ensure ID properties for opportunity:', opportunity);
  }
  
  return opportunityCopy;
};

const MyCommitments = ({ currentUser, opportunities, onLoginClick, onDecommit }) => {
  const [userCommitments, setUserCommitments] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollContainerRef = useRef(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedOpportunityForChat, setSelectedOpportunityForChat] = useState(null);

  const openChatModal = (opportunity) => {
    setSelectedOpportunityForChat(opportunity);
    setIsChatModalOpen(true);
  };

  useEffect(() => {
    if (currentUser && currentUser.commitments && opportunities.length > 0) {
      // Find the full opportunity objects that match the user's commitment IDs
      const userCommitmentObjects = currentUser.commitments
        .map(commitmentId => {
          // Find opportunity by either id or _id to handle both formats
          const opportunity = opportunities.find(opp => 
            opp.id === commitmentId || 
            (opp._id && opp._id.toString() === commitmentId)
          );
          // Ensure the opportunity has proper ID format
          return opportunity ? ensureOpportunityId(opportunity) : null;
        })
        .filter(Boolean); // Filter out any undefined values
      
      console.log('User commitments with ensured IDs:', userCommitmentObjects);
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
                onOpenChat={openChatModal} // Pass chat handler
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
                      onOpenChat={openChatModal} // Pass chat handler
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

      {/* Chat Modal */}
      {selectedOpportunityForChat && currentUser && (
        <ChatModal
          isOpen={isChatModalOpen}
          onClose={() => {
            setIsChatModalOpen(false);
            setSelectedOpportunityForChat(null);
          }}
          opportunity={selectedOpportunityForChat}
          currentUser={currentUser} // Pass the logged-in user
          isCompany={false} // User is not a company here
        />
      )}
    </div>
  );
};

// Extracted CommitmentCard component for reusability
const CommitmentCard = ({ commitment, spotsTotal, spotsFilled, progress, onDecommit, onOpenChat }) => {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50/30 rounded-xl border border-border/40 p-5 transition-all duration-300 hover:shadow-lg hover:border-accent1/30 hover:-translate-y-0.5">
      {/* Header with Title and Company */}
      <div className="mb-4">
        <h4 className="font-montserrat text-lg font-bold text-primary mb-2 leading-tight">
          {commitment.title}
        </h4>
        
        {/* Company Information */}
        {(commitment.companyName || commitment.companyEmail || commitment.companyPhone || commitment.companyWebsite) && (
          <div className="bg-white/60 border border-accent1/20 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon 
                path="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-1 9.25h-.566c-1.5 0-2.909-.62-3.859-1.708L7.5 12.5l-1.286 1.542c-.95 1.088-2.359 1.708-3.859 1.708H1.5v-3.25h.566c.78 0 1.518-.32 2.05-.895L6.5 9.5l-2.384-2.105A2.75 2.75 0 012.066 6.5H1.5V3.25h1.066c1.5 0 2.909.62 3.859 1.708L7.5 6.5l1.286-1.542c.95-1.088 2.359-1.708 3.859-1.708H13.5v3.25h-.566c-.78 0-1.518.32-2.05.895L8.5 9.5l2.384 2.105c.532.575 1.27.895 2.05.895H13.5v3.25z" 
                className="w-4 h-4 text-accent1" 
              />
              <span className="font-montserrat font-semibold text-primary text-sm">Hosted by</span>
            </div>
            <div className="space-y-1.5">
              {commitment.companyName && (
                <div className="flex items-center gap-1.5 text-sm font-medium text-text-secondary">
                  <Icon path="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" className="w-3 h-3 text-accent1/70" />
                  <span className="font-montserrat font-semibold text-primary">{commitment.companyName}</span>
                </div>
              )}
              {commitment.companyEmail && (
                <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <Icon path="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" className="w-3 h-3 text-accent1/70" />
                  <a href={`mailto:${commitment.companyEmail}`} className="hover:text-accent1 transition-colors">
                    {commitment.companyEmail}
                  </a>
                </div>
              )}
              {commitment.companyPhone && (
                <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <Icon path="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" className="w-3 h-3 text-accent1/70" />
                  <a href={`tel:${commitment.companyPhone}`} className="hover:text-accent1 transition-colors">
                    {formatPhoneNumber(commitment.companyPhone)}
                  </a>
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
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(commitment.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-accent1"
                >
                  {commitment.location}
                </a>
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
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-5">
        <Button 
          variant="outline" 
          className="w-full sm:w-auto py-2 px-4 rounded-full border-red-400 text-red-500 hover:bg-red-50 hover:border-red-500 text-sm font-medium transition-all duration-300"
          onClick={() => onDecommit(commitment)}
        >
          <Icon path="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" className="w-4 h-4 mr-2" />
          Cancel Commitment
        </Button>
        <Button
          variant="primary"
          className="w-full sm:w-auto py-2 px-4 rounded-full bg-accent1 hover:bg-accent1-dark text-sm font-medium transition-all duration-300"
          onClick={() => onOpenChat(commitment)}
        >
          <Icon path="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" className="w-4 h-4 mr-2" />
          Open Chat
        </Button>
      </div>
    </div>
  );
};

export default MyCommitments;