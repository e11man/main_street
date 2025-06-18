import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../ui/Button';
import MobileMenuButton from './MobileMenuButton';
import MobileNav from './MobileNav';
import { useHeaderScrollBehavior, useClickOutside } from '../../lib/hooks';

const Header = ({ openModal }) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('about');
  const headerRef = useRef(null);
  const mobileNavRef = useRef(null);

  useHeaderScrollBehavior(headerRef, mobileNavRef);

  // Close mobile nav when clicking outside header/mobile nav
  const headerAndNavRef = useRef(null);
  useClickOutside(headerAndNavRef, () => {
    setIsMobileNavOpen(false);
  });

  // Effect to handle body scroll lock for mobile menu
  useEffect(() => {
    if (isMobileNavOpen && window.innerWidth <= 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = ''; // Cleanup on unmount
    };
  }, [isMobileNavOpen]);

  // Handle scroll to section and set active link
  useEffect(() => {
    const handleScroll = () => {
      const sections = navLinks.map(link => link.href.substring(1));
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveLink(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Opportunities', href: '#opportunities' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header
      ref={headerRef}
      className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-border z-50 transition-all duration-300 ease-in-out
                 data-[scrolled=true]:bg-white/98 data-[scrolled=true]:shadow-md data-[scrolled=true]:h-16"
    >
      <div ref={headerAndNavRef} className="max-w-screen-xl mx-auto px-6 md:px-8 flex items-center justify-between h-16 transition-all duration-300 ease-in-out">
        <Link href="/" className="flex items-center gap-3 font-montserrat text-lg md:text-xl font-bold text-primary tracking-tight transition-transform duration-300 hover:translate-y-[-1px]">
          <img src="/logo.svg" alt="Community Connect Logo" className="h-9 md:h-10 w-auto object-contain" />
          <span className="text-sm md:text-base lg:text-xl">Community Connect</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <ul className="flex gap-8 list-none">
            {navLinks.map((link) => {
              const isAnchorLink = link.href.startsWith('#');
              const isActive = isAnchorLink ? activeLink === link.href.substring(1) : false;
              return (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className={`text-${isActive ? 'primary font-semibold' : 'text-secondary'} font-montserrat text-sm relative transition-colors duration-300
                               after:content-[''] after:absolute after:w-${isActive ? 'full' : '0'} after:h-[2px] after:bottom-[-4px] after:left-0 after:bg-accent1 after:transition-all after:duration-300
                               hover:text-accent1 hover:after:w-full`}
                    onClick={() => isAnchorLink && setActiveLink(link.href.substring(1))}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center gap-4">
         
            <Button onClick={openModal} variant="primary" className="shadow-sm hover:shadow-md whitespace-nowrap">
              Request Volunteers
            </Button>
          </div>
        </nav>

        <div className="md:hidden flex items-center gap-3">
          <Link 
            href="/company-login" 
            className="text-text-secondary text-xs font-montserrat hover:text-accent1 transition-colors duration-200"
          >
            Company Login
          </Link>
          <Button 
            onClick={openModal} 
            variant="primary" 
            className="text-xs px-3 py-2 shadow-sm rounded-lg font-medium transition-all duration-300 hover:shadow-md active:scale-95 whitespace-nowrap"
          >
            Request Volunteers
          </Button>
          <MobileMenuButton isOpen={isMobileNavOpen} toggleMenu={() => setIsMobileNavOpen(!isMobileNavOpen)} />
        </div>
      </div>
      <MobileNav 
        ref={mobileNavRef} 
        isOpen={isMobileNavOpen} 
        navLinks={navLinks} 
        activeLink={activeLink}
        setActiveLink={setActiveLink}
        closeMenu={() => setIsMobileNavOpen(false)} 
      />
    </header>
  );
};

export default Header;
