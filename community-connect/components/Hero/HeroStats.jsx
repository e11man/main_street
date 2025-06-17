import React, { useEffect, useRef } from 'react';
import StatItem from './StatItem';

const HeroStats = () => {
  const statsRef = useRef(null);
  
  useEffect(() => {
    if (statsRef.current) {
      const statItems = statsRef.current.querySelectorAll('.stat-item');
      statItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
          item.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        }, 300 + (index * 150)); // Staggered animation
      });
    }
  }, []);
  
  return (
    <div ref={statsRef} className="relative">
      {/* Decorative line */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-px bg-border-light"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-8 max-w-4xl mx-auto relative z-10">
        <StatItem className="stat-item" target={2547} label="Volunteers Connected" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        <StatItem className="stat-item" target={156} label="Active Projects" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        <StatItem className="stat-item" target={89} label="Communities Served" icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </div>
    </div>
  );
};

export default HeroStats;
