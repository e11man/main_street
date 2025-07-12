import { useState, useEffect } from 'react';

const useContent = (keys = []) => {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/content');
        if (!response.ok) {
          throw new Error('Failed to fetch content');
        }
        const data = await response.json();
        setContent(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

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

  return {
    content,
    getContent,
    getContentByKeys,
    loading,
    error
  };
};

export default useContent;