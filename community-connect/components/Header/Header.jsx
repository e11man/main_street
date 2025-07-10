// components/layout/Header.jsx

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useContent } from '../../contexts/ContentContext.js';
import Button from '../ui/Button';
import MobileMenuButton from './MobileMenuButton';
import MobileNav from './MobileNav';
import GuidelinesModal from '../Guidelines/GuidelinesModal.jsx';

const Header = ({ openModal }) => {
  const { getContent } = useContent();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);

  // Navigation links with dynamic content
  const NAV_LINKS = [
    { name: getContent('navigation.home', 'Home'), href: '/' },
    { name: getContent('navigation.about', 'About'), href: '/about' },
    { name: getContent('navigation.opportunities', 'Opportunities'), href: '/#opportunities' },
    { name: 'Safety Guidelines', href: '/guidelines' },
    { name: getContent('navigation.contact', 'Contact'), href: '/#contact' },
  ];

  // Lock scroll when mobile nav is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <header
      className="sticky top-0 z-50 w-full bg-background border-b border-border font-montserrat"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      <div className="max-w-screen-xl mx-auto flex items-center justify-between h-16 px-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 font-bold text-primary text-lg md:text-xl tracking-tight">
          <img src="/logo.svg" alt="Community Connect Logo" className="h-9 w-auto object-contain" />
          <span className="hidden sm:inline text-base md:text-xl">Community Connect</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <ul className="flex gap-6">
            {NAV_LINKS.map(link => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="relative px-2 py-1 text-text-secondary hover:text-accent1 font-medium transition-colors duration-200 after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-accent1 after:transition-all after:duration-300 hover:after:w-full"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
          <button
            onClick={() => setShowGuidelines(true)}
            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
            title="Safety Guidelines"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <Button
            onClick={openModal}
            variant="primary"
            className="ml-4 shadow-sm hover:shadow-md whitespace-nowrap"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {getContent('modals.volunteer.title', 'Request Volunteers')}
          </Button>
        </nav>

        {/* Mobile: CTA + Hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setShowGuidelines(true)}
            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
            title="Safety Guidelines"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <Button
            onClick={openModal}
            variant="primary"
            className="text-xs px-3 py-2 shadow-sm rounded-lg font-medium transition-all duration-300 hover:shadow-md active:scale-95 whitespace-nowrap"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {getContent('modals.volunteer.title', 'Request Volunteers')}
          </Button>
          <MobileMenuButton isOpen={mobileOpen} toggleMenu={() => setMobileOpen(v => !v)} />
        </div>
      </div>
      <MobileNav
        isOpen={mobileOpen}
        navLinks={NAV_LINKS}
        closeMenu={() => setMobileOpen(false)}
        openModal={openModal}
        openGuidelines={() => setShowGuidelines(true)}
      />
      
      {/* Guidelines Modal */}
      <GuidelinesModal
        isOpen={showGuidelines}
        onClose={() => setShowGuidelines(false)}
        userType="user"
      />
    </header>
  );
};

export default Header;
