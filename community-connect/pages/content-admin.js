import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useContent } from '../contexts/ContentContext.js';
import { verifyAdminToken } from '../lib/authUtils.js';
import { getFieldDescriptions } from '../lib/contentManager.js';
import QuickNav from '../components/ContentAdmin/QuickNav.jsx';

export default function ContentAdmin({ initialContent }) {
  const { content, loading, error, updateContent, initializeContent } = useContent();
  const [editingContent, setEditingContent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [expandedSections, setExpandedSections] = useState(new Set(['homepage'])); // Start with homepage expanded
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showPreview, setShowPreview] = useState(false);
  const fieldDescriptions = getFieldDescriptions();

  useEffect(() => {
    if (content) {
      setEditingContent(JSON.parse(JSON.stringify(content)));
    }
  }, [content]);

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
          <p className="text-red-600">Error: {error}</p>
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

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">🎨 Content Management</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage all text content across the site with ease
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleInitialize}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {saving ? '🔄 Initializing...' : '🚀 Initialize Content'}
                </button>
                
                <button
                  onClick={refreshContent}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  🔄 Refresh Content
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={saving || !editingContent}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {saving ? '💾 Saving...' : '💾 Save Changes'}
                </button>
                
                <button
                  onClick={() => window.open('/', '_blank')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  👁️ View Site
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
            <div className={`p-4 rounded-md ${
              message.includes('Error') 
                ? 'bg-red-50 border border-red-200 text-red-700' 
                : 'bg-green-50 border border-green-200 text-green-700'
            }`}>
              {message}
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          {/* Quick Navigation */}
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

          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="mb-4">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Search Content
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for specific content, titles, or descriptions..."
                className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
            </div>

            {/* Search Results */}
            {searchTerm && searchResults.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  🔍 Search Results ({searchResults.length})
                </h3>
                <div className="space-y-2">
                  {searchResults.slice(0, 5).map((result, index) => (
                    <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="text-sm font-medium text-blue-900">{result.label}</div>
                      <div className="text-xs text-blue-700 mt-1">{result.path}</div>
                      <div className="text-sm text-blue-800 mt-1">
                        &ldquo;{result.value.substring(0, 100)}{result.value.length > 100 ? '...' : ''}&rdquo;
                      </div>
                    </div>
                  ))}
                  {searchResults.length > 5 && (
                    <div className="text-sm text-gray-500">
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
              return renderContentSection(sectionKey, sectionData, sectionInfo);
            })}
          </div>

          {filteredSections.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
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

        {/* Quick Actions Footer */}
        <div className="mt-12 bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                💡 Tip: Use the search to quickly find specific content
              </div>
              <div className="flex space-x-4 text-sm text-gray-500">
                <span>📊 {Object.keys(editingContent || {}).length} sections</span>
                <span>📝 {Object.values(editingContent || {}).flatMap(Object.values).filter(v => typeof v === 'string').length} text fields</span>
              </div>
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

    // Import here to avoid issues with SSR
    const { getContent } = await import('../lib/contentManager.js');
    const content = await getContent();

    return {
      props: {
        initialContent: content,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: {
        initialContent: null,
      },
    };
  }
}