import React, { createContext, useContext, useState, useEffect } from 'react';
import { staticContent } from '../lib/content/index.js';

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
  const [content, setContent] = useState(initialContent || staticContent);
  const [loading, setLoading] = useState(!initialContent && !staticContent);
  const [error, setError] = useState(null);

  // Use static content if no initial content provided
  useEffect(() => {
    if (!initialContent && !content) {
      setContent(staticContent);
      setLoading(false);
    }
  }, [initialContent, content]);

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

  // Update content (now just a stub since content is static)
  const updateContent = async (newContent) => {
    console.warn('Content is now static and cannot be updated dynamically. Please edit the content files directly.');
    return { success: false, error: 'Content is now static and cannot be updated dynamically' };
  };

  // Initialize content (now just a stub since content is static)
  const initializeContent = async () => {
    console.warn('Content is now static and does not need initialization.');
    return { success: true, message: 'Content is already static' };
  };

  // Refresh content (now just returns static content)
  const refreshContent = async () => {
    setContent(staticContent);
    setLoading(false);
    setError(null);
  };

  const value = {
    content,
    loading,
    error,
    getContent,
    getSection,
    updateContent,
    initializeContent,
    refreshContent
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