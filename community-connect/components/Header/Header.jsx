// components/layout/Header.jsx

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Button from '../ui/Button';
import MobileMenuButton from './MobileMenuButton';
import MobileNav from './MobileNav';

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Opportunities', href: '/#opportunities' },
  { name: 'Contact', href: '/#contact' },
];

const Header = ({ openModal }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

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
      className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 font-montserrat"
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
                  className="relative px-2 py-1 text-secondary hover:text-accent1 font-medium transition-colors duration-200 after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-accent1 after:transition-all after:duration-300 hover:after:w-full"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
          <Button
            onClick={openModal}
            variant="primary"
            className="ml-4 shadow-sm hover:shadow-md whitespace-nowrap"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Request Volunteers
          </Button>
        </nav>

        {/* Mobile: CTA + Hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <Button
            onClick={openModal}
            variant="primary"
            className="text-xs px-3 py-2 shadow-sm rounded-lg font-medium transition-all duration-300 hover:shadow-md active:scale-95 whitespace-nowrap"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Request Volunteers
          </Button>
          <MobileMenuButton isOpen={mobileOpen} toggleMenu={() => setMobileOpen(v => !v)} />
        </div>
      </div>
      <MobileNav
        isOpen={mobileOpen}
        navLinks={NAV_LINKS}
        closeMenu={() => setMobileOpen(false)}
        openModal={openModal}
      />
    </header>
  );
};

export default Header;
