import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from '../components/Header/Header.jsx';
import HeroSection from '../components/Hero/HeroSection.jsx';
import FloatingCardSection from '../components/FloatingCard/FloatingCardSection.jsx';
import SearchSection from '../components/SearchAndFilter/SearchSection.jsx';
import OpportunitiesGrid from '../components/Opportunities/OpportunitiesGrid.jsx';
import TestimonialsSection from '../components/Testimonials/TestimonialsSection.jsx';
import ContactSection from '../components/Contact/ContactSection.jsx';
import Footer from '../components/Footer/Footer.jsx';
import Modal from '../components/Modal/Modal.jsx';
import VolunteerRequestForm from '../components/Modal/VolunteerRequestForm.jsx';
import AuthModal from '../components/Modal/AuthModal.jsx';
import CompanyAuthModal from '../components/CompanyAuthModal.jsx';
import CustomMessageBox from '../components/Modal/CustomMessageBox.jsx';
import GroupSignupModal from '../components/Opportunities/GroupSignupModal.jsx';
import { useScrollTriggeredAnimation, useSmoothScroll, useParallaxEffect } from '../lib/hooks.js';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCompanyAuthModalOpen, setIsCompanyAuthModalOpen] = useState(false);
  const [currentOpportunity, setCurrentOpportunity] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [messageBox, setMessageBox] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [isCompanyInfoModalOpen, setIsCompanyInfoModalOpen] = useState(false);
  const [selectedCompanyInfo, setSelectedCompanyInfo] = useState(null);
  const [isGroupSignupModalOpen, setIsGroupSignupModalOpen] = useState(false);
  const [selectedOpportunityForGroup, setSelectedOpportunityForGroup] = useState(null);
  const [isGroupSignupRequested, setIsGroupSignupRequested] = useState(false);

  useEffect(() => {
    // Fetch opportunities on component mount
    fetchOpportunities();
    
    // Check if company is logged in from localStorage
    const storedCompanyData = localStorage.getItem('companyData');
    if (storedCompanyData) {
      try {
        setCurrentCompany(JSON.parse(storedCompanyData));
      } catch (error) {
        console.error('Error parsing stored company data:', error);
        localStorage.removeItem('companyData');
      }
    }

    // Check if user is logged in from localStorage
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        setCurrentUser(JSON.parse(storedUserData));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('userData');
      }
    }
  }, []);

  // Filter and search logic
  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesCategory = filter === 'all' || opportunity.category === filter;
    const matchesSearchTerm =
      opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearchTerm;
  });

  // Handle modal open/close
  const openModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent body scroll
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = ''; // Restore body scroll
    setMessageBox(null); // Clear any active message box
  };
  
  // Handle auth modal open/close
  const openAuthModal = (opportunity) => {
    setCurrentOpportunity(opportunity);
    setIsAuthModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent body scroll
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    document.body.style.overflow = ''; // Restore body scroll
    setIsGroupSignupRequested(false); // Reset the flag when modal is closed
    setCurrentOpportunity(null); // Clear the opportunity
  };
  
  // Handle company auth modal open/close
  const openCompanyAuthModal = () => {
    setIsCompanyAuthModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent body scroll
    // Close the volunteer request form modal if it's open
    if (isModalOpen) {
      setIsModalOpen(false);
    }
  };

  const closeCompanyAuthModal = () => {
    setIsCompanyAuthModalOpen(false);
    document.body.style.overflow = ''; // Restore body scroll
  };
  
  // Handle successful authentication
  const handleAuthSuccess = (userData) => {
    setCurrentUser(userData);
    closeAuthModal();
    
    // If user was trying to join an opportunity, handle that
    if (currentOpportunity) {
      // Check if the user was trying to access group signup
      if (isGroupSignupRequested && (userData.isPA || userData.isAdmin)) {
        // Open group signup modal for PA/Admin users
        setSelectedOpportunityForGroup(currentOpportunity);
        setIsGroupSignupModalOpen(true);
        document.body.style.overflow = 'hidden';
        setCurrentOpportunity(null); // Clear the opportunity
        setIsGroupSignupRequested(false); // Reset the flag
      } else if (isGroupSignupRequested && (!userData.isPA && !userData.isAdmin)) {
        // User authenticated but is not PA/Admin
        setMessageBox({
          message: 'Only Peer Advisors (PAs) can sign up multiple people for opportunities.',
          callback: () => setMessageBox(null)
        });
        setCurrentOpportunity(null); // Clear the opportunity
        setIsGroupSignupRequested(false); // Reset the flag
      } else {
        // Regular join opportunity flow
        handleJoinOpportunity(currentOpportunity);
      }
    }
  };
  
  // Handle successful company authentication
  const handleCompanyAuthSuccess = (companyData) => {
    setCurrentCompany(companyData);
    closeCompanyAuthModal();
  };
  
  // Handle Learn More click
  const handleLearnMoreClick = async (opportunity) => {
    if (!opportunity.companyId) {
      setMessageBox({
        message: 'No more info for this one',
        callback: () => setMessageBox(null)
      });
      return;
    }
    
    try {
      const response = await fetch(`/api/companies?id=${opportunity.companyId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch company information');
      }
      
      const companyData = await response.json();
      setSelectedCompanyInfo(companyData);
      setIsCompanyInfoModalOpen(true);
      document.body.style.overflow = 'hidden';
    } catch (error) {
      console.error('Error fetching company info:', error);
      setMessageBox({
        message: 'No more info for this one',
        callback: () => setMessageBox(null)
      });
    }
  };
  
  // Handle company info modal close
  const closeCompanyInfoModal = () => {
    setIsCompanyInfoModalOpen(false);
    setSelectedCompanyInfo(null);
    document.body.style.overflow = '';
  };

  // Handle group signup modal
  const handleGroupSignupClick = (opportunity) => {
    if (!currentUser) {
      setIsGroupSignupRequested(true);
      openAuthModal(opportunity);
      return;
    }

    if (!currentUser.isPA && !currentUser.isAdmin) {
      setMessageBox({
        message: 'Only Peer Advisors (PAs) can sign up multiple people for opportunities.',
        callback: () => setMessageBox(null)
      });
      return;
    }

    setSelectedOpportunityForGroup(opportunity);
    setIsGroupSignupModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeGroupSignupModal = () => {
    setIsGroupSignupModalOpen(false);
    setSelectedOpportunityForGroup(null);
    document.body.style.overflow = '';
    setIsGroupSignupRequested(false); // Reset the flag when modal is closed
  };

  const handleGroupSignupSuccess = async (data) => {
    // Refetch opportunities to show updated counts
    await fetchOpportunities();
    
    setMessageBox({
      message: `Successfully signed up ${data.results.filter(r => r.success).length} users for "${selectedOpportunityForGroup?.title || 'the event'}"!`,
      callback: () => setMessageBox(null)
    });
    
    // Close the modal and reset state
    closeGroupSignupModal();
  };
  
  // Handle updating user state (for commitment removal)
  const handleUserUpdate = async (updatedUser) => {
    setCurrentUser(updatedUser);
    // Refetch opportunities to show updated counts
    await fetchOpportunities();
  };
  
  // Function to fetch opportunities
  const fetchOpportunities = async () => {
    try {
      const response = await fetch('/api/opportunities');
      const data = await response.json();
      
      // Check if the response is successful and data is an array
      if (response.ok && Array.isArray(data)) {
        setOpportunities(data);
      } else {
        console.error('API returned error or invalid data:', data);
        setOpportunities([]);
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      // Fallback to empty array if fetch fails
      setOpportunities([]);
    }
  };

  // Handle joining an opportunity
  const handleJoinOpportunity = async (opportunity) => {
    if (!currentUser) {
      // If no user is logged in, open auth modal
      openAuthModal(opportunity);
      return;
    }
    
    try {
      // Check if user already has 2 commitments
      if (currentUser.commitments && currentUser.commitments.length >= 2) {
        setMessageBox({
          message: `You've already committed to the maximum number of opportunities (2). Please complete or withdraw from an existing commitment before joining a new one.`,
          callback: () => setMessageBox(null)
        });
        return;
      }
      
      // Show loading message
      setMessageBox({
        message: `Joining opportunity "${opportunity.title}"...`,
        isLoading: true
      });
      
      // Add commitment to user's profile
      const response = await fetch('/api/users?addCommitment=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: currentUser._id,
          opportunityId: opportunity.id || opportunity._id
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error joining opportunity:', data);
        // Clear loading message
        setMessageBox(null);
        
        // Show specific error message based on status code
        if (response.status === 409) {
          setMessageBox({
            message: data.error || 'You are already committed to this opportunity.',
            callback: () => setMessageBox(null)
          });
        } else if (response.status === 400) {
          setMessageBox({
            message: data.error || 'Unable to join this opportunity. You may have reached your maximum commitments.',
            callback: () => setMessageBox(null)
          });
        } else {
          throw new Error(data.error || 'Failed to join opportunity');
        }
        return;
      }
      
      // Update current user with new commitments
      setCurrentUser(data);
      
      // Immediately refetch opportunities to show updated counts
      await fetchOpportunities();
      
      // Show success message
      setMessageBox({
        message: `You've successfully signed up for "${opportunity.title}"!`,
        callback: () => setMessageBox(null)
      });
    } catch (error) {
      console.error('Error joining opportunity:', error);
      setMessageBox({
        message: `Error: ${error.message || 'Failed to join opportunity. Please try again.'}`,
        callback: () => setMessageBox(null)
      });
    }
  };

  // Handle form submission
  const handleVolunteerRequestSubmit = (formData) => {
    console.log('Volunteer Request Submitted:', formData);
    setMessageBox({
      message: 'Thank you! Your volunteer request has been submitted. We\'ll review it and get back to you within 24 hours.',
      callback: closeModal
    });
  };

  // Smooth scroll hook
  useSmoothScroll();

  // Parallax effect for hero section
  const heroContentRef = useRef(null);
  useParallaxEffect(heroContentRef, 0.15, 0.002, 600);

  // Scroll triggered animations for opportunity cards and testimonial cards
  const opportunityRefs = useRef([]);
  const testimonialRefs = useRef([]);
  useScrollTriggeredAnimation(opportunityRefs, '', '', {
    threshold: 0.15,
    rootMargin: '0px 0px -10% 0px'
  });
  useScrollTriggeredAnimation(testimonialRefs, 'opacity-0 translate-y-5', 'opacity-100 translate-y-0', {
    threshold: 0.15,
    rootMargin: '0px 0px -10% 0px'
  });

  return (
    <>
      <Header openModal={openModal} />
      <main>
        <HeroSection ref={heroContentRef} />
        <FloatingCardSection />
        <SearchSection
        filter={filter}
        setFilter={setFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currentUser={currentUser}
        opportunities={opportunities}
        openAuthModal={() => openAuthModal(null)}
        onJoinOpportunity={handleJoinOpportunity}
        onUserUpdate={handleUserUpdate}
      />
        <div id="opportunities">
          <OpportunitiesGrid
            opportunities={filteredOpportunities}
            opportunityRefs={opportunityRefs}
            onJoinClick={handleJoinOpportunity}
            onLearnMoreClick={handleLearnMoreClick}
            onGroupSignupClick={handleGroupSignupClick}
            currentUser={currentUser}
          />
        </div>
        <TestimonialsSection testimonialRefs={testimonialRefs} />
        <div id="contact">
          <ContactSection />
        </div>
      </main>
      <Footer />

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {messageBox ? (
          <CustomMessageBox message={messageBox.message} onClose={messageBox.callback} />
        ) : (
          <VolunteerRequestForm 
            onSubmit={handleVolunteerRequestSubmit} 
            onCancel={closeModal} 
            onCompanyLoginClick={openCompanyAuthModal}
          />
        )}
      </Modal>
      
      {/* Modal for user authentication */}
      <Modal isOpen={isAuthModalOpen} onClose={closeAuthModal}>
        <AuthModal onClose={closeAuthModal} onSuccess={handleAuthSuccess} />
      </Modal>
      
      {/* Modal for company authentication */}
      <Modal isOpen={isCompanyAuthModalOpen} onClose={closeCompanyAuthModal}>
        <CompanyAuthModal onClose={closeCompanyAuthModal} onSuccess={handleCompanyAuthSuccess} />
      </Modal>
      
      {/* Modal for company information */}
      <Modal isOpen={isCompanyInfoModalOpen} onClose={closeCompanyInfoModal}>
        {selectedCompanyInfo && (
          <div className="p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-primary font-montserrat">{selectedCompanyInfo.name}</h2>
            
            {selectedCompanyInfo.description && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2 text-text-secondary font-montserrat">About</h3>
                <p className="text-text-primary leading-relaxed font-source-serif">{selectedCompanyInfo.description}</p>
              </div>
            )}
            
            {selectedCompanyInfo.website && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2 text-text-secondary font-montserrat">Website</h3>
                <a 
                  href={selectedCompanyInfo.website.startsWith('http') ? selectedCompanyInfo.website : `https://${selectedCompanyInfo.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent1 hover:text-accent1-dark transition-colors duration-200 font-source-serif"
                >
                  {selectedCompanyInfo.website}
                </a>
              </div>
            )}
            
            {selectedCompanyInfo.phone && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2 text-text-secondary font-montserrat">Phone</h3>
                <p className="text-text-primary font-source-serif">{selectedCompanyInfo.phone}</p>
              </div>
            )}
            
            {selectedCompanyInfo.email && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-text-secondary font-montserrat">Contact</h3>
                <a 
                  href={`mailto:${selectedCompanyInfo.email}`}
                  className="text-accent1 hover:text-accent1-dark transition-colors duration-200 font-source-serif"
                >
                  {selectedCompanyInfo.email}
                </a>
              </div>
            )}
            
            <button
              onClick={closeCompanyInfoModal}
              className="w-full bg-accent1 hover:bg-accent1-light text-white font-bold py-2 px-4 rounded transition-colors duration-200 font-montserrat"
            >
              Close
            </button>
          </div>
        )}
      </Modal>
      
      {/* Group Signup Modal */}
      <GroupSignupModal
        isOpen={isGroupSignupModalOpen}
        onClose={closeGroupSignupModal}
        opportunity={selectedOpportunityForGroup}
        currentUser={currentUser}
        onGroupSignup={handleGroupSignupSuccess}
      />

      {/* Message box for notifications */}
      {messageBox && !isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[3000]">
          <CustomMessageBox message={messageBox.message} onClose={messageBox.callback} />
        </div>
      )}
    </>
  );
}
