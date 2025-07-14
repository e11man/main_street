import React from 'react';
import FilterTab from './FilterTab';
import useContent from '../../lib/useContent';

const FilterTabs = ({ currentFilter, setFilter, content }) => {
  const getContent = (key, defaultValue = '') => {
    return content?.[key] || defaultValue;
  };
  const categories = ['all', 'community', 'education', 'environment', 'health', 'fundraising', 'other'];

  const handleFilterClick = (newFilter) => {
    setFilter(newFilter);
  };

  return (
    <div className="bg-gradient-to-r from-surface/50 via-white to-surface/50 rounded-2xl p-4 md:p-6 border border-border/30 shadow-sm mb-8">
      <div className="text-center mb-3 md:mb-4">
        <h3 className="font-montserrat text-base md:text-lg font-semibold text-primary mb-1 md:mb-2">
          {getContent('search.filter.title', 'Filter Opportunities')}
        </h3>
        <p className="text-xs md:text-sm text-text-secondary">
          {getContent('search.filter.subtitle', 'Click on a category to filter opportunities')}
        </p>
      </div>
      
      {/* Mobile: Horizontal scroll, Desktop: Flex wrap */}
      <div className="md:hidden">
        <div 
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 px-1" 
          role="tablist" 
          aria-label="Opportunity category filters"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitScrollbar: { display: 'none' }
          }}
        >
          {categories.map((category) => (
            <div key={category} className="flex-shrink-0">
              <FilterTab
                category={category}
                isActive={currentFilter === category}
                onClick={() => handleFilterClick(category)}
                content={content}
              />
            </div>
          ))}
        </div>
        {/* Scroll indicator dots */}
        <div className="flex justify-center mt-2 gap-1">
          {categories.map((_, index) => (
            <div 
              key={index} 
              className="w-1.5 h-1.5 rounded-full bg-border/40"
            />
          ))}
        </div>
      </div>
      
      {/* Desktop: Original flex wrap layout */}
      <div className="hidden md:flex flex-wrap justify-center gap-3 md:gap-4" role="tablist" aria-label="Opportunity category filters">
        {categories.map((category) => (
                        <FilterTab
                key={category}
                category={category}
                isActive={currentFilter === category}
                onClick={() => handleFilterClick(category)}
                content={content}
              />
        ))}
      </div>
    </div>
  );
};

export default FilterTabs;
