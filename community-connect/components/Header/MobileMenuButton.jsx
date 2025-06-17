import React from 'react';

const MobileMenuButton = ({ isOpen, toggleMenu }) => {
  return (
    <button
      className="md:hidden relative bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg cursor-pointer p-2.5 text-text-primary transition-all duration-300 hover:text-primary hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20 active:scale-95"
      onClick={toggleMenu}
      aria-label="Toggle mobile menu"
      aria-expanded={isOpen}
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        <span 
          className={`absolute block h-0.5 w-5 bg-current transform transition-all duration-300 ease-in-out ${isOpen ? 'rotate-45' : '-translate-y-1.5'}`}
        />
        <span 
          className={`absolute block h-0.5 w-5 bg-current transform transition-all duration-300 ease-in-out ${isOpen ? 'opacity-0' : 'opacity-100'}`}
        />
        <span 
          className={`absolute block h-0.5 w-5 bg-current transform transition-all duration-300 ease-in-out ${isOpen ? '-rotate-45' : 'translate-y-1.5'}`}
        />
      </div>
    </button>
  );
};


export default MobileMenuButton;
