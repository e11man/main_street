import React, { forwardRef, useEffect } from 'react';
import Link from 'next/link';

const MobileNav = forwardRef(({ isOpen, navLinks, activeLink, setActiveLink, closeMenu }, ref) => {
  useEffect(() => {
    // Animate menu items when opening
    if (isOpen) {
      const menuItems = ref.current?.querySelectorAll('li');
      menuItems?.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(10px)';
        setTimeout(() => {
          item.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        }, 75 * index);
      });
    }
  }, [isOpen, ref]);

  return (
    <div
      ref={ref}
      className={`md:hidden fixed top-16 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-border z-40 shadow-lg transition-all duration-300 ease-in-out
                  ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-[-100%] opacity-0 pointer-events-none'}`}
    >
      <div className="max-w-screen-xl mx-auto px-6 py-5">
        <ul className="list-none space-y-2">
          {navLinks.map((link) => {
            const isActive = activeLink === link.href.substring(1);
            return (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className={`flex items-center justify-between ${isActive ? 'bg-primary/5 text-primary font-semibold' : 'text-text-primary'} 
                             font-montserrat font-medium text-base py-4 px-5 rounded-lg hover:bg-gray-50 hover:text-accent1 
                             transition-all duration-200 relative overflow-hidden`}
                  onClick={() => {
                    setActiveLink(link.href.substring(1));
                    closeMenu();
                  }}
                >
                  <span className="relative z-10">{link.name}</span>
                  {isActive && (
                    <span className="flex items-center">
                      <span className="mr-2 text-sm text-primary/70">Active</span>
                      <span className="inline-block w-2 h-2 bg-accent1 rounded-full"></span>
                    </span>
                  )}
                  {isActive && <span className="absolute left-0 top-0 h-full w-1 bg-accent1"></span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
});


MobileNav.displayName = 'MobileNav';

export default MobileNav;
