// components/layout/MobileMenuButton.jsx

import React from 'react';

const MobileMenuButton = ({ isOpen, toggleMenu }) => (
  <button
    aria-label={isOpen ? 'Close menu' : 'Open menu'}
    onClick={toggleMenu}
    className="inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent1 transition"
    type="button"
  >
    <span className="sr-only">{isOpen ? 'Close menu' : 'Open menu'}</span>
    <div className="relative w-6 h-6">
      <span
        className={`block absolute h-0.5 w-6 bg-primary transform transition duration-300 ease-in-out ${
          isOpen ? 'rotate-45 top-3' : 'top-1'
        }`}
      />
      <span
        className={`block absolute h-0.5 w-6 bg-primary transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-0' : 'opacity-100 top-3'
        }`}
      />
      <span
        className={`block absolute h-0.5 w-6 bg-primary transform transition duration-300 ease-in-out ${
          isOpen ? '-rotate-45 top-3' : 'top-5'
        }`}
      />
    </div>
  </button>
);

export default MobileMenuButton;
