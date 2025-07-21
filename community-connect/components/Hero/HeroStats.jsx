import React, { useEffect, useRef, useState } from 'react';
import StatItem from './StatItem';
import { fetchMetrics } from '../../lib/metricsUtils';
import useContent from '../../lib/useContent';

const HeroStats = () => {
  const statsRef = useRef(null);
  const [metrics, setMetrics] = useState({
    volunteersConnected: 0,
    organizationsInvolved: 0,
    hoursServed: 0
  });
  const [loading, setLoading] = useState(true);
  const { content, loading: contentLoading, error: contentError } = useContent();

  const getContent = (key) => {
    if (contentLoading) return '';
    if (contentError) throw new Error(`Failed to fetch content from MongoDB: ${contentError}`);
    if (!content[key]) throw new Error(`Content not found in MongoDB for key: ${key}`);
    return content[key];
  };
  
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        const fetchedMetrics = await fetchMetrics();
        setMetrics(fetchedMetrics);
      } catch (error) {
        console.error('Error loading metrics:', error);
        // Keep default values if fetch fails
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, []);

  useEffect(() => {
    if (statsRef.current && !loading) {
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
  }, [loading]);

  // Show content loading state
  if (contentLoading) {
    return (
      <div ref={statsRef} className="relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-px bg-border-light"></div>
        <div className="flex flex-col gap-6 md:grid md:grid-cols-3 md:gap-8 mt-8 max-w-4xl mx-auto relative z-10">
          <div className="text-center p-6 md:p-8 bg-white/95 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
            <div className="text-primary">Loading stats content from MongoDB...</div>
          </div>
        </div>
      </div>
    );
  }

  // Show content error state
  if (contentError) {
    return (
      <div ref={statsRef} className="relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-px bg-border-light"></div>
        <div className="flex flex-col gap-6 md:grid md:grid-cols-3 md:gap-8 mt-8 max-w-4xl mx-auto relative z-10">
          <div className="col-span-3 text-center p-6 bg-red-100 rounded-xl border border-red-200">
            <div className="text-red-600">
              <h3 className="font-bold mb-2">MongoDB Content Error</h3>
              <p>Failed to load stats content: {contentError}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div ref={statsRef} className="relative">
        {/* Decorative line */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-px bg-border-light"></div>
        
        <div className="flex flex-col gap-6 md:grid md:grid-cols-3 md:gap-8 mt-8 max-w-4xl mx-auto relative z-10">
          <div className="text-center p-6 md:p-8 bg-white/95 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="text-center p-6 md:p-8 bg-white/95 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="text-center p-6 md:p-8 bg-white/95 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  try {
    return (
      <div ref={statsRef} className="relative">
        {/* Decorative line */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-px bg-border-light"></div>
        
        <div className="flex flex-col gap-6 md:grid md:grid-cols-3 md:gap-8 mt-8 max-w-4xl mx-auto relative z-10">
          <StatItem
            className="stat-item"
            target={metrics.volunteersConnected}
            label={getContent('stats.volunteers.label')}
            icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5 15.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9 19.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
          <StatItem
            className="stat-item"
            target={metrics.hoursServed}
            label={getContent('stats.impact.label')}
            icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
          <StatItem 
            className="stat-item" 
            target={metrics.organizationsInvolved} 
            label={getContent('stats.organizations.label')} 
            icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
          />
        </div>
      </div>
    );
  } catch (contentError) {
    return (
      <div ref={statsRef} className="relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-px bg-border-light"></div>
        <div className="flex flex-col gap-6 md:grid md:grid-cols-3 md:gap-8 mt-8 max-w-4xl mx-auto relative z-10">
          <div className="col-span-3 text-center p-6 bg-red-100 rounded-xl border border-red-200">
            <div className="text-red-600">
              <h3 className="font-bold mb-2">Content Missing Error</h3>
              <p>{contentError.message}</p>
              <p className="text-sm mt-2">Stats section requires content to be present in MongoDB.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default HeroStats;
