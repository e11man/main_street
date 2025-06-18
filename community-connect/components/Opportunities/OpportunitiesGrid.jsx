import React, { useEffect, useRef, useState } from 'react';
import OpportunityCard from './OpportunityCard';
import Icon from '../ui/Icon';

const OpportunitiesGrid = ({ opportunities, opportunityRefs, onJoinClick, onLearnMoreClick }) => {
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

  return (
    <section id="opportunities" className="content max-w-screen-xl mx-auto px-6 md:px-8 pb-24">
      <div className="text-center mb-16">
        <h2 className="feed-title font-montserrat text-clamp-32-48 font-extrabold mb-5 tracking-[-0.025em] text-primary relative inline-block">
          Opportunities
          <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary to-accent1 rounded-full"></span>
        </h2>
        <p className="font-montserrat text-lg font-normal text-text-secondary max-w-xl mx-auto leading-relaxed mt-8">
          Find ways to make a meaningful difference in your community.
        </p>
      </div>

      <div className="relative">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-300 hover:scale-110 border border-border/20"
            aria-label="Scroll left"
          >
            <Icon 
              path="M15 18l-6-6 6-6" 
              className="w-5 h-5 text-primary" 
            />
          </button>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-300 hover:scale-110 border border-border/20"
            aria-label="Scroll right"
          >
            <Icon 
              path="M9 18l6-6-6-6" 
              className="w-5 h-5 text-primary" 
            />
          </button>
        )}

        {/* Scrollable Container */}
        <div 
          ref={gridRef} 
          className="flex overflow-x-auto gap-8 md:gap-10 pb-4 scrollbar-hide scroll-smooth"
          onScroll={checkScrollPosition}
        >
          {opportunities.map((opportunity, index) => (
            <div key={opportunity.id} className="flex-shrink-0 w-80 md:w-96">
              <div className="h-full">
                <OpportunityCard
                  opportunity={opportunity}
                  ref={el => opportunityRefs.current[index] = el}
                  onJoinClick={onJoinClick}
                  onLearnMoreClick={onLearnMoreClick}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Scroll Indicator */}
        <div className="flex justify-center mt-4 gap-2">
          <div className="flex items-center gap-1 text-xs text-text-tertiary">
            <Icon path="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M7 4h10M9 9l2 2 4-4" className="w-4 h-4" />
            <span>Scroll horizontally to see more opportunities</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OpportunitiesGrid;
