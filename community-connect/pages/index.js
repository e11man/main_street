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

  useEffect(() => {
    // Fetch opportunities from the JSON file
    // In the future, this can be replaced with an API call
    const fetchOpportunities = async () => {
      try {
        const response = await fetch('/api/opportunities');
        const data = await response.json();
        setOpportunities(data);
      } catch (error) {
        console.error('Error fetching opportunities:', error);
        // Fallback to empty array if fetch fails
        setOpportunities([]);
      }
    };

    fetchOpportunities();
    
    // Check if company is logged in from localStorage
    const storedCompanyData = localStorage.getItem('companyData');
    if (storedCompanyData) {
      setCurrentCompany(JSON.parse(storedCompanyData));
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
      handleJoinOpportunity(currentOpportunity);
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
  
  // Handle updating user state (for commitment removal)
  const handleUserUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
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
          opportunityId: opportunity.id
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
      
      // Show success message
      setMessageBox({
        message: `You've successfully joined "${opportunity.title}"! We'll send you more details via email.`,
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
            <h2 className="text-2xl font-bold mb-4 text-primary">{selectedCompanyInfo.name}</h2>
            
            {selectedCompanyInfo.description && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">About</h3>
                <p className="text-gray-600 leading-relaxed">{selectedCompanyInfo.description}</p>
              </div>
            )}
            
            {selectedCompanyInfo.website && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Website</h3>
                <a 
                  href={selectedCompanyInfo.website.startsWith('http') ? selectedCompanyInfo.website : `https://${selectedCompanyInfo.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent1 hover:text-accent1/80 transition-colors duration-200"
                >
                  {selectedCompanyInfo.website}
                </a>
              </div>
            )}
            
            {selectedCompanyInfo.phone && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Phone</h3>
                <p className="text-gray-600">{selectedCompanyInfo.phone}</p>
              </div>
            )}
            
            {selectedCompanyInfo.email && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Contact</h3>
                <a 
                  href={`mailto:${selectedCompanyInfo.email}`}
                  className="text-accent1 hover:text-accent1/80 transition-colors duration-200"
                >
                  {selectedCompanyInfo.email}
                </a>
              </div>
            )}
            
            <button
              onClick={closeCompanyInfoModal}
              className="w-full bg-accent1 hover:bg-accent1/90 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
            >
              Close
            </button>
          </div>
        )}
      </Modal>
      
      {/* Message box for notifications */}
      {messageBox && !isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[3000]">
          <CustomMessageBox message={messageBox.message} onClose={messageBox.callback} />
        </div>
      )}
    </>
  );
}
