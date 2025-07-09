import React, { useState, useEffect } from 'react';
import { useAnimatedNumber } from '../../lib/useAnimatedNumber';
import { fetchMetrics } from '../../lib/metricsUtils';
import Icon from '../ui/Icon';

const MetricsDisplay = ({ 
  isVisible = true, 
  className = "", 
  layout = "grid" // "grid" or "list"
}) => {
  const [metrics, setMetrics] = useState({
    volunteersConnected: 0,
    organizationsInvolved: 0,
    hoursServed: 0
  });
  const [loading, setLoading] = useState(true);

  // Animated numbers
  const volunteersNumber = useAnimatedNumber(isVisible ? metrics.volunteersConnected : 0);
  const organizationsNumber = useAnimatedNumber(isVisible ? metrics.organizationsInvolved : 0);
  const hoursNumber = useAnimatedNumber(isVisible ? metrics.hoursServed : 0);

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

  const metricsData = [
    { 
      iconPath: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z", 
      number: volunteersNumber, 
      label: "Volunteers Connected",
      description: "Passionate individuals serving upland"
    },
    { 
      iconPath: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", 
      number: hoursNumber, 
      label: "Hours Served",
      description: "Collective time dedicated to service"
    },
    { 
      iconPath: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", 
      number: organizationsNumber, 
      label: "Organizations Involved",
      description: "Local organizations making a difference"
    }
  ];

  if (loading) {
    return (
      <div className={`flex justify-center items-center py-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent1"></div>
      </div>
    );
  }

  if (layout === "list") {
    return (
      <div className={`space-y-4 ${className}`}>
        {metricsData.map((stat, index) => (
          <div 
            key={index}
            className={`bg-white rounded-xl p-6 shadow-md border border-border/80 overflow-hidden
                       transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]
                       hover:translate-y-[-4px] hover:scale-[1.01] hover:shadow-lg hover:border-accent1/50 group transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center space-x-4">
              <div className="bg-accent1/10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-accent1/20 group-hover:scale-110">
                <Icon 
                  path={stat.iconPath} 
                  className="w-6 h-6 text-accent1 transition-all duration-300 group-hover:text-accent1" 
                />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-montserrat font-bold text-accent1 mb-1 transition-all duration-300 group-hover:text-accent1">
                  {stat.number.toLocaleString()}
                </div>
                <div className="font-source-serif text-text-secondary font-medium transition-all duration-300 group-hover:text-text-primary">
                  {stat.label}
                </div>
                <p className="font-source-serif text-sm text-text-secondary/80 leading-relaxed">
                  {stat.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default grid layout
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {metricsData.map((stat, index) => (
        <div 
          key={index}
          className={`bg-white rounded-xl md:rounded-2xl p-6 text-center shadow-md border border-border/80 overflow-hidden
                     transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]
                     hover:translate-y-[-8px] hover:scale-[1.02] hover:shadow-xl hover:border-accent1/50 group transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{ transitionDelay: `${index * 200}ms` }}
        >
          <div className="bg-accent1/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300 group-hover:bg-accent1/20 group-hover:scale-110">
            <Icon 
              path={stat.iconPath} 
              className="w-8 h-8 text-accent1 transition-all duration-300 group-hover:text-accent1" 
            />
          </div>
          <div className="text-3xl md:text-4xl font-montserrat font-bold text-accent1 mb-2 transition-all duration-300 group-hover:text-accent1">
            {stat.number.toLocaleString()}
          </div>
          <div className="font-source-serif text-text-secondary font-medium transition-all duration-300 group-hover:text-text-primary mb-2">
            {stat.label}
          </div>
          <p className="font-source-serif text-sm text-text-secondary/80 leading-relaxed">
            {stat.description}
          </p>
        </div>
      ))}
    </div>
  );
};

export default MetricsDisplay;