import React from 'react';
import Button from '../ui/Button';

const QuickNav = ({ sections, activeSection, onSectionClick, searchTerm, searchResults }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-montserrat font-semibold text-primary mb-4">
        Quick Navigation
      </h3>
      
      {/* Section Navigation */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Show All Button */}
        <Button
          variant={activeSection === 'all' ? 'primary' : 'outline'}
          className="text-sm px-4 py-2"
          onClick={() => onSectionClick('all')}
        >
          All Sections
        </Button>
        
        {Object.entries(sections).map(([key, info]) => (
          <Button
            key={key}
            variant={activeSection === key ? 'primary' : 'outline'}
            className="text-sm px-4 py-2"
            onClick={() => onSectionClick(key)}
          >
            {info.title}
          </Button>
        ))}
      </div>

      {/* Search Results Quick Access */}
      {searchTerm && searchResults.length > 0 && (
        <div className="border-t border-border pt-4 mb-4">
          <h4 className="text-sm font-montserrat font-semibold text-primary mb-3">
            Quick Access to Search Results
          </h4>
          <div className="flex flex-wrap gap-2">
            {searchResults.slice(0, 8).map((result, index) => (
              <button
                key={index}
                onClick={() => {
                  const section = result.path.split('.')[0];
                  onSectionClick(section);
                }}
                className="px-3 py-1 bg-accent1 text-white text-xs rounded-md hover:bg-accent1-dark font-montserrat font-medium transition-colors"
                title={result.path}
              >
                {result.label}
              </button>
            ))}
            {searchResults.length > 8 && (
              <span className="px-3 py-1 text-xs text-text-secondary">
                +{searchResults.length - 8} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="border-t border-border pt-4">
        <div className="flex flex-wrap justify-between text-xs text-text-secondary gap-4">
          <span>{Object.keys(sections).length} sections</span>
          <span>{searchResults.length} search results</span>
          <span>Content ready to edit</span>
        </div>
      </div>
    </div>
  );
};

export default QuickNav;