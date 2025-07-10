import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useContent } from '../contexts/ContentContext.js';
import { verifyAdminToken } from '../lib/authUtils.js';
import { getFieldDescriptions } from '../lib/contentManager.js';
import QuickNav from '../components/ContentAdmin/QuickNav.jsx';

export default function ContentAdmin({ initialContent }) {
  const { content, loading, error, updateContent, initializeContent, refreshContent } = useContent();
  const [editingContent, setEditingContent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [expandedSections, setExpandedSections] = useState(new Set(['homepage'])); // Start with homepage expanded
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showPreview, setShowPreview] = useState(false);
  const [pageError, setPageError] = useState(null);
  
  let fieldDescriptions = {};
  try {
    fieldDescriptions = getFieldDescriptions();
  } catch (error) {
    console.error('Error loading field descriptions:', error);
    fieldDescriptions = {};
  }

  useEffect(() => {
    if (content) {
      try {
        setEditingContent(JSON.parse(JSON.stringify(content)));
      } catch (error) {
        console.error('Error setting editing content:', error);
        setPageError('Failed to load content for editing');
      }
    }
  }, [content]);

  // Handle errors
  if (pageError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Content Management Error</h1>
          <p className="text-red-600 mb-4">{pageError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!editingContent) return;
    
    setSaving(true);
    setMessage('');
    
    try {
      const result = await updateContent(editingContent);
      
      if (result.success) {
        setMessage('✅ Content saved successfully! Changes are now live on the site.');
        setTimeout(() => setMessage(''), 5000);
        
        // Refresh the content to ensure we have the latest version
        await refreshContent();
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleInitialize = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      const result = await initializeContent();
      
      if (result.success) {
        setMessage('✅ Content initialized successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const updateNestedValue = (path, value) => {
    if (!editingContent) return;
    
    const keys = path.split('.');
    const newContent = JSON.parse(JSON.stringify(editingContent));
    let current = newContent;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setEditingContent(newContent);
  };

  const toggleSection = (section) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Content organization with descriptions
  const contentSections = {
    homepage: {
      title: "🏠 Homepage",
      description: "Main landing page content including hero section, search, and CTAs",
      icon: "🏠",
      color: "blue"
    },
    about: {
      title: "ℹ️ About Page", 
      description: "About page content including mission, impact, and program descriptions",
      icon: "ℹ️",
      color: "green"
    },
    navigation: {
      title: "🧭 Navigation",
      description: "Menu items, navigation labels, and header content",
      icon: "🧭", 
      color: "purple"
    },
    footer: {
      title: "🦶 Footer",
      description: "Footer content, links, and social media labels",
      icon: "🦶",
      color: "gray"
    },
    common: {
      title: "🔧 Common UI",
      description: "Reusable UI elements like buttons, messages, and labels",
      icon: "🔧",
      color: "orange"
    },
    modals: {
      title: "📋 Modals & Forms",
      description: "Modal content, form labels, and authentication text",
      icon: "📋",
      color: "pink"
    }
  };

  const renderEditableField = (path, value, label) => {
    const isExpanded = expandedSections.has(path);
    
    // Get field description from the descriptions object
    const getFieldDescription = (path) => {
      const keys = path.split('.');
      let current = fieldDescriptions;
      
      for (const key of keys) {
        if (current && current[key]) {
          current = current[key];
        } else {
          return '';
        }
      }
      
      return typeof current === 'string' ? current : '';
    };
    
    const description = getFieldDescription(path);
    
    return (
      <div key={path} className="mb-6 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              {label}
            </label>
            {description && (
              <p className="text-xs text-gray-500 mb-2">{description}</p>
            )}
          </div>
          <button
            onClick={() => toggleSection(path)}
            className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {isExpanded ? '✏️ Edit' : '👁️ View'}
          </button>
        </div>
        
        {isExpanded ? (
          <div className="space-y-3">
            <textarea
              value={value || ''}
              onChange={(e) => updateNestedValue(path, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={value && value.length > 100 ? 4 : 2}
              placeholder={`Enter ${label.toLowerCase()}...`}
            />
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Characters: {value ? value.length : 0}</span>
              <span>Path: {path}</span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded border">
            {value ? (
              <div>
                <div className="font-medium mb-1">Current content:</div>
                <div className="text-gray-600">
                  {value.length > 150 ? `${value.substring(0, 150)}...` : value}
                </div>
              </div>
            ) : (
              <div className="text-gray-500 italic">No content set</div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderContentSection = (sectionKey, sectionData, sectionInfo) => {
    const isExpanded = expandedSections.has(sectionKey);
    
    return (
      <div key={sectionKey} className="border border-gray-200 rounded-lg mb-6 overflow-hidden">
        <div className={`bg-gradient-to-r from-${sectionInfo.color}-50 to-${sectionInfo.color}-100 px-6 py-4 border-b border-gray-200`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{sectionInfo.icon}</span>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {sectionInfo.title}
                </h3>
                <p className="text-sm text-gray-600">{sectionInfo.description}</p>
              </div>
            </div>
            <button
              onClick={() => toggleSection(sectionKey)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {isExpanded ? '▼ Collapse' : '▶ Expand'}
            </button>
          </div>
        </div>
        
        {isExpanded && (
          <div className="p-6 bg-gray-50">
            {Object.entries(sectionData).map(([key, value]) => {
              const fieldPath = `${sectionKey}.${key}`;
              const fieldLabel = key.replace(/([A-Z])/g, ' $1').trim();
              
              if (typeof value === 'object' && value !== null) {
                return renderNestedSection(key, value, fieldPath, fieldLabel);
              } else {
                return renderEditableField(fieldPath, value, fieldLabel);
              }
            })}
          </div>
        )}
      </div>
    );
  };

  const renderNestedSection = (sectionKey, sectionData, parentPath, parentLabel) => {
    const isExpanded = expandedSections.has(parentPath);
    
    return (
      <div key={parentPath} className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-md font-semibold text-gray-800 capitalize">
            {parentLabel}
          </h4>
          <button
            onClick={() => toggleSection(parentPath)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>
        
        {isExpanded && (
          <div className="ml-4 space-y-4">
            {Object.entries(sectionData).map(([key, value]) => {
              const fieldPath = `${parentPath}.${key}`;
              const fieldLabel = key.replace(/([A-Z])/g, ' $1').trim();
              
              if (typeof value === 'object' && value !== null) {
                return renderNestedSection(key, value, fieldPath, fieldLabel);
              } else {
                return renderEditableField(fieldPath, value, fieldLabel);
              }
            })}
          </div>
        )}
      </div>
    );
  };

  const filteredSections = editingContent ? 
    Object.entries(editingContent).filter(([sectionKey, sectionData]) => {
      // If activeTab is set, only show that section
      if (activeTab && activeTab !== 'all' && sectionKey !== activeTab) {
        return false;
      }
      
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      const sectionInfo = contentSections[sectionKey];
      
      // Search in section title and description
      if (sectionInfo) {
        if (sectionInfo.title.toLowerCase().includes(searchLower) || 
            sectionInfo.description.toLowerCase().includes(searchLower)) {
          return true;
        }
      }
      
      // Search within section content
      const searchInSection = (data, path = '') => {
        for (const [key, value] of Object.entries(data)) {
          const currentPath = path ? `${path}.${key}` : key;
          
          if (typeof value === 'string' && value.toLowerCase().includes(searchLower)) {
            return true;
          } else if (typeof value === 'object' && value !== null) {
            if (searchInSection(value, currentPath)) return true;
          }
        }
        return false;
      };
      
      return searchInSection(sectionData);
    }) : [];

  const getSearchResults = () => {
    if (!searchTerm || !editingContent) return [];
    
    const results = [];
    const searchLower = searchTerm.toLowerCase();
    
    const searchInSection = (data, path = '') => {
      for (const [key, value] of Object.entries(data)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (typeof value === 'string' && value.toLowerCase().includes(searchLower)) {
          results.push({
            path: currentPath,
            value: value,
            label: key.replace(/([A-Z])/g, ' $1').trim()
          });
        } else if (typeof value === 'object' && value !== null) {
          searchInSection(value, currentPath);
        }
      }
    };
    
    Object.entries(editingContent).forEach(([sectionKey, sectionData]) => {
      searchInSection(sectionData, sectionKey);
    });
    
    return results;
  };

  const searchResults = getSearchResults();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Content Loading Error</h1>
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Content Management - Admin</title>
        <meta name="description" content="Manage site content" />
      </Head>
      <div className="min-h-screen bg-surface flex flex-col">
        {/* HERO HEADER */}
        <div className="bg-primary-color text-white py-8 px-4 shadow-lg rounded-b-3xl mb-6">
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-montserrat font-bold mb-2 tracking-tight">🎨 Content Management</h1>
            <p className="text-lg sm:text-xl font-source-serif text-accent1-color mb-4">Manage all text content across the site with ease</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={handleInitialize}
                disabled={saving}
                className="bg-accent1-color hover:bg-accent1-light text-white font-semibold px-4 py-2 rounded-lg shadow transition disabled:opacity-50"
              >
                {saving ? '🔄 Initializing...' : '🚀 Initialize Content'}
              </button>
              <button
                onClick={refreshContent}
                disabled={saving}
                className="bg-white text-primary border border-primary font-semibold px-4 py-2 rounded-lg shadow hover:bg-surface transition disabled:opacity-50"
              >
                🔄 Refresh Content
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editingContent}
                className="bg-primary-color hover:bg-primary-dark text-white font-semibold px-4 py-2 rounded-lg shadow transition disabled:opacity-50"
              >
                {saving ? '💾 Saving...' : '💾 Save Changes'}
              </button>
              <button
                onClick={() => window.open('/', '_blank')}
                className="bg-surface text-primary border border-primary font-semibold px-4 py-2 rounded-lg shadow hover:bg-white transition"
              >
                👁️ View Site
              </button>
            </div>
          </div>
        </div>
        {/* Message */}
        {message && (
          <div className="max-w-2xl mx-auto px-2 sm:px-4 mt-2">
            <div className={`p-4 rounded-lg shadow text-center font-semibold ${message.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>{message}</div>
          </div>
        )}
        {/* Main Content */}
        <div className="flex-1 w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 flex flex-col gap-6">
          {/* Quick Navigation - horizontally scrollable on mobile */}
          <div className="overflow-x-auto scrollbar-hide">
            <QuickNav 
              sections={contentSections}
              activeSection={activeTab}
              onSectionClick={(section) => {
                setActiveTab(section);
                setExpandedSections(new Set([section]));
              }}
              searchTerm={searchTerm}
              searchResults={searchResults}
            />
          </div>
          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-2 flex flex-col gap-2">
            <label htmlFor="search" className="block text-base font-montserrat text-primary mb-1">🔍 Search Content</label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for specific content, titles, or descriptions..."
              className="w-full px-4 py-3 border border-border rounded-lg shadow-sm focus:ring-2 focus:ring-accent1 focus:border-accent1 text-lg font-source-serif"
            />
            {/* Search Results */}
            {searchTerm && searchResults.length > 0 && (
              <div className="mt-2">
                <h3 className="text-base font-montserrat text-primary mb-1">🔍 Search Results ({searchResults.length})</h3>
                <div className="space-y-2">
                  {searchResults.slice(0, 5).map((result, index) => (
                    <div key={index} className="p-3 bg-accent1-light/10 border border-accent1 rounded-lg">
                      <div className="text-base font-semibold text-accent1">{result.label}</div>
                      <div className="text-xs text-primary mt-1">{result.path}</div>
                      <div className="text-sm text-primary mt-1">&ldquo;{result.value.substring(0, 100)}{result.value.length > 100 ? '...' : ''}&rdquo;</div>
                    </div>
                  ))}
                  {searchResults.length > 5 && (
                    <div className="text-sm text-gray-500">... and {searchResults.length - 5} more results</div>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* Content Sections - cards, mobile stack */}
          <div className="flex flex-col gap-6">
            {filteredSections.map(([sectionKey, sectionData]) => {
              const sectionInfo = contentSections[sectionKey] || {
                title: sectionKey,
                description: 'Content section',
                icon: '📄',
                color: 'gray'
              };
              return (
                <div key={sectionKey} className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col gap-2">
                  {renderContentSection(sectionKey, sectionData, sectionInfo)}
                </div>
              );
            })}
          </div>
          {filteredSections.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-montserrat font-bold text-primary mb-2">
                {searchTerm ? 'No content found' : 'No content available'}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? `No content matches &ldquo;${searchTerm}&rdquo;. Try a different search term.`
                  : 'Content will appear here once initialized.'
                }
              </p>
            </div>
          )}
        </div>
        {/* Quick Actions Footer - sticky on mobile */}
        <div className="mt-8 bg-surface border-t border-border sticky bottom-0 z-10 w-full py-4 px-2 sm:px-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-500 shadow-taylor-purple-focus">
          <span>💡 Tip: Use the search to quickly find specific content</span>
          <span>📊 {Object.keys(editingContent || {}).length} sections | 📝 {Object.values(editingContent || {}).flatMap(Object.values).filter(v => typeof v === 'string').length} text fields</span>
        </div>
      </div>
    </>
  );
}

// Server-side props for initial content loading
export async function getServerSideProps(context) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminToken(context.req);
    if (!authResult.success) {
      return {
        redirect: {
          destination: '/admin',
          permanent: false,
        },
      };
    }

    // Get content directly without dynamic import
    let content = null;
    try {
      const { getContent } = require('../lib/contentManager.js');
      content = await getContent();
    } catch (contentError) {
      console.error('Error loading content:', contentError);
      // Return default content structure if there's an error
      content = {
        homepage: {
          hero: {
            title: "Make the Connection",
            subtitle: "Connect with meaningful opportunities that create lasting impact in upland.",
            ctaPrimary: "Find Opportunities",
            ctaSecondary: "Learn More"
          }
        },
        about: {
          hero: {
            title: "About Us",
            subtitle: "Learn more about our mission and impact."
          }
        },
        navigation: {
          home: "Home",
          about: "About",
          opportunities: "Opportunities"
        },
        footer: {
          description: "Connecting passionate volunteers with meaningful opportunities."
        },
        common: {
          loading: "Loading...",
          error: "An error occurred. Please try again."
        },
        modals: {
          auth: {
            title: "Sign In",
            subtitle: "Access your account"
          }
        }
      };
    }

    return {
      props: {
        initialContent: content,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      redirect: {
        destination: '/admin',
        permanent: false,
      },
    };
  }
}