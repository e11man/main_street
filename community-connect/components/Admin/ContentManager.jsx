import React, { useState, useEffect } from 'react';
import Icon from '../ui/Icon';

const ContentManager = () => {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showAddNew, setShowAddNew] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Content sections for organization
  const contentSections = {
    navigation: {
      title: 'Navigation',
      icon: 'M4 6h16M4 12h16M4 18h16',
      keys: ['nav.home', 'nav.about', 'nav.opportunities', 'nav.contact', 'nav.request_volunteers', 'nav.org_login']
    },
    hero: {
      title: 'Hero Section',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      keys: ['hero.title', 'hero.subtitle', 'hero.cta.primary', 'hero.cta.secondary']
    },
    statistics: {
      title: 'Statistics',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      keys: ['stats.volunteers.label', 'stats.opportunities.label', 'stats.organizations.label', 'stats.impact.label']
    },
    search: {
      title: 'Search & Filters',
      icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
      keys: ['search.title', 'search.subtitle', 'search.placeholder', 'search.filter.title', 'search.filter.subtitle', 'search.filter.all', 'search.filter.community', 'search.filter.education', 'search.filter.environment', 'search.filter.health', 'search.filter.fundraising', 'search.filter.other']
    },
    contact: {
      title: 'Contact Section',
      icon: 'M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      keys: ['contact.title', 'contact.subtitle', 'contact.name.placeholder', 'contact.email.placeholder', 'contact.message.placeholder', 'contact.submit', 'contact.sending', 'contact.sent']
    },
    footer: {
      title: 'Footer',
      icon: 'M19 14l-7 7m0 0l-7-7m7 7V3',
      keys: ['footer.tagline', 'footer.copyright']
    },
    about: {
      title: 'About Page',
      icon: 'M13 16h-1v-4h-1V9h2v3h1v4zm-1-14C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z',
      keys: ['about.hero.title', 'about.hero.subtitle', 'about.mission.title', 'about.mission.text', 'about.impact.title', 'about.what_we_do.title', 'about.what_we_do.text', 'about.contact.title', 'about.contact.text']
    },
    safety: {
      title: 'Safety Guidelines',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      keys: ['safety.user.title', 'safety.user.subtitle', 'safety.user.never_alone', 'safety.user.no_abuse', 'safety.user.trust_instincts', 'safety.user.emergency_contact', 'safety.user.report_concerns', 'safety.user.personal_info', 'safety.user.safe_environment', 'safety.user.transportation', 'safety.user.acknowledge', 'safety.org.title', 'safety.org.subtitle', 'safety.org.background_checks', 'safety.org.supervision', 'safety.org.safe_environment', 'safety.org.emergency_procedures', 'safety.org.training', 'safety.org.reporting', 'safety.org.insurance', 'safety.org.communication', 'safety.org.acknowledge']
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/content');
      if (response.ok) {
        const data = await response.json();
        setContent(data);
      } else {
        setError('Failed to fetch content');
      }
    } catch (error) {
      setError('Error fetching content: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateContent = async (key, value) => {
    try {
      setSaving(true);
      setError('');
      
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value }),
      });

      if (response.ok) {
        setContent(prev => ({ ...prev, [key]: value }));
        setSuccess(`Successfully updated "${key}"`);
        setTimeout(() => setSuccess(''), 3000);
        
        // Add to history
        setHistory(prev => [{
          key,
          oldValue: content[key] || '',
          newValue: value,
          timestamp: new Date().toISOString(),
          action: 'update'
        }, ...prev.slice(0, 49)]); // Keep last 50 changes
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update content');
      }
    } catch (error) {
      setError('Error updating content: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const addNewContent = async () => {
    if (!newKey.trim() || !newValue.trim()) {
      setError('Both key and value are required');
      return;
    }

    if (content[newKey]) {
      setError('Key already exists. Use edit to modify existing content.');
      return;
    }

    await updateContent(newKey, newValue);
    setNewKey('');
    setNewValue('');
    setShowAddNew(false);
    
    // Add to history
    setHistory(prev => [{
      key: newKey,
      oldValue: '',
      newValue: newValue,
      timestamp: new Date().toISOString(),
      action: 'create'
    }, ...prev.slice(0, 49)]);
  };

  const deleteContent = async (key) => {
    if (!confirm(`Are you sure you want to delete "${key}"?`)) return;

    try {
      setSaving(true);
      const response = await fetch('/api/content', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key }),
      });

      if (response.ok) {
        const oldValue = content[key];
        setContent(prev => {
          const newContent = { ...prev };
          delete newContent[key];
          return newContent;
        });
        setSuccess(`Successfully deleted "${key}"`);
        setTimeout(() => setSuccess(''), 3000);
        
        // Add to history
        setHistory(prev => [{
          key,
          oldValue: oldValue || '',
          newValue: '',
          timestamp: new Date().toISOString(),
          action: 'delete'
        }, ...prev.slice(0, 49)]);
      } else {
        setError('Failed to delete content');
      }
    } catch (error) {
      setError('Error deleting content: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const exportContent = () => {
    const dataStr = JSON.stringify(content, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `content-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importContent = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedContent = JSON.parse(e.target.result);
        
        if (confirm(`Import ${Object.keys(importedContent).length} content items? This will overwrite existing content with matching keys.`)) {
          for (const [key, value] of Object.entries(importedContent)) {
            await updateContent(key, value);
          }
          setSuccess('Content imported successfully');
          setTimeout(() => setSuccess(''), 3000);
        }
      } catch (error) {
        setError('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const startEdit = (key) => {
    setEditingKey(key);
    setEditValue(content[key] || '');
  };

  const saveEdit = async () => {
    if (editValue !== content[editingKey]) {
      await updateContent(editingKey, editValue);
    }
    setEditingKey(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditValue('');
  };

  const getFilteredContent = () => {
    let keys = Object.keys(content);
    
    if (selectedSection !== 'all') {
      keys = contentSections[selectedSection]?.keys || [];
    }
    
    if (searchTerm) {
      keys = keys.filter(key => 
        key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (content[key] && content[key].toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return keys.map(key => ({ key, value: content[key] || '' }));
  };

  const getSectionStats = () => {
    const stats = {};
    Object.keys(contentSections).forEach(section => {
      const sectionKeys = contentSections[section].keys;
      const existingKeys = sectionKeys.filter(key => content[key]);
      stats[section] = {
        total: sectionKeys.length,
        existing: existingKeys.length,
        missing: sectionKeys.length - existingKeys.length
      };
    });
    return stats;
  };

  const sectionStats = getSectionStats();
  const filteredContent = getFilteredContent();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3">Loading content...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
          <p className="text-gray-600">Manage all site content dynamically</p>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Icon path="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" className="w-4 h-4" />
            History
          </button>
          <button
            onClick={exportContent}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Icon path="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" className="w-4 h-4" />
            Export
          </button>
          <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-2">
            <Icon path="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" className="w-4 h-4" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={importContent}
              className="hidden"
            />
          </label>
          <button
            onClick={() => setShowAddNew(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Icon path="M12 4v16m8-8H4" className="w-4 h-4" />
            Add New
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search content by key or value..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Sections</option>
            {Object.entries(contentSections).map(([key, section]) => (
              <option key={key} value={key}>
                {section.title} ({sectionStats[key]?.existing}/{sectionStats[key]?.total})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Section Overview */}
      {selectedSection === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Object.entries(contentSections).map(([key, section]) => {
            const stats = sectionStats[key];
            const completionRate = (stats.existing / stats.total) * 100;
            
            return (
              <div
                key={key}
                className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedSection(key)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Icon path={section.icon} className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{section.title}</h3>
                    <p className="text-sm text-gray-500">{stats.existing}/{stats.total} items</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      completionRate === 100 ? 'bg-green-500' : 
                      completionRate >= 75 ? 'bg-blue-500' : 
                      completionRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{Math.round(completionRate)}% complete</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Content List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">
            {selectedSection === 'all' ? 'All Content' : contentSections[selectedSection]?.title}
            <span className="text-gray-500 ml-2">({filteredContent.length} items)</span>
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredContent.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? 'No content matches your search.' : 'No content found.'}
            </div>
          ) : (
            filteredContent.map(({ key, value }) => (
              <div key={key} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-blue-600">
                        {key}
                      </code>
                      {!value && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Missing
                        </span>
                      )}
                    </div>
                    
                    {editingKey === key ? (
                      <div className="space-y-3">
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                          rows={Math.max(2, Math.ceil(editValue.length / 80))}
                          placeholder="Enter content value..."
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            disabled={saving}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                          >
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-700">
                        {value ? (
                          <span className="whitespace-pre-wrap">{value}</span>
                        ) : (
                          <span className="text-gray-400 italic">No value set</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {editingKey !== key && (
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => startEdit(key)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Icon path="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteContent(key)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Icon path="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add New Content Modal */}
      {showAddNew && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Content</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content Key
                </label>
                <input
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="e.g., hero.new_title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content Value
                </label>
                <textarea
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Enter the content text..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddNew(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={addNewContent}
                disabled={!newKey.trim() || !newValue.trim() || saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Adding...' : 'Add Content'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Content Change History</h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Icon path="M6 18L18 6M6 6l12 12" className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {history.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No changes recorded yet.</p>
              ) : (
                <div className="space-y-4">
                  {history.map((change, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            change.action === 'create' ? 'bg-green-100 text-green-800' :
                            change.action === 'update' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {change.action}
                          </span>
                          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {change.key}
                          </code>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(change.timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      {change.action !== 'create' && change.oldValue && (
                        <div className="mb-2">
                          <p className="text-sm text-gray-600 mb-1">Previous value:</p>
                          <p className="text-sm bg-red-50 p-2 rounded border-l-4 border-red-400">
                            {change.oldValue}
                          </p>
                        </div>
                      )}
                      
                      {change.action !== 'delete' && change.newValue && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            {change.action === 'create' ? 'Value:' : 'New value:'}
                          </p>
                          <p className="text-sm bg-green-50 p-2 rounded border-l-4 border-green-400">
                            {change.newValue}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManager;