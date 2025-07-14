import { useState, useEffect, useCallback } from 'react';
import { registerRefreshCallback } from './contentRefresh';

const useContent = (keys = []) => {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const fetchContent = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      // Add cache-busting timestamp to ensure fresh data
      const timestamp = Date.now();
      const url = `/api/content?t=${timestamp}&fresh=${forceRefresh ? 'true' : 'false'}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Requested-With': 'XMLHttpRequest',
          'X-Cache-Bust': timestamp.toString()
        },
        // Disable browser caching
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }
      
      const data = await response.json();
      
      // Remove internal fields from content
      const { _timestamp, _fresh, ...cleanContent } = data;
      
      setContent(cleanContent);
      setLastFetch(timestamp);
      setError(null);
      
      console.log('✅ Fresh content loaded from MongoDB at:', new Date(timestamp).toLocaleTimeString());
    } catch (err) {
      setError(err.message);
      console.error('Error fetching content:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent(true); // Force fresh fetch on mount
    
    // Register this component for global refresh
    const unregister = registerRefreshCallback(() => fetchContent(true));
    
    return () => {
      unregister();
    };
  }, [fetchContent]);

  const getContent = (key, defaultValue = '') => {
    return content[key] || defaultValue;
  };

  const getContentByKeys = (keys) => {
    if (Array.isArray(keys)) {
      return keys.reduce((acc, key) => {
        acc[key] = content[key] || '';
        return acc;
      }, {});
    }
    return content[keys] || '';
  };

  const refreshContent = () => {
    fetchContent(true);
  };

  return {
    content,
    getContent,
    getContentByKeys,
    loading,
    error,
    lastFetch,
    refreshContent
  };
};

export default useContent;