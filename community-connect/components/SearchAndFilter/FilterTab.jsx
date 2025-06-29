import React from 'react';
import Icon from '../ui/Icon';

const FilterTab = ({ category, isActive, onClick }) => {
  // Define icons for each category
  const getCategoryIcon = (cat) => {
    switch(cat) {
      case 'all':
        return "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z";
      case 'community':
        return "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z";
      case 'education':
        return "M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z";
      case 'environment':
        return "M12 22c4.97 0 9-4.03 9-9-4.97 0-9 4.03-9 9zM5.6 10.25c0 1.38 1.12 2.5 2.5 2.5.53 0 1.01-.16 1.42-.44l-.02.19c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5l-.02-.19c.4.28.89.44 1.42.44 1.38 0 2.5-1.12 2.5-2.5 0-1-.59-1.85-1.43-2.25.84-.4 1.43-1.25 1.43-2.25 0-1.38-1.12-2.5-2.5-2.5-.53 0-1.01.16-1.42.44l.02-.19C14.5 2.12 13.38 1 12 1S9.5 2.12 9.5 3.5l.02.19c-.4-.28-.89-.44-1.42-.44-1.38 0-2.5 1.12-2.5 2.5 0 1 .59 1.85 1.43 2.25-.84.4-1.43 1.25-1.43 2.25zM12 5.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5S9.5 9.38 9.5 8s1.12-2.5 2.5-2.5zM3 13c0 4.97 4.03 9 9 9 0-4.97-4.03-9-9-9z";
      case 'health':
        return "M10.5 13H8v-3h2.5V7.5h3V10H16v3h-2.5v2.5h-3V13zM12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z";
      case 'fundraising':
        return "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z";
      default:
        return "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z";
    }
  };

  return (
    <button
      className={`
        relative overflow-hidden py-2 px-4 md:py-3 md:px-6 rounded-full font-montserrat font-semibold text-xs md:text-sm
        cursor-pointer transition-all duration-300 ease-in-out whitespace-nowrap
        flex items-center gap-1.5 md:gap-2 group transform min-w-fit
        ${isActive 
          ? 'bg-gradient-to-r from-accent1 to-accent1-light text-white border-2 border-accent1 md:translate-y-[-3px] shadow-[0_4px_15px_rgba(0,175,206,0.3)] md:shadow-[0_8px_25px_rgba(0,175,206,0.4)] md:scale-105' 
          : 'bg-white text-primary border-2 border-border/60 shadow-md'
        }
        hover:bg-gradient-to-r hover:from-accent1 hover:to-accent1-light hover:text-white hover:border-accent1 md:hover:translate-y-[-3px] hover:shadow-[0_4px_15px_rgba(0,175,206,0.3)] md:hover:shadow-[0_8px_25px_rgba(0,175,206,0.4)] md:hover:scale-105
        active:translate-y-[-1px] active:shadow-[0_4px_15px_rgba(0,175,206,0.3)] active:scale-100
        focus:outline-none focus:ring-2 focus:ring-accent1/50 focus:ring-offset-2
      `}
      onClick={onClick}
      role="tab"
      aria-selected={isActive}
      aria-label={`Filter by ${category} opportunities`}
    >
      <Icon 
        path={getCategoryIcon(category)} 
        className={`w-4 h-4 md:w-5 md:h-5 ${isActive ? 'text-white' : 'text-accent1 group-hover:text-white'} transition-all duration-300`} 
      />
      <span className="relative z-10 font-bold">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
      
      {/* Animated background shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
      
      {/* Active indicator */}
      {isActive && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
      )}
    </button>
  );
};

export default FilterTab;
