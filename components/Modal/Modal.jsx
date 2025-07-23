import React, { useEffect, useRef } from 'react';
import { useClickOutside } from '../../lib/hooks';

const Modal = ({ isOpen, onClose, title, children }) => {
  const modalContentRef = useRef(null);

  // Close modal when clicking outside content
  useClickOutside(modalContentRef, (event) => {
    // Only close if the click is directly on the modal overlay, not its children
    if (event.target === event.currentTarget) {
      onClose();
    }
  });

  // Close modal with escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose} // Allow clicking backdrop to close
    >
      <div
        ref={modalContentRef}
        className="bg-white rounded-lg md:rounded-xl shadow-xl max-w-lg w-11/12 md:w-9/12 lg:w-full max-h-[90vh] overflow-y-auto animate-slideUp"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
      >
        {title && (
          <div className="px-6 pt-6 flex justify-between items-center">
            <h2 className="font-montserrat text-2xl font-bold text-primary m-0">{title}</h2>
            <button
              className="bg-none border-none text-2xl cursor-pointer text-text-secondary p-2 rounded-md transition-all duration-200 hover:bg-surface hover:text-text-primary"
              onClick={onClose}
              aria-label="Close modal"
            >
              &times;
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;
