/**
 * Content Refresh Utility
 * ----------------------
 * 
 * This utility provides functions to force refresh content from MongoDB
 * and clear all caches to ensure fresh data is always displayed.
 */

// Global refresh function that can be called from anywhere
let globalRefreshCallbacks = [];

export const registerRefreshCallback = (callback) => {
  globalRefreshCallbacks.push(callback);
  return () => {
    globalRefreshCallbacks = globalRefreshCallbacks.filter(cb => cb !== callback);
  };
};

export const triggerGlobalRefresh = async () => {
  console.log('🔄 Triggering global content refresh...');
  
  // Call all registered refresh callbacks
  await Promise.all(globalRefreshCallbacks.map(callback => {
    try {
      return callback();
    } catch (error) {
      console.error('Error in refresh callback:', error);
      return Promise.resolve();
    }
  }));
  
  console.log('✅ Global content refresh completed');
};

// Force refresh content from MongoDB
export const forceRefreshContent = async () => {
  try {
    console.log('🔄 Force refreshing content from MongoDB...');
    
    // Clear browser cache for content API
    if (typeof window !== 'undefined') {
      // Clear fetch cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(name => caches.delete(name))
        );
      }
      
      // Clear localStorage if it contains cached content
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.includes('content') || key.includes('cache')
      );
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
    
    // Trigger global refresh
    await triggerGlobalRefresh();
    
    console.log('✅ Content refresh completed');
    return true;
  } catch (error) {
    console.error('❌ Error refreshing content:', error);
    return false;
  }
};

// Refresh content after admin changes
export const refreshAfterAdminChange = async () => {
  try {
    console.log('🔄 Refreshing content after admin change...');
    
    // Wait a moment for MongoDB to sync
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Force refresh
    await forceRefreshContent();
    
    // Show success message
    if (typeof window !== 'undefined') {
      // You can integrate this with your toast notification system
      console.log('✅ Content updated successfully!');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error refreshing after admin change:', error);
    return false;
  }
};

// Auto-refresh content periodically (optional)
export const startAutoRefresh = (intervalMs = 30000) => { // 30 seconds
  if (typeof window === 'undefined') return;
  
  const interval = setInterval(async () => {
    await forceRefreshContent();
  }, intervalMs);
  
  return () => clearInterval(interval);
};

// Clear all caches and restart
export const clearAllCaches = async () => {
  try {
    console.log('🧹 Clearing all caches...');
    
    if (typeof window !== 'undefined') {
      // Clear all browser caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(name => caches.delete(name))
        );
      }
      
      // Clear localStorage
      localStorage.clear();
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear IndexedDB if available
      if ('indexedDB' in window) {
        const databases = await indexedDB.databases();
        databases.forEach(db => {
          if (db.name) {
            indexedDB.deleteDatabase(db.name);
          }
        });
      }
    }
    
    console.log('✅ All caches cleared');
    return true;
  } catch (error) {
    console.error('❌ Error clearing caches:', error);
    return false;
  }
};