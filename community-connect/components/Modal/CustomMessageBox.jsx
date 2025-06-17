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
      <p className="mb-5 text-base">{message}</p>
      <Button variant="primary" onClick={onClose} className="w-auto px-5 py-2.5">
        OK
      </Button>
    </div>
  );
};

export default CustomMessageBox;
