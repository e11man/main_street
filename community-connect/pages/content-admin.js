import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useContent } from '../contexts/ContentContext.js';
import { verifyAdminToken } from '../lib/authUtils.js';
import { getFieldDescriptions } from '../lib/contentManager.js';
import QuickNav from '../components/ContentAdmin/QuickNav.jsx';
import Button from '../components/ui/Button';

// SVG Icons
const Icons = {
  home: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  ),
  info: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  ),
  navigation: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
  ),
  footer: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
    </svg>
  ),
  settings: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
  ),
  modal: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" />
    </svg>
  ),
  save: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h-1v5.586l-2.293-2.293z" />
    </svg>
  ),
  refresh: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
    </svg>
  ),
  eye: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
  ),
  edit: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
    </svg>
  ),
  check: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  ),
  error: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  )
};

export default function ContentAdmin({ initialContent }) {
  const { content, loading, error, updateContent, initializeContent, refreshContent } = useContent();
  const [editingContent, setEditingContent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [expandedSections, setExpandedSections] = useState(new Set(['homepage']));
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
          <div className="text-red-500 mb-4">
            <Icons.error />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Content Management Error</h1>
          <p className="text-red-600 mb-4">{pageError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
        setMessage('Content saved successfully! Changes are now live on the site.');
        setTimeout(() => setMessage(''), 5000);
        
        // Refresh the content to ensure we have the latest version
        await refreshContent();
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
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
        setMessage('Content initialized successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
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

  // Content organization with descriptions and proper icons
  const contentSections = {
    homepage: {
      title: "Homepage",
      description: "Main landing page content including hero section, search, and CTAs",
      icon: Icons.home,
      color: "blue"
    },
    about: {
      title: "About Page", 
      description: "About page content including mission, impact, and program descriptions",
      icon: Icons.info,
      color: "green"
    },
    navigation: {
      title: "Navigation",
      description: "Menu items, navigation labels, and header content",
      icon: Icons.navigation, 
      color: "purple"
    },
    footer: {
      title: "Footer",
      description: "Footer content, links, and social media labels",
      icon: Icons.footer,
      color: "gray"
    },
    common: {
      title: "Common UI",
      description: "Reusable UI elements like buttons, messages, and labels",
      icon: Icons.settings,
      color: "orange"
    },
    modals: {
      title: "Modals & Forms",
      description: "Modal content, form labels, and authentication text",
      icon: Icons.modal,
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
      <div key={path} className="mb-6 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              {label}
            </label>
            {description && (
              <p className="text-xs text-gray-600 mb-2">{description}</p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-sm flex items-center gap-2"
            onClick={() => toggleSection(path)}
          >
            {isExpanded ? (
              <>
                <Icons.edit />
                Edit
              </>
            ) : (
              <>
                <Icons.eye />
                View
              </>
            )}
          </Button>
        </div>
        
        {isExpanded ? (
          <div className="space-y-3">
            <textarea
              value={value || ''}
              onChange={(e) => updateNestedValue(path, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              rows={value && value.length > 100 ? 4 : 2}
              placeholder={`Enter ${label.toLowerCase()}...`}
            />
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Characters: {value ? value.length : 0}</span>
              <span>Path: {path}</span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-200">
            {value ? (
              <div>
                <div className="font-medium mb-1 text-gray-900">Current content:</div>
                <div className="text-gray-600">
                  {value.length > 150 ? `${value.substring(0, 150)}...` : value}
                </div>
              </div>
            ) : (
              <div className="text-gray-400 italic">No content set</div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderContentSection = (sectionKey, sectionData, sectionInfo) => {
    const isExpanded = expandedSections.has(sectionKey);
    const IconComponent = sectionInfo.icon;
    
    return (
      <div key={sectionKey} className="overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 border-b border-blue-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-white">
                <IconComponent />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {sectionInfo.title}
                </h3>
                <p className="text-sm text-blue-100">{sectionInfo.description}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-blue-600 transition-colors"
              onClick={() => toggleSection(sectionKey)}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
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
          <h4 className="text-md font-semibold text-gray-900 capitalize">
            {parentLabel}
          </h4>
          <Button
            variant="outline"
            size="sm"
            className="text-sm flex items-center gap-2"
            onClick={() => toggleSection(parentPath)}
          >
            {isExpanded ? (
              <>
                <Icons.edit />
                Collapse
              </>
            ) : (
              <>
                <Icons.eye />
                Expand
              </>
            )}
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Icons.error />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Content Loading Error</h1>
          <p className="text-red-600 mb-6">Error: {error}</p>
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        {/* HERO HEADER */}
        <section className="pt-18 relative overflow-hidden bg-gradient-to-b from-blue-600 to-blue-800">
          {/* Background pattern */}
          <div className="absolute inset-0 z-0 opacity-10">
            <div className="absolute top-0 left-0 right-0 h-full w-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-20 left-10 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
          
          <div className="max-w-screen-xl mx-auto px-6 md:px-8 py-16 md:py-20 text-center relative z-10">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 md:mb-6 tracking-tight text-white leading-tight inline-block">
              Content Management
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-400 to-white rounded-full"></span>
            </h1>
            <p className="text-lg md:text-xl font-normal text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Manage all text content across the site with ease
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                variant="secondary" 
                className="group text-base px-6 py-3 shadow-lg hover:shadow-xl flex items-center gap-2"
                onClick={handleInitialize}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Initializing...
                  </>
                ) : (
                  <>
                    <Icons.refresh />
                    Initialize Content
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                className="text-base px-6 py-3 border-white text-white hover:text-white flex items-center gap-2"
                onClick={refreshContent}
                disabled={saving}
              >
                <Icons.refresh />
                Refresh Content
              </Button>
              <Button 
                variant="primary" 
                className="text-base px-6 py-3 shadow-lg hover:shadow-xl flex items-center gap-2"
                onClick={handleSave}
                disabled={saving || !editingContent}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Icons.save />
                    Save Changes
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                className="text-base px-6 py-3 border-white text-white hover:text-white flex items-center gap-2"
                onClick={() => window.open('/', '_blank')}
              >
                <Icons.eye />
                View Site
              </Button>
            </div>
          </div>
        </section>

        {/* Message */}
        {message && (
          <div className="max-w-2xl mx-auto px-6 mt-6">
            <div className={`p-4 rounded-lg shadow-md text-center font-semibold flex items-center justify-center gap-2 ${
              message.includes('Error') 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {message.includes('Error') ? <Icons.error /> : <Icons.check />}
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
            <label htmlFor="search" className="block text-base font-semibold text-gray-900 mb-3">
              Search Content
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for specific content, titles, or descriptions..."
              className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition-all duration-200"
            />
            
            {/* Search Results */}
            {searchTerm && searchResults.length > 0 && (
              <div className="mt-4">
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  Search Results ({searchResults.length})
                </h3>
                <div className="space-y-3">
                  {searchResults.slice(0, 5).map((result, index) => (
                    <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="text-base font-semibold text-gray-900">{result.label}</div>
                      <div className="text-sm text-gray-600 mt-1">{result.path}</div>
                      <div className="text-sm text-gray-700 mt-2">
                        &quot;{result.value.substring(0, 100)}{result.value.length > 100 ? '...' : ''}&quot;
                      </div>
                    </div>
                  ))}
                  {searchResults.length > 5 && (
                    <div className="text-sm text-gray-500 text-center py-2">
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
                icon: Icons.settings,
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
                  ? `No content matches &quot;${searchTerm}&quot;. Try a different search term.`
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