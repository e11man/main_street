import React, { useRef, useState, useEffect } from 'react';
import OpportunityCard from './OpportunityCard';
import Icon from '../ui/Icon';

const OpportunitiesGrid = ({ opportunities, opportunityRefs, onJoinClick, onLearnMoreClick, onGroupSignupClick, currentUser }) => {
  const gridRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Reset refs on opportunities change to re-trigger animations
  useEffect(() => {
    if (opportunityRefs.current) {
      opportunityRefs.current = opportunityRefs.current.slice(0, opportunities.length);
    }
  }, [opportunities, opportunityRefs]);

  // Check scroll position and update arrow visibility
  const checkScrollPosition = () => {
    if (gridRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = gridRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Initialize scroll position check
  useEffect(() => {
    checkScrollPosition();
    const handleResize = () => checkScrollPosition();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [opportunities]);

  // Scroll functions
  const scrollLeft = () => {
    if (gridRef.current) {
      gridRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (gridRef.current) {
      gridRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  // Sort opportunities by soonest date (closest to today) before rendering
  // Add null checks to prevent errors during static generation
  const validOpportunities = Array.isArray(opportunities) ? opportunities.filter(Boolean) : [];
  const sortedOpportunities = [...validOpportunities].sort((a, b) => {
    const dateA = new Date(a?.date || '');
    const dateB = new Date(b?.date || '');
    return dateA - dateB;
  });

  return (
    <section className="content max-w-screen-xl mx-auto px-6 md:px-8 pb-24 pt-16 bg-gradient-to-b from-surface/30 to-transparent">
      <div className="text-center mb-16">
        <h2 className="feed-title font-montserrat text-clamp-32-48 font-extrabold mb-5 tracking-[-0.025em] text-primary relative inline-block">
          Opportunities
          <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary to-accent1 rounded-full"></span>
        </h2>
        <p className="font-montserrat text-lg font-normal text-text-secondary max-w-xl mx-auto leading-relaxed mt-8">
          Find ways to make a meaningful difference in upland.
        </p>
      </div>

      <div className="relative">
        {/* Left Arrow - Mobile Optimized */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="absolute left-2 md:left-0 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-r from-accent1 to-accent1-light hover:from-accent1-light hover:to-accent1 text-white shadow-lg rounded-full p-2 md:p-4 transition-all duration-300 hover:scale-110 border-2 border-white/20 backdrop-blur-sm"
            aria-label="Scroll left to see previous opportunities"
          >
            <Icon 
              path="M15 18l-6-6 6-6" 
              className="w-4 h-4 md:w-6 md:h-6" 
            />
          </button>
        )}

        {/* Right Arrow - Mobile Optimized */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="absolute right-2 md:right-0 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-r from-accent1 to-accent1-light hover:from-accent1-light hover:to-accent1 text-white shadow-lg rounded-full p-2 md:p-4 transition-all duration-300 hover:scale-110 border-2 border-white/20 backdrop-blur-sm"
            aria-label="Scroll right to see more opportunities"
          >
            <Icon 
              path="M9 18l6-6-6-6" 
              className="w-4 h-4 md:w-6 md:h-6" 
            />
          </button>
        )}

        {/* Scrollable Container */}
        <div 
          ref={gridRef} 
          className="flex overflow-x-auto gap-8 md:gap-10 pb-4 scrollbar-hide scroll-smooth"
          onScroll={checkScrollPosition}
        >
          {sortedOpportunities.map((opportunity, index) => (
            <div key={opportunity.id} className="flex-shrink-0 w-80 md:w-96">
              <div className="h-full">
                <OpportunityCard
                  opportunity={opportunity}
                  ref={el => opportunityRefs.current[index] = el}
                  onJoinClick={onJoinClick}
                  onLearnMoreClick={onLearnMoreClick}
                  onGroupSignupClick={onGroupSignupClick}
                  currentUser={currentUser}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Scroll Indicator - Mobile Optimized */}
        <div className="flex flex-col items-center mt-6 gap-3">
          <div className="flex items-center gap-2 bg-accent1/10 px-3 md:px-4 py-2 rounded-full border border-accent1/20">
            <Icon path="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M7 4h10M9 9l2 2 4-4" className="w-4 h-4 text-accent1" />
            <span className="text-xs md:text-sm font-medium text-accent1 text-center">Use arrow buttons or swipe to explore more opportunities</span>
          </div>
          {/* Scroll Progress Indicator */}
          <div className="flex gap-1">
            {validOpportunities.length > 0 && Array.from({ length: Math.ceil(validOpportunities.length / 3) }, (_, i) => {
              const isActive = gridRef.current ? 
                Math.floor(gridRef.current.scrollLeft / (gridRef.current.scrollWidth / Math.ceil(validOpportunities.length / 3))) === i :
                i === 0;
              return (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    isActive ? 'bg-accent1 w-6' : 'bg-accent1/30'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OpportunitiesGrid;
