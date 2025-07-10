import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useContent } from '../contexts/ContentContext.js';
import { verifyAdminToken } from '../lib/authUtils.js';
import { getFieldDescriptions } from '../lib/contentManager.js';
import QuickNav from '../components/ContentAdmin/QuickNav.jsx';
import Button from '../components/ui/Button';

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
      <div key={path} className="mb-6 p-4 bg-white rounded-lg border border-border hover:border-accent1 transition-colors shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <label className="block text-sm font-montserrat font-semibold text-primary mb-1">
              {label}
            </label>
            {description && (
              <p className="text-xs text-text-secondary mb-2">{description}</p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-sm"
            onClick={() => toggleSection(path)}
          >
            {isExpanded ? 'Edit' : 'View'}
          </Button>
        </div>
        
        {isExpanded ? (
          <div className="space-y-3">
            <textarea
              value={value || ''}
              onChange={(e) => updateNestedValue(path, e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent1 focus:border-accent1 font-source-serif transition-all duration-200"
              rows={value && value.length > 100 ? 4 : 2}
              placeholder={`Enter ${label.toLowerCase()}...`}
            />
            <div className="flex justify-between items-center text-xs text-text-secondary">
              <span>Characters: {value ? value.length : 0}</span>
              <span>Path: {path}</span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-text-primary bg-surface p-3 rounded border border-border">
            {value ? (
              <div>
                <div className="font-montserrat font-medium mb-1 text-primary">Current content:</div>
                <div className="text-text-secondary font-source-serif">
                  {value.length > 150 ? `${value.substring(0, 150)}...` : value}
                </div>
              </div>
            ) : (
              <div className="text-text-tertiary italic">No content set</div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderContentSection = (sectionKey, sectionData, sectionInfo) => {
    const isExpanded = expandedSections.has(sectionKey);
    
    return (
      <div key={sectionKey} className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary-light px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <h3 className="text-lg font-montserrat font-bold text-white">
                  {sectionInfo.title}
                </h3>
                <p className="text-sm text-accent1">{sectionInfo.description}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-primary"
              onClick={() => toggleSection(sectionKey)}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
        
        {isExpanded && (
          <div className="p-6 bg-surface">
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
          <h4 className="text-md font-montserrat font-semibold text-primary capitalize">
            {parentLabel}
          </h4>
          <Button
            variant="outline"
            size="sm"
            className="text-sm"
            onClick={() => toggleSection(parentPath)}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
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
      <div className="min-h-screen bg-gradient-to-b from-background to-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent1 mx-auto"></div>
          <p className="mt-4 text-text-secondary font-source-serif">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-surface flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-montserrat font-bold text-primary mb-2">Content Loading Error</h1>
          <p className="text-accent2 mb-6 font-source-serif">Error: {error}</p>
          <Button
            variant="primary"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
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
      <div className="min-h-screen bg-gradient-to-b from-background to-surface">
        {/* HERO HEADER - matching homepage */}
        <section className="pt-18 relative overflow-hidden bg-gradient-to-b from-primary to-primary-dark">
          {/* Background pattern */}
          <div className="absolute inset-0 z-0 opacity-10">
            <div className="absolute top-0 left-0 right-0 h-full w-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-20 left-10 w-24 h-24 bg-accent1/20 rounded-full blur-2xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-float animation-delay-1000"></div>
          
          <div className="max-w-screen-xl mx-auto px-6 md:px-8 py-16 md:py-20 text-center relative z-10">
            <h1 className="hero-title relative font-montserrat text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 md:mb-6 tracking-[-0.025em] text-white leading-tight inline-block">
              Content Management
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-accent1 to-white rounded-full"></span>
            </h1>
            <p className="font-source-serif text-lg md:text-xl font-normal text-accent1 mb-8 max-w-2xl mx-auto leading-relaxed">
              Manage all text content across the site with ease
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                variant="secondary" 
                className="group text-base px-6 py-3 shadow-lg hover:shadow-xl"
                onClick={handleInitialize}
                disabled={saving}
              >
                {saving ? 'Initializing...' : 'Initialize Content'}
              </Button>
              <Button 
                variant="outline" 
                className="text-base px-6 py-3 border-white text-white hover:text-white"
                onClick={refreshContent}
                disabled={saving}
              >
                Refresh Content
              </Button>
              <Button 
                variant="primary" 
                className="text-base px-6 py-3 shadow-lg hover:shadow-xl"
                onClick={handleSave}
                disabled={saving || !editingContent}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                variant="outline" 
                className="text-base px-6 py-3 border-white text-white hover:text-white"
                onClick={() => window.open('/', '_blank')}
              >
                View Site
              </Button>
            </div>
          </div>
        </section>

        {/* Message */}
        {message && (
          <div className="max-w-2xl mx-auto px-6 mt-6">
            <div className={`p-4 rounded-lg shadow-md text-center font-montserrat font-semibold ${message.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
              {message}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-screen-xl mx-auto px-6 md:px-8 py-8 md:py-12">
          {/* Quick Navigation */}
          <div className="mb-8">
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
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <label htmlFor="search" className="block text-base font-montserrat font-semibold text-primary mb-3">
              Search Content
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for specific content, titles, or descriptions..."
              className="w-full px-4 py-3 border border-border rounded-md shadow-sm focus:ring-2 focus:ring-accent1 focus:border-accent1 text-lg font-source-serif transition-all duration-200"
            />
            
            {/* Search Results */}
            {searchTerm && searchResults.length > 0 && (
              <div className="mt-4">
                <h3 className="text-base font-montserrat font-semibold text-primary mb-3">
                  Search Results ({searchResults.length})
                </h3>
                <div className="space-y-3">
                  {searchResults.slice(0, 5).map((result, index) => (
                    <div key={index} className="p-4 bg-surface border border-border rounded-lg hover:shadow-md transition-shadow">
                      <div className="text-base font-montserrat font-semibold text-primary">{result.label}</div>
                      <div className="text-sm text-text-secondary mt-1">{result.path}</div>
                      <div className="text-sm text-text-primary mt-2">
                        "{result.value.substring(0, 100)}{result.value.length > 100 ? '...' : ''}"
                      </div>
                    </div>
                  ))}
                  {searchResults.length > 5 && (
                    <div className="text-sm text-text-secondary text-center py-2">
                      ... and {searchResults.length - 5} more results
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Content Sections */}
          <div className="space-y-6">
            {filteredSections.map(([sectionKey, sectionData]) => {
              const sectionInfo = contentSections[sectionKey] || {
                title: sectionKey,
                description: 'Content section',
                icon: '📄',
                color: 'gray'
              };
              return (
                <div key={sectionKey} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {renderContentSection(sectionKey, sectionData, sectionInfo)}
                </div>
              );
            })}
          </div>

          {filteredSections.length === 0 && (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              <div className="text-6xl mb-6 text-primary opacity-20">�</div>
              <h3 className="text-xl font-montserrat font-bold text-primary mb-3">
                {searchTerm ? 'No content found' : 'No content available'}
              </h3>
              <p className="text-text-secondary max-w-md mx-auto">
                {searchTerm 
                  ? `No content matches "${searchTerm}". Try a different search term.`
                  : 'Content will appear here once initialized.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-surface border-t border-border py-6 px-6">
          <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-text-secondary">
            <span className="text-center sm:text-left">Tip: Use the search to quickly find specific content</span>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span>{Object.keys(editingContent || {}).length} sections</span>
              <span>{Object.values(editingContent || {}).flatMap(Object.values).filter(v => typeof v === 'string').length} text fields</span>
            </div>
          </div>
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