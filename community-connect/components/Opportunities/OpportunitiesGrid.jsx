import React, { useEffect, useRef } from 'react';
import OpportunityCard from './OpportunityCard';

const OpportunitiesGrid = ({ opportunities, opportunityRefs, onJoinClick, onLearnMoreClick }) => {
  const gridRef = useRef(null);

  // Reset refs on opportunities change to re-trigger animations
  useEffect(() => {
    if (opportunityRefs.current) {
      opportunityRefs.current = opportunityRefs.current.slice(0, opportunities.length);
    }
  }, [opportunities, opportunityRefs]);

  return (
    <section className="content max-w-screen-xl mx-auto px-6 md:px-8 pb-24">
      <div className="text-center mb-16">
        <h2 className="feed-title font-montserrat text-clamp-32-48 font-extrabold mb-5 tracking-[-0.025em] text-primary relative inline-block">
          Opportunities
          <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary to-accent1 rounded-full"></span>
        </h2>
        <p className="font-montserrat text-lg font-normal text-text-secondary max-w-xl mx-auto leading-relaxed mt-8">
          Find ways to make a meaningful difference in your community.
        </p>
      </div>

      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
        {opportunities.map((opportunity, index) => (
          <OpportunityCard
            key={opportunity.id}
            opportunity={opportunity}
            ref={el => opportunityRefs.current[index] = el}
            onJoinClick={onJoinClick}
            onLearnMoreClick={onLearnMoreClick}
          />
        ))}
      </div>
    </section>
  );
};

export default OpportunitiesGrid;
