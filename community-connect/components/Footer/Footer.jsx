import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-white text-text-primary border-t border-border py-12 md:py-12">
      <div className="max-w-screen-xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="footer-brand">
            <h3 className="font-montserrat text-xl font-bold mb-4 text-primary">Community Connect</h3>
            <p className="font-source-serif text-sm text-text-secondary leading-relaxed">
              Connecting passionate volunteers with meaningful opportunities to create lasting change in communities worldwide.
            </p>
          </div>
          <div className="footer-section flex flex-col items-end justify-center">
            <div className="flex items-center mb-4">
              <p className="font-montserrat text-sm text-text-secondary mr-3">In partnership with</p>
              <div className="relative h-12 w-36 bg-white rounded border border-border p-1">
                <Image 
                  src="/tu_logo.png" 
                  alt="Taylor University Logo" 
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <Link href="#about" className="text-text-secondary text-sm font-source-serif hover:text-accent1 transition-colors duration-200">About</Link>
              <Link href="#contact" className="text-text-secondary text-sm font-source-serif hover:text-accent1 transition-colors duration-200">Contact</Link>
              <Link href="/company-login" className="text-text-secondary text-sm font-source-serif hover:text-accent1 transition-colors duration-200">Company Login</Link>
              <Link href="#privacy" className="text-text-secondary text-sm font-source-serif hover:text-accent1 transition-colors duration-200">Privacy Policy</Link>
              <Link href="#terms" className="text-text-secondary text-sm font-source-serif hover:text-accent1 transition-colors duration-200">Terms of Service</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-border pt-6 text-center text-text-tertiary text-sm">
          <p>&copy; 2025 Community Connect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
