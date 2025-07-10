import React from 'react';

const QuickNav = ({ sections, activeSection, onSectionClick, searchTerm, searchResults }) => {
  const sectionIcons = {
    homepage: "🏠",
    about: "ℹ️",
    navigation: "🧭",
    footer: "🦶",
    common: "🔧",
    modals: "📋"
  };

  const sectionColors = {
    homepage: "blue",
    about: "green", 
    navigation: "purple",
    footer: "gray",
    common: "orange",
    modals: "pink"
  };

  return (
    <div className="bg-surface rounded-xl shadow-md p-2 sm:p-4 mb-4 flex flex-col gap-2 min-w-[320px]">
      <h3 className="text-base font-montserrat text-primary mb-2">🚀 Quick Navigation</h3>
      {/* Section Navigation - horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {/* Show All Button */}
        <button
          onClick={() => onSectionClick('all')}
          className={`min-w-[80px] p-3 rounded-lg text-center font-montserrat font-semibold transition-all duration-200 shadow border-2 ${activeSection === 'all' ? 'bg-accent1-color text-white border-accent1' : 'bg-white text-primary border-transparent hover:bg-surface'}`}
        >
          <div className="text-2xl mb-1">📋</div>
          <div className="text-xs font-medium">All</div>
        </button>
        {Object.entries(sections).map(([key, info]) => (
          <button
            key={key}
            onClick={() => onSectionClick(key)}
            className={`min-w-[80px] p-3 rounded-lg text-center font-montserrat font-semibold transition-all duration-200 shadow border-2 ${activeSection === key ? `bg-accent1-color text-white border-accent1` : 'bg-white text-primary border-transparent hover:bg-surface'}`}
          >
            <div className="text-2xl mb-1">{info.icon}</div>
            <div className="text-xs font-medium">{info.title.split(' ')[1]}</div>
          </button>
        ))}
      </div>
      {/* Search Results Quick Access */}
      {searchTerm && searchResults.length > 0 && (
        <div className="border-t pt-2 mt-2">
          <h4 className="text-xs font-montserrat text-primary mb-1">🔍 Quick Access to Search Results</h4>
          <div className="flex flex-wrap gap-2">
            {searchResults.slice(0, 8).map((result, index) => (
              <button
                key={index}
                onClick={() => {
                  const section = result.path.split('.')[0];
                  onSectionClick(section);
                }}
                className="px-3 py-1 bg-accent1-light/20 text-accent1 text-xs rounded-full hover:bg-accent1-light/40 font-montserrat transition-colors"
                title={result.path}
              >
                {result.label}
              </button>
            ))}
            {searchResults.length > 8 && (
              <span className="px-3 py-1 text-xs text-gray-500">+{searchResults.length - 8} more</span>
            )}
          </div>
        </div>
      )}
      {/* Quick Stats */}
      <div className="border-t pt-2 mt-2">
        <div className="flex flex-wrap justify-between text-xs text-gray-500 gap-2">
          <span>📊 {Object.keys(sections).length} sections</span>
          <span>🔍 {searchResults.length} search results</span>
          <span>📝 Content ready to edit</span>
        </div>
      </div>
    </div>
  );
};

export default QuickNav;