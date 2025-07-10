import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useContent } from '../contexts/ContentContext.js';
import { verifyAdminToken } from '../lib/authUtils.js';

export default function ContentAdmin({ initialContent }) {
  const { content, loading, error, updateContent, initializeContent } = useContent();
  const [editingContent, setEditingContent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');

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
        setMessage('Content saved successfully!');
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

  const renderEditableField = (path, value, label) => {
    const isExpanded = expandedSections.has(path);
    
    return (
      <div key={path} className="mb-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
          <button
            onClick={() => toggleSection(path)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
        
        {isExpanded && (
          <textarea
            value={value || ''}
            onChange={(e) => updateNestedValue(path, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows={value && value.length > 100 ? 4 : 2}
            placeholder={`Enter ${label.toLowerCase()}...`}
          />
        )}
        
        {!isExpanded && (
          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
            {value ? (value.length > 100 ? `${value.substring(0, 100)}...` : value) : 'No content'}
          </div>
        )}
      </div>
    );
  };

  const renderSection = (sectionKey, sectionData, parentPath = '') => {
    const currentPath = parentPath ? `${parentPath}.${sectionKey}` : sectionKey;
    const isExpanded = expandedSections.has(currentPath);
    
    return (
      <div key={currentPath} className="border border-gray-200 rounded-lg mb-4">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 capitalize">
              {sectionKey.replace(/([A-Z])/g, ' $1').trim()}
            </h3>
            <button
              onClick={() => toggleSection(currentPath)}
              className="text-blue-600 hover:text-blue-800"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          </div>
        </div>
        
        {isExpanded && (
          <div className="p-4">
            {Object.entries(sectionData).map(([key, value]) => {
              const fieldPath = `${currentPath}.${key}`;
              const fieldLabel = key.replace(/([A-Z])/g, ' $1').trim();
              
              if (typeof value === 'object' && value !== null) {
                return renderSection(key, value, currentPath);
              } else {
                return renderEditableField(fieldPath, value, fieldLabel);
              }
            })}
          </div>
        )}
      </div>
    );
  };

  const filteredContent = editingContent ? 
    Object.entries(editingContent).filter(([sectionKey, sectionData]) => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      const sectionName = sectionKey.toLowerCase();
      
      if (sectionName.includes(searchLower)) return true;
      
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
                <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage all text content across the site
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleInitialize}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {saving ? 'Initializing...' : 'Initialize Content'}
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={saving || !editingContent}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
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

        {/* Search */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Content
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for specific content..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Content Sections */}
            <div className="space-y-6">
              {filteredContent.map(([sectionKey, sectionData]) => 
                renderSection(sectionKey, sectionData)
              )}
            </div>

            {filteredContent.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No content found matching your search.' : 'No content available.'}
              </div>
            )}
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