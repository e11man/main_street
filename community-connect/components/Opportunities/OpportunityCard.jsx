import React, { forwardRef } from 'react';
import Icon from '../ui/Icon';
import Button from '../ui/Button';
import ProgressBar from './ProgressBar';

const OpportunityCard = forwardRef(({ opportunity, onJoinClick, onLearnMoreClick }, ref) => {
  // Handle both spotsTotal and totalSpots fields for backward compatibility
  const spotsTotal = opportunity.spotsTotal || opportunity.totalSpots || 0;
  const spotsFilled = opportunity.spotsFilled || 0;
  const progress = spotsTotal === 0 ? 0 : (spotsFilled / spotsTotal) * 100;

  return (
    <div
      ref={ref}
      className="opportunity-card bg-white rounded-xl md:rounded-2xl border border-border/80 overflow-hidden shadow-md
                 transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]
                 hover:translate-y-[-8px] hover:scale-[1.02] hover:shadow-xl hover:border-accent1/50 group"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <span className="card-category bg-accent2 text-white px-3 py-1.5 rounded-full font-montserrat text-xs font-semibold tracking-wide uppercase shadow-sm">
            {opportunity.category}
          </span>
          <div className="card-priority flex items-center gap-1.5 font-montserrat text-xs font-medium text-text-tertiary uppercase tracking-wide transition-all duration-300 group-hover:text-accent1">
            <Icon 
              path={opportunity.priority === 'High Priority' ? "M13 10V3L4 14h7v7l9-11h-7z" : "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"} 
              className={`w-4 h-4 ${opportunity.priority === 'High Priority' ? 'text-accent2' : 'text-accent2/80'} transition-all duration-300`} 
            />
            {opportunity.priority}
          </div>
        </div>
        <h3 className="font-montserrat text-xl font-bold mb-3 text-primary tracking-tight leading-tight group-hover:text-primary-light transition-all duration-300">
          {opportunity.title}
        </h3>
        <p className="text-text-secondary font-source-serif text-sm leading-relaxed mb-5">
          {opportunity.description}
        </p>
        <div className="flex items-center gap-5 mb-7 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs md:text-sm font-medium text-text-secondary transition-all duration-300 group-hover:text-accent1">
            <Icon 
              path="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
              className="w-4 h-4 text-accent1/70 group-hover:text-accent1 transition-all duration-300" 
            />
            {opportunity.date}
          </div>
          {opportunity.time && (
            <div className="flex items-center gap-1.5 text-xs md:text-sm font-medium text-text-secondary transition-all duration-300 group-hover:text-accent1">
              <Icon 
                path="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                className="w-4 h-4 text-accent1/70 group-hover:text-accent1 transition-all duration-300" 
              />
              {opportunity.time}
            </div>
          )}
          <div className="card-spots bg-surface/70 p-4 rounded-lg border-2 border-accent1/20 min-w-[140px] flex flex-col gap-3 transition-all duration-300 group-hover:border-accent1/40 group-hover:shadow-md">
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
        </div>
        <div className="flex gap-4 flex-wrap">
          <Button 
            variant="secondary" 
            className="py-2.5 px-5 rounded-full bg-accent1 hover:bg-accent1/90"
            onClick={() => onJoinClick(opportunity)}
          >
            Join Now
          </Button>
          <Button 
            variant="outline" 
            className="py-2.5 px-5 rounded-full border-accent1/50 text-accent1 hover:bg-accent1/10"
            onClick={() => onLearnMoreClick && onLearnMoreClick(opportunity)}
          >
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
});

OpportunityCard.displayName = 'OpportunityCard';

export default OpportunityCard;
