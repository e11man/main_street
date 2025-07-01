import React, { useEffect } from 'react';
import Button from '../ui/Button';

const CustomMessageBox = ({ message, onClose }) => {
  useEffect(() => {
    // Add keyframe rule dynamically
    const styleSheet = document.styleSheets[0];
    if (![...styleSheet.cssRules].some(rule => rule.name === 'fadeInMessageBox')) {
      const keyframes = `
        @keyframes fadeInMessageBox {
          from { opacity: 0; transform: translate(-50%, -60%); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
      `;
      styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
    }
  }, []);

  return (
    <div
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-lg shadow-xl z-[9999] text-center font-montserrat text-text-primary max-w-md w-11/12
                 opacity-0 animate-fadeInMessageBox"
    >
      <p className="mb-6 text-base leading-relaxed">{message}</p>
      <Button 
        variant="primary" 
        onClick={onClose} 
        className="w-full sm:w-auto min-w-[120px] px-6 py-3 rounded-lg font-semibold text-base transition-all duration-200 hover:scale-105 active:scale-95"
      >
        OK
      </Button>
    </div>
  );
};

export default CustomMessageBox;
