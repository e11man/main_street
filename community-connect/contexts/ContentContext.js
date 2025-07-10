import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const ContentContext = createContext();

// Custom hook to use the content context
export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};

// Content provider component
export const ContentProvider = ({ children, initialContent = null }) => {
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(!initialContent);
  const [error, setError] = useState(null);

  // Fetch content on client side if not provided initially
  useEffect(() => {
    if (!initialContent) {
      fetchContent();
    }
  }, [initialContent]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/content');
      const result = await response.json();
      
      if (result.success) {
        setContent(result.data);
      } else {
        setError(result.error || 'Failed to fetch content');
      }
    } catch (err) {
      setError('Failed to fetch content');
      console.error('Error fetching content:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get content by path (e.g., 'homepage.hero.title')
  const getContent = (path, fallback = '') => {
    if (!content) return fallback;
    
    const keys = path.split('.');
    let value = content;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return fallback;
      }
    }
    
    return value || fallback;
  };

  // Get entire section
  const getSection = (section) => {
    if (!content) return {};
    return content[section] || {};
  };

  // Update content (admin only)
  const updateContent = async (newContent) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No admin token found');
      }

      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newContent })
      });

      const result = await response.json();
      
      if (result.success) {
        setContent(newContent);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error updating content:', err);
      return { success: false, error: err.message };
    }
  };

  // Initialize content (admin only)
  const initializeContent = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No admin token found');
      }

      const response = await fetch('/api/content', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        await fetchContent(); // Refresh content after initialization
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error initializing content:', err);
      return { success: false, error: err.message };
    }
  };

  const value = {
    content,
    loading,
    error,
    getContent,
    getSection,
    updateContent,
    initializeContent,
    refreshContent: fetchContent
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
};

// Higher-order component for server-side rendering
export const withContent = (Component) => {
  return function WrappedComponent(props) {
    return (
      <ContentProvider initialContent={props.initialContent}>
        <Component {...props} />
      </ContentProvider>
    );
  };
};