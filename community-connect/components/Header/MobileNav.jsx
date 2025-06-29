// components/layout/MobileNav.jsx

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Button from '../ui/Button';

const MobileNav = ({ isOpen, navLinks, closeMenu, openModal }) => {
  const navRef = useRef(null);

  // Trap focus inside mobile nav when open (accessibility)
  useEffect(() => {
    if (!isOpen) return;
    const focusableSelectors =
      'a, button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const focusableEls = navRef.current
      ? navRef.current.querySelectorAll(focusableSelectors)
      : [];
    if (focusableEls.length) {
      focusableEls[0].focus();
    }
    const handleTab = (e) => {
      if (!isOpen) return;
      const firstEl = focusableEls[0];
      const lastEl = focusableEls[focusableEls.length - 1];
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
      if (e.key === 'Escape') {
        closeMenu();
      }
    };
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen, closeMenu]);

  // Animate in/out
  return (
    <aside
      ref={navRef}
      className={`fixed inset-0 z-[100] md:hidden transition-all duration-300 ${
        isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeMenu}
      />
      {/* Drawer */}
      <nav
        className={`absolute top-0 right-0 h-full w-4/5 max-w-xs shadow-2xl flex flex-col pt-8 pb-10 px-7 transition-transform duration-300 rounded-l-2xl bg-white ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Close button */}
        <button
          className="self-end mb-6 p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition shadow"
          aria-label="Close menu"
          onClick={closeMenu}
          tabIndex={isOpen ? 0 : -1}
        >
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l16 16M6 22L22 6" />
          </svg>
        </button>
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 mb-10 font-bold text-primary text-xl tracking-tight"
          onClick={closeMenu}
          tabIndex={isOpen ? 0 : -1}
        >
          <img src="/logo.svg" alt="Community Connect Logo" className="h-10 w-auto object-contain" />
          <span className="text-lg">Community Connect</span>
        </Link>
        {/* Nav links */}
        <ul className="flex flex-col gap-3 mb-10">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                href={link.href}
                className="block px-4 py-3 rounded-xl font-medium text-base transition-colors duration-200 text-secondary hover:bg-gray-100 focus:bg-gray-200 focus:outline-none"
                onClick={closeMenu}
                tabIndex={isOpen ? 0 : -1}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
        {/* CTA Button */}
        <Button
          onClick={() => {
            closeMenu();
            if (openModal) openModal();
          }}
          variant="primary"
          className="w-full py-3 text-base font-semibold shadow-md hover:shadow-lg rounded-xl"
          tabIndex={isOpen ? 0 : -1}
        >
          Request Volunteers
        </Button>
        <div className="flex-1" />
        {/* Footer */}
        <div className="mt-10 text-xs text-gray-400 text-center">
          &copy; {new Date().getFullYear()} Community Connect
        </div>
      </nav>
    </aside>
  );
};

export default MobileNav; 