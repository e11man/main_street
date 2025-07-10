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
  ),
  search: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
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
  const [filterSection, setFilterSection] = useState('all');
  const [sortBy, setSortBy] = useState('section');
  const [viewMode, setViewMode] = useState('sections'); // 'sections' or 'list'
  
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
      description: "Main landing page content including hero section, search, opportunities, testimonials, and contact",
      icon: Icons.home,
      color: "blue"
    },
    about: {
      title: "About Page", 
      description: "About page content including mission, impact, what we do, and call-to-action sections",
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
      description: "Reusable UI elements like buttons, messages, labels, and status text",
      icon: Icons.settings,
      color: "orange"
    },
    modals: {
      title: "Modals & Forms",
      description: "Modal content, form labels, authentication text, and interactive elements",
      icon: Icons.modal,
      color: "pink"
    },
    dashboard: {
      title: "Dashboard",
      description: "User and organization dashboard content, profile sections, and management interfaces",
      icon: Icons.settings,
      color: "indigo"
    },
    admin: {
      title: "Admin Interface",
      description: "Administrative interface content, management tools, and admin-specific labels",
      icon: Icons.settings,
      color: "red"
    },
    forms: {
      title: "Forms",
      description: "Form field labels, placeholders, and validation messages for all user inputs",
      icon: Icons.edit,
      color: "teal"
    },
    errors: {
      title: "Error Pages",
      description: "Error page content including 404, 500, 401, and 403 error messages",
      icon: Icons.error,
      color: "red"
    },
    success: {
      title: "Success Pages",
      description: "Success page content for registrations, confirmations, and approvals",
      icon: Icons.check,
      color: "green"
    },
    emails: {
      title: "Email Templates",
      description: "Email template content including subjects, greetings, messages, and footers",
      icon: Icons.edit,
      color: "blue"
    },
    notifications: {
      title: "Notifications",
      description: "Notification system content, settings, and notification types",
      icon: Icons.info,
      color: "yellow"
    },
    search: {
      title: "Search & Filters",
      description: "Search functionality content, filters, sorting options, and search results",
      icon: Icons.search,
      color: "purple"
    },
    pagination: {
      title: "Pagination",
      description: "Pagination controls, page navigation, and results display text",
      icon: Icons.navigation,
      color: "gray"
    },
    accessibility: {
      title: "Accessibility",
      description: "Accessibility features, screen reader text, and inclusive design content",
      icon: Icons.info,
      color: "cyan"
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
    if (!editingContent) return [];
    
    const results = [];
    
    const searchInSection = (data, path = '', section = '') => {
      if (typeof data === 'object' && data !== null) {
        Object.entries(data).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;
          const currentSection = section || path;
          
          if (typeof value === 'object' && value !== null) {
            searchInSection(value, currentPath, currentSection);
          } else if (typeof value === 'string') {
            const label = key.replace(/([A-Z])/g, ' $1').trim();
            const matchesSearch = !searchTerm || 
              value.toLowerCase().includes(searchTerm.toLowerCase()) ||
              label.toLowerCase().includes(searchTerm.toLowerCase()) ||
              currentPath.toLowerCase().includes(searchTerm.toLowerCase());
            
            if (matchesSearch) {
              results.push({
                path: currentPath,
                value,
                label,
                section: currentSection || 'common'
              });
            }
          }
        });
      }
    };
    
    searchInSection(editingContent);
    
    // Sort results based on sortBy
    if (sortBy === 'alphabetical') {
      results.sort((a, b) => a.label.localeCompare(b.label));
    } else if (sortBy === 'recent') {
      // For now, just sort by section since we don't track modification time
      results.sort((a, b) => a.section.localeCompare(b.section));
    } else {
      // Default: sort by section
      results.sort((a, b) => a.section.localeCompare(b.section));
    }
    
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
        <title>Content Management - Community Connect</title>
        <meta name="description" content="Manage all website content including text, labels, and messages" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
                <p className="text-sm text-gray-600">Manage all website content, text, and labels</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => window.open('/', '_blank')}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Icons.eye />
                  <span className="ml-2">Preview Site</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <Icons.save />
                  <span className="ml-2">{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Toolbar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search content by keyword or path..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icons.search />
                  </div>
                </div>
                
                <select
                  value={filterSection}
                  onChange={(e) => setFilterSection(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Sections</option>
                  {Object.entries(contentSections).map(([key, section]) => (
                    <option key={key} value={key}>{section.title}</option>
                  ))}
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="section">Sort by Section</option>
                  <option value="alphabetical">Sort Alphabetically</option>
                  <option value="recent">Recently Modified</option>
                </select>
              </div>
              
              {/* View Controls */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">View:</span>
                  <button
                    onClick={() => setViewMode('sections')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      viewMode === 'sections'
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    Sections
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      viewMode === 'list'
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    List
                  </button>
                </div>
                
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    showPreview
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  <Icons.eye />
                  <span className="ml-2">Preview</span>
                </button>
              </div>
            </div>
            
            {/* Quick Stats */}
            {editingContent && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="font-medium">Total Fields:</span>
                    <span className="ml-1">{Object.keys(editingContent).length} sections</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">Modified:</span>
                    <span className="ml-1">{Object.keys(editingContent).filter(key => 
                      JSON.stringify(editingContent[key]) !== JSON.stringify(content?.[key])
                    ).length} sections</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">Search Results:</span>
                    <span className="ml-1">{searchTerm ? getSearchResults().length : 'All'} fields</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mb-6 p-4 rounded-md ${
              message.includes('Error') 
                ? 'bg-red-100 border border-red-400 text-red-700' 
                : 'bg-green-100 border border-green-400 text-green-700'
            }`}>
              <div className="flex items-center">
                {message.includes('Error') ? <Icons.error /> : <Icons.check />}
                <span className="ml-2">{message}</span>
              </div>
            </div>
          )}

          {/* Content Display */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading content...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <Icons.error />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Content</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={handleInitialize}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Initialize Content
              </button>
            </div>
          ) : editingContent ? (
            <div className="space-y-6">
              {viewMode === 'sections' ? (
                // Section-based view
                Object.entries(contentSections)
                  .filter(([key]) => filterSection === 'all' || key === filterSection)
                  .map(([sectionKey, sectionInfo]) => {
                    const sectionData = editingContent[sectionKey];
                    if (!sectionData) return null;
                    
                    return renderContentSection(sectionKey, sectionData, sectionInfo);
                  })
              ) : (
                // List view
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-900">All Content Fields</h3>
                    <p className="text-sm text-gray-600">Edit individual content fields in a list format</p>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {getSearchResults().map(({ path, value, label, section }) => (
                      <div key={path} className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {section}
                              </span>
                              <h4 className="text-sm font-medium text-gray-900">{label}</h4>
                            </div>
                            <p className="text-xs text-gray-500 mb-2">Path: {path}</p>
                            <textarea
                              value={value || ''}
                              onChange={(e) => updateNestedValue(path, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              rows={2}
                              placeholder={`Enter ${label.toLowerCase()}...`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
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