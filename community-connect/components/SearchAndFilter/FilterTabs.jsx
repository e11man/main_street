import React from 'react';
import FilterTab from './FilterTab';

const FilterTabs = ({ currentFilter, setFilter }) => {
  const categories = ['all', 'community', 'education', 'environment', 'health', 'fundraising', 'other'];

  const handleFilterClick = (newFilter) => {
    setFilter(newFilter);
  };

  return (
    <div className="bg-gradient-to-r from-surface/50 via-white to-surface/50 rounded-2xl p-6 border border-border/30 shadow-sm mb-8">
      <div className="text-center mb-4">
        <h3 className="font-montserrat text-lg font-semibold text-primary mb-2">Filter Opportunities</h3>
        <p className="text-sm text-text-secondary">Click on a category to filter opportunities</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3 md:gap-4" role="tablist" aria-label="Opportunity category filters">
        {categories.map((category) => (
          <FilterTab
            key={category}
            category={category}
            isActive={currentFilter === category}
            onClick={() => handleFilterClick(category)}
          />
        ))}
      </div>
    </div>
  );
};

export default FilterTabs;
