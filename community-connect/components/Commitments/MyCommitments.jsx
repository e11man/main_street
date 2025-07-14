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

const MyCommitments = ({ currentUser, opportunities, onLoginClick, onDecommit, content }) => {
  const getContent = (key, defaultValue = '') => {
    return content?.[key] || defaultValue;
  };
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
          <h3 className="font-montserrat text-xl font-bold mb-3 text-primary tracking-tight">{getContent('commitments.title', 'My Commitments')}</h3>
          <p className="text-text-secondary font-source-serif text-sm leading-relaxed mb-4">
            {getContent('commitments.subtitle', 'Sign in to view and manage your volunteer commitments')}
          </p>
          <Button 
            variant="secondary" 
            className="py-3 px-6 rounded-full bg-accent1 hover:bg-accent1/90 font-semibold text-base min-w-[120px] transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={onLoginClick}
          >
            {getContent('commitments.login_button', 'Log In')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-border/60 p-6 mb-6 transition-all duration-300 hover:shadow-xl">
      <h3 className="font-montserrat text-xl font-bold mb-4 text-primary tracking-tight">{getContent('commitments.title', 'My Commitments')}</h3>
      
      {userCommitments.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-text-secondary font-source-serif text-sm leading-relaxed mb-2">
            You haven&apos;t committed to any opportunities yet.
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

      {/* Dorm Management Section */}
      <DormManagement currentUser={currentUser} onDormUpdate={(updatedUser) => {
        // Update local user data with the updated user from dorm change
        // This assumes the updated user object contains the latest data
        setUserCommitments(prevCommitments => 
          prevCommitments.map(commitment => {
            if (commitment.userId === updatedUser._id) {
              return { ...commitment, dorm: updatedUser.dorm };
            }
            return commitment;
          })
        );
      }} />

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
        
        {/* Event Details - Mobile Optimized */}
        <div className="space-y-3 mb-5">
          {/* Date and Time */}
          <div className="bg-white/60 border border-accent1/20 rounded-lg p-3">
            <h5 className="font-montserrat font-bold text-primary text-sm mb-2 flex items-center gap-2">
              <Icon path="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" className="w-4 h-4 text-accent1" />
              Event Schedule
            </h5>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <span className="font-semibold text-accent1 min-w-[60px]">Date:</span>
                {formatDateShort(commitment.date)}
              </div>
              {commitment.arrivalTime && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <span className="font-semibold text-accent1 min-w-[60px]">Arrive:</span>
                  {formatTime(commitment.arrivalTime)}
                </div>
              )}
              {commitment.time && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <span className="font-semibold text-accent1 min-w-[60px]">Start:</span>
                  {formatTime(commitment.time)}
                </div>
              )}
              {commitment.departureTime && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <span className="font-semibold text-accent1 min-w-[60px]">End:</span>
                  {formatTime(commitment.departureTime)}
                </div>
              )}
            </div>
          </div>
          
          {/* Location and Meeting Details */}
          {commitment.location && (
            <div className="bg-white/60 border border-accent1/20 rounded-lg p-3">
              <h5 className="font-montserrat font-bold text-primary text-sm mb-2 flex items-center gap-2">
                <Icon path="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" className="w-4 h-4 text-accent1" />
                Location & Meeting Info
              </h5>
              <div className="space-y-2">
                <div className="text-sm text-text-secondary">
                  <span className="font-semibold text-accent1 block mb-1">Address:</span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(commitment.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-accent1 break-words"
                  >
                    {commitment.location}
                  </a>
                </div>
                {commitment.meetingPoint && (
                  <div className="text-sm text-text-secondary">
                    <span className="font-semibold text-accent1 block mb-1">Meet at:</span>
                    <span className="break-words">{commitment.meetingPoint}</span>
                  </div>
                )}
                {commitment.contactPerson && (
                  <div className="text-sm text-text-secondary">
                    <span className="font-semibold text-accent1 block mb-1">Ask for:</span>
                    <span>{commitment.contactPerson}</span>
                  </div>
                )}
                {commitment.contactPhone && (
                  <div className="text-sm text-text-secondary">
                    <span className="font-semibold text-accent1 block mb-1">Contact:</span>
                    <a href={`tel:${commitment.contactPhone}`} className="underline hover:text-accent1">
                      {formatPhoneNumber(commitment.contactPhone)}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Additional Information */}
          {(commitment.whatToBring || commitment.specialInstructions) && (
            <div className="bg-white/60 border border-accent2/20 rounded-lg p-3">
              <h5 className="font-montserrat font-bold text-primary text-sm mb-2 flex items-center gap-2">
                <Icon path="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-4 h-4 text-accent2" />
                Important Details
              </h5>
              <div className="space-y-3">
                {commitment.whatToBring && (
                  <div className="text-sm text-text-secondary">
                    <span className="font-semibold text-accent2 block mb-1">What to bring:</span>
                    <p className="break-words leading-relaxed">{commitment.whatToBring}</p>
                  </div>
                )}
                {commitment.specialInstructions && (
                  <div className="text-sm text-text-secondary">
                    <span className="font-semibold text-accent2 block mb-1">Special instructions:</span>
                    <p className="break-words leading-relaxed">{commitment.specialInstructions}</p>
                  </div>
                )}
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
                  path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5 15.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9 19.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
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
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-5">
        <Button 
          variant="outline" 
          className="w-full sm:w-auto sm:flex-1 py-2.5 px-3 sm:px-4 rounded-full border-red-400 text-red-500 hover:bg-red-50 hover:border-red-500 text-xs sm:text-sm font-medium transition-all duration-300 flex items-center justify-center min-h-[44px] min-w-0"
          onClick={() => onDecommit(commitment)}
        >
          <Icon path="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
          <span className="truncate whitespace-nowrap">Cancel</span>
        </Button>
        <Button
          variant="primary"
          className="w-full sm:w-auto sm:flex-1 py-2.5 px-3 sm:px-4 rounded-full bg-accent1 hover:bg-accent1-dark text-xs sm:text-sm font-medium transition-all duration-300 flex items-center justify-center min-h-[44px] min-w-0"
          onClick={() => onOpenChat(commitment)}
        >
          <Icon path="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
          <span className="truncate whitespace-nowrap">Chat</span>
        </Button>
      </div>
    </div>
  );
};

// Dorm Management Component
const DormManagement = ({ currentUser, onDormUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDorm, setSelectedDorm] = useState(currentUser?.dorm || '');
  const [selectedWing, setSelectedWing] = useState(currentUser?.wing || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  
  // Password update states
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  // Organized dorm data with cascading structure
  const DORM_DATA = {
    "Away From Campus": ["Upland (abroad)"],
    "Bergwall Hall": ["1st Bergwall", "2nd Bergwall", "3rd Bergwall", "4th Bergwall"],
    "Breuninger Hall": ["1st Breuninger", "2nd Breuninger", "3rd Breuninger"],
    "Brolund Hall": ["Residential Village Wing 6"],
    "Campbell Hall": ["Univ Apts-Campbell Hall-1st Fl", "Univ Apts-Campbell Hall-2nd Fl"],
    "Chiu Hall": ["Residential Village Wing 1"],
    "Commuter": ["Commuter Married", "Commuter Single"],
    "Corner House": ["Corner House Wing"],
    "Delta Apts": ["Delta Wing"],
    "English Hall": [
      "1st North English", "1st South English", "2nd Center English", 
      "2nd North English", "2nd South English", "3rd Center English", 
      "3rd North English", "3rd South English", "English Hall - Cellar"
    ],
    "Flanigan Hall": ["Residential Village Wing 3"],
    "Gerig Hall": ["2nd Gerig", "3rd Gerig", "4th Gerig"],
    "Gygi Hall": ["Residential Village Wing 2"],
    "Haven on 2nd": ["Second South Street", "West Spencer Avenue"],
    "Jacobsen Hall": ["Residential Village Wing 7"],
    "Kerlin Hall": ["Residential Village Wing 5"],
    "Off-Campus Housing": [],
    "Olson Hall": [
      "1st East Olson", "1st West Olson", "2nd Center Olson", 
      "2nd East Olson", "2nd West Olson", "3rd Center Olson", 
      "3rd East Olson", "3rd West Olson"
    ],
    "Robbins Hall": ["Residential Village Wing 4"],
    "Sammy Morris Hall": [
      "1st Morris Center", "1st Morris North", "1st Morris South", 
      "2nd Morris Center", "2nd Morris North", "2nd Morris South", 
      "3rd Morris Center", "3rd Morris North", "3rd Morris South", 
      "4th Morris Center", "4th Morris North", "4th Morris South"
    ],
    "Swallow Robin Hall": ["1st Swallow", "2nd Swallow", "3rd Swallow"],
    "The Flats Apartments": ["Casa Wing"],
    "Wengatz Hall": [
      "1st East Wengatz", "1st West Wengatz", "2nd Center Wengatz", 
      "2nd East Wengatz", "2nd West Wengatz", "3rd Center Wengatz", 
      "3rd East Wengatz", "3rd West Wengatz"
    ],
    "Wolgemuth Hall": [
      "Univ Apt-Wolgemuth Hall-1st Fl", "Univ Apt-Wolgemuth Hall-2nd Fl", 
      "Univ Apt-Wolgemuth Hall-3rd Fl"
    ]
  };

  // Get available wings for selected dorm
  const getAvailableWings = () => {
    if (!selectedDorm || !DORM_DATA[selectedDorm]) return [];
    return DORM_DATA[selectedDorm];
  };

  const handleDormUpdate = async () => {
    if (selectedDorm === currentUser.dorm && selectedWing === currentUser.wing) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    setUpdateMessage('');

    try {
      const response = await fetch(`/api/admin/users/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...currentUser,
          dorm: selectedDorm,
          wing: selectedWing
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUpdateMessage('Dorm/Wing updated successfully!');
        setIsEditing(false);
        if (onDormUpdate) onDormUpdate(updatedUser); // Live update parent
      } else {
        throw new Error('Failed to update dorm/wing');
      }
    } catch (error) {
      console.error('Error updating dorm/wing:', error);
      setUpdateMessage('Failed to update dorm/wing. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setSelectedDorm(currentUser?.dorm || '');
    setSelectedWing(currentUser?.wing || '');
    setIsEditing(false);
    setUpdateMessage('');
  };

  const handleDormChange = (e) => {
    setSelectedDorm(e.target.value);
    setSelectedWing(''); // Reset wing when dorm changes
  };

  // Password update functions
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordMessage('All fields are required.');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage('New passwords do not match.');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordMessage('New password must be at least 6 characters long.');
      return;
    }
    
    setIsUpdatingPassword(true);
    setPasswordMessage('');
    
    try {
      const response = await fetch('/api/users/update-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser._id.toString ? currentUser._id.toString() : currentUser._id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setPasswordMessage('Password updated successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          setIsPasswordModalOpen(false);
          setPasswordMessage('');
        }, 2000);
      } else {
        setPasswordMessage(result.error || 'Failed to update password.');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordMessage('Failed to update password. Please try again.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handlePasswordModalClose = () => {
    setIsPasswordModalOpen(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordMessage('');
  };

  return (
    <div className="mt-6 pt-4 border-t border-border/30">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
        <h4 className="font-montserrat text-lg font-bold text-primary">My Dorm/Wing</h4>
        {!isEditing && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-accent1 text-white font-semibold text-xs shadow hover:bg-accent1/90 transition-colors duration-200"
              aria-label="Change Dorm/Wing"
            >
              <Icon path="M12 4v16m8-8H4" className="w-4 h-4" /> Change Dorm
            </button>
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-600 text-white font-semibold text-xs shadow hover:bg-blue-700 transition-colors duration-200"
              aria-label="Update Password"
            >
              <Icon path="M12 1l3 3-3 3m0-6H9a4 4 0 000 8h3" className="w-4 h-4" /> Update Password
            </button>
          </div>
        )}
      </div>

      {updateMessage && (
        <div className={`mb-3 p-2 rounded text-sm ${
          updateMessage.includes('successfully') 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {updateMessage}
        </div>
      )}

      {isEditing ? (
        <div className="space-y-3">
          <div>
            <label className="block font-montserrat font-semibold text-sm text-text-primary mb-2">
              Select Your Dorm/Building (optional)
            </label>
            <select
              value={selectedDorm}
              onChange={handleDormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent1 focus:border-transparent transition-all duration-200 bg-white"
              disabled={isUpdating}
            >
              <option value="">Choose your dorm/building...</option>
              {Object.keys(DORM_DATA).sort().map((dorm) => (
                <option key={dorm} value={dorm}>
                  {dorm}
                </option>
              ))}
            </select>
          </div>
          
          {selectedDorm && getAvailableWings().length > 0 && (
            <div>
              <label className="block font-montserrat font-semibold text-sm text-text-primary mb-2">
                Select Your Specific Wing/Floor
              </label>
              <select
                value={selectedWing}
                onChange={(e) => setSelectedWing(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent1 focus:border-transparent transition-all duration-200 bg-white"
                disabled={isUpdating}
              >
                <option value="">Choose your wing/floor...</option>
                {getAvailableWings().map((wing) => (
                  <option key={wing} value={wing}>
                    {wing}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              onClick={handleDormUpdate}
              disabled={isUpdating}
              variant="secondary"
              className="px-4 py-2 text-sm"
            >
              {isUpdating ? 'Updating...' : 'Update'}
            </Button>
            <Button
              onClick={handleCancel}
              disabled={isUpdating}
              variant="outline"
              className="px-4 py-2 text-sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-text-secondary font-source-serif text-sm">
            {currentUser?.dorm ? (
              <>
                {currentUser.dorm}
                {currentUser.wing && ` - ${currentUser.wing}`}
              </>
            ) : (
              'No dorm/wing selected'
            )}
          </span>
        </div>
      )}
      
      {/* Password Update Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-primary font-montserrat">Update Password</h3>
                <button
                  onClick={handlePasswordModalClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close modal"
                >
                  <Icon path="M6 18L18 6M6 6l12 12" className="w-6 h-6" />
                </button>
              </div>
              
              {passwordMessage && (
                <div className={`mb-4 p-3 rounded text-sm ${
                  passwordMessage.includes('successfully') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {passwordMessage}
                </div>
              )}
              
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <label className="block font-montserrat font-semibold text-sm text-text-primary mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your current password"
                    disabled={isUpdatingPassword}
                    required
                  />
                </div>
                
                <div>
                  <label className="block font-montserrat font-semibold text-sm text-text-primary mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your new password"
                    disabled={isUpdatingPassword}
                    minLength="6"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
                </div>
                
                <div>
                  <label className="block font-montserrat font-semibold text-sm text-text-primary mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Confirm your new password"
                    disabled={isUpdatingPassword}
                    required
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold"
                  >
                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                  </Button>
                  <Button
                    type="button"
                    onClick={handlePasswordModalClose}
                    disabled={isUpdatingPassword}
                    variant="outline"
                    className="flex-1 px-4 py-2 text-sm"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCommitments;