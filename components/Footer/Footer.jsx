import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Icon from '../ui/Icon';
import useContent from '../../lib/useContent';

const Footer = ({ content }) => {
  const getContent = (key, defaultValue = '') => {
    return content?.[key] || defaultValue;
  };
  
  return (
    <footer className="bg-gradient-to-b from-surface/30 to-surface/60 text-text-primary border-t-4 border-accent1/20 py-16 md:py-20 mt-16">
      <div className="max-w-screen-xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <div className="footer-brand">
            <h3 className="font-montserrat text-2xl font-bold mb-6 text-primary flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-accent1 to-accent1-light rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">CC</span>
              </div>
              Community Connect
            </h3>
            <p className="font-source-serif text-base text-text-secondary leading-relaxed mb-6">
{getContent('footer.tagline', 'Connecting passionate volunteers with meaningful opportunities to create lasting change in upland.')}
            </p>
            <div className="flex gap-4">
              <div className="bg-accent1/10 px-4 py-2 rounded-full flex items-center gap-2">
                <Icon path="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.79 3.05h-1.96c-.1-1.05-.82-1.87-2.65-1.87-1.96 0-2.4.98-2.4 1.59 0 .83.44 1.61 2.67 2.14 2.48.6 4.18 1.62 4.18 3.67 0 1.72-1.39 2.84-3.11 3.21z" className="w-5 h-5 text-accent1" />
                <span className="text-accent1 font-semibold text-sm">Supporting Upland</span>
              </div>
              <div className="bg-accent1/10 px-4 py-2 rounded-full flex items-center gap-2">
                <Icon path="M13 16h-1v-4h-1V9h2v3h1v4zm-1-14C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" className="w-5 h-5 text-accent1" />
                <span className="text-accent1 font-semibold text-sm">Creating Impact</span>
              </div>
            </div>
          </div>
          <div className="footer-section flex flex-col items-start md:items-end justify-center">
            <div className="flex items-center mb-6 bg-white/80 p-4 rounded-xl shadow-sm border border-border/30">
              <p className="font-montserrat text-sm text-text-secondary mr-4 font-medium">In partnership with</p>
              <div className="relative h-12 w-36 bg-white rounded-lg border border-border/50 p-2 shadow-sm">
                <Image 
                  src="/tu_logo.png" 
                  alt="Taylor University Logo" 
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <Link href="/about" className="text-text-secondary text-sm font-montserrat font-medium hover:text-accent1 transition-all duration-200 hover:scale-105 flex items-center gap-1">
                <Icon path="M12 4v16m8-8H4" className="w-4 h-4 text-accent1" /> {getContent('nav.about', 'About')}
              </Link>
              <Link href="/#contact" className="text-text-secondary text-sm font-montserrat font-medium hover:text-accent1 transition-all duration-200 hover:scale-105 flex items-center gap-1">
                <Icon path="M21 8V7a2 2 0 00-2-2H5a2 2 0 00-2 2v1m18 0v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8m18 0l-9 6-9-6" className="w-4 h-4 text-accent1" /> {getContent('nav.contact', 'Contact')}
              </Link>
              <Link href="/#opportunities" className="text-text-secondary text-sm font-montserrat font-medium hover:text-accent1 transition-all duration-200 hover:scale-105 flex items-center gap-1">
                <Icon path="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" className="w-4 h-4 text-accent1" /> {getContent('nav.opportunities', 'Opportunities')}
              </Link>
              <Link href="/organization-login" className="text-text-secondary text-sm font-montserrat font-medium hover:text-accent1 transition-all duration-200 hover:scale-105 flex items-center gap-1">
                <Icon path="M3 7v4a1 1 0 001 1h3v2a2 2 0 002 2h2a2 2 0 002-2v-2h3a1 1 0 001-1V7a1 1 0 00-1-1H4a1 1 0 00-1 1zm16 0V5a2 2 0 00-2-2H7a2 2 0 00-2 2v2" className="w-4 h-4 text-accent1" /> {getContent('nav.org_login', 'Organization Login')}
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t-2 border-gradient-to-r from-accent1/20 via-accent1/40 to-accent1/20 pt-8 text-center">
          <div className="bg-white/60 rounded-full px-6 py-3 inline-block border border-border/30">
             <p className="text-text-tertiary text-sm font-medium">{getContent('footer.copyright', '© 2025 Community Connect. All rights reserved. Made with ❤️ for upland.')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
