import React from 'react';
import FilterTab from './FilterTab';

const FilterTabs = ({ currentFilter, setFilter }) => {
  const categories = ['all', 'community', 'education', 'environment', 'health', 'fundraising', 'other'];

  const handleFilterClick = (newFilter) => {
    setFilter(newFilter);
  };

  return (
    <div className="flex flex-wrap justify-center gap-3 md:gap-4 px-2 md:px-0 mb-2">
      {categories.map((category) => (
        <FilterTab
          key={category}
          category={category}
          isActive={currentFilter === category}
          onClick={() => handleFilterClick(category)}
        />
      ))}
    </div>
  );
};

export default FilterTabs;
