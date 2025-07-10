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
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">🚀 Quick Navigation</h3>
      
      {/* Section Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
        {/* Show All Button */}
        <button
          onClick={() => onSectionClick('all')}
          className={`p-3 rounded-lg text-center transition-all duration-200 ${
            activeSection === 'all'
              ? 'bg-gray-100 border-2 border-gray-300'
              : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
          }`}
        >
          <div className="text-2xl mb-1">📋</div>
          <div className="text-xs font-medium text-gray-700">All</div>
        </button>
        
        {Object.entries(sections).map(([key, info]) => (
          <button
            key={key}
            onClick={() => onSectionClick(key)}
            className={`p-3 rounded-lg text-center transition-all duration-200 ${
              activeSection === key
                ? `bg-${info.color}-100 border-2 border-${info.color}-300`
                : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
            }`}
          >
            <div className="text-2xl mb-1">{info.icon}</div>
            <div className="text-xs font-medium text-gray-700">{info.title.split(' ')[1]}</div>
          </button>
        ))}
      </div>

      {/* Search Results Quick Access */}
      {searchTerm && searchResults.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            🔍 Quick Access to Search Results
          </h4>
          <div className="flex flex-wrap gap-2">
            {searchResults.slice(0, 8).map((result, index) => (
              <button
                key={index}
                onClick={() => {
                  // Extract section from path and expand it
                  const section = result.path.split('.')[0];
                  onSectionClick(section);
                }}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full hover:bg-blue-200 transition-colors"
                title={result.path}
              >
                {result.label}
              </button>
            ))}
            {searchResults.length > 8 && (
              <span className="px-3 py-1 text-xs text-gray-500">
                +{searchResults.length - 8} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between text-xs text-gray-500">
          <span>📊 {Object.keys(sections).length} sections</span>
          <span>🔍 {searchResults.length} search results</span>
          <span>📝 Content ready to edit</span>
        </div>
      </div>
    </div>
  );
};

export default QuickNav;