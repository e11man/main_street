import React, { forwardRef, useState, useEffect } from 'react';
import Link from 'next/link';
import HeroStats from './HeroStats';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import useContent from '../../lib/useContent';

const HeroSection = forwardRef(({ content, ...props }, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const { content: dynamicContent } = useContent();
  const mergedContent = { ...dynamicContent, ...content };

  const getContent = (key, defaultValue = '') => {
    return mergedContent[key] || defaultValue;
  };
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToOpportunities = () => {
    const opportunitiesSection = document.getElementById('opportunities');
    if (opportunitiesSection) {
      opportunitiesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="pt-18 relative overflow-hidden bg-gradient-to-b from-background to-surface">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute top-0 left-0 right-0 h-full w-full bg-[radial-gradient(#1B365F_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-24 h-24 bg-accent1/10 rounded-full blur-2xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float animation-delay-1000"></div>
      <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-accent2/10 rounded-full blur-xl animate-float animation-delay-2000"></div>
      
      <div ref={ref} className="max-w-screen-xl mx-auto px-6 md:px-8 py-20 md:py-32 text-center relative z-10">
        <div className={`transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

          
          <h1 className="hero-title relative font-montserrat text-clamp-36-64 font-extrabold mb-8 md:mb-10 tracking-[-0.025em] text-primary leading-tight inline-block">
{getContent('hero.title', 'Make the Connection')}
            <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary to-accent1 rounded-full"></span>
          </h1>
          
          <p className="font-source-serif text-clamp-18-24 font-normal text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
{getContent('hero.subtitle', 'Connect with meaningful opportunities that create lasting impact in upland.')}
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Button 
              variant="primary" 
              className="group text-base px-8 py-4 shadow-lg hover:shadow-xl"
              onClick={scrollToOpportunities}
            >
{getContent('hero.cta.primary', 'Find Opportunities')}
              <Icon 
                path="M13 7l5 5m0 0l-5 5m5-5H6" 
                className="ml-2 w-5 h-5 inline-block transition-transform group-hover:translate-x-1"
              />
            </Button>
            <Link href="/about">
              <Button 
                variant="outline" 
                className="text-base px-8 py-4"
              >
{getContent('hero.cta.secondary', 'Learn More')}
              </Button>
            </Link>
          </div>
          <HeroStats content={mergedContent} />
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';

export default HeroSection;
