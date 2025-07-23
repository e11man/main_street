import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to apply theme to CSS custom properties
  const applyTheme = (themeData) => {
    if (typeof window === 'undefined') {
      console.log('🌐 ThemeContext: Server-side, skipping theme application');
      return;
    }

    if (!themeData?.colors || !themeData?.fonts) {
      console.warn('⚠️ ThemeContext: Invalid theme data:', themeData);
      return;
    }

    console.log('🎨 ThemeContext: Applying theme:', themeData.name);
    const root = document.documentElement;
    const { colors, fonts } = themeData;

    try {
      // Apply color variables
      console.log('🎨 ThemeContext: Setting color variables...');
      root.style.setProperty('--primary', colors.primary);
      root.style.setProperty('--primary-light', colors.primaryLight);
      root.style.setProperty('--primary-dark', colors.primaryDark);
      root.style.setProperty('--accent1', colors.accent1);
      root.style.setProperty('--accent1-light', colors.accent1Light);
      root.style.setProperty('--accent1-dark', colors.accent1Dark);
      root.style.setProperty('--accent2', colors.accent2);
      root.style.setProperty('--text-primary', colors.textPrimary);
      root.style.setProperty('--text-secondary', colors.textSecondary);
      root.style.setProperty('--text-tertiary', colors.textTertiary);
      root.style.setProperty('--background', colors.background);
      root.style.setProperty('--surface', colors.surface);
      root.style.setProperty('--surface-hover', colors.surfaceHover);
      root.style.setProperty('--border', colors.border);
      root.style.setProperty('--border-light', colors.borderLight);

      // Apply font variables
      console.log('🔤 ThemeContext: Setting font variables...');
      root.style.setProperty('--font-montserrat', `"${fonts.primary}", sans-serif`);
      root.style.setProperty('--font-source-serif', `"${fonts.secondary}", serif`);

      // Update Google Fonts imports dynamically
      console.log('📝 ThemeContext: Loading Google Fonts...');
      updateGoogleFonts(fonts.primary, fonts.secondary);

      console.log('✅ ThemeContext: Theme applied successfully:', themeData.name);
      
      // Trigger a custom event to notify other parts of the app
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: themeData }));
    } catch (error) {
      console.error('❌ ThemeContext: Error applying theme:', error);
    }
  };

  // Function to update Google Fonts
  const updateGoogleFonts = (primaryFont, secondaryFont) => {
    // Remove existing Google Fonts links
    const existingLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
    existingLinks.forEach(link => link.remove());

    // Create new Google Fonts links
    const fontFamilies = [];
    
    if (primaryFont && primaryFont !== 'Montserrat') {
      fontFamilies.push(`${primaryFont.replace(' ', '+')}:wght@300;400;500;600;700`);
    } else {
      fontFamilies.push('Montserrat:wght@300;400;500;600;700');
    }

    if (secondaryFont && secondaryFont !== 'Source Serif 4' && secondaryFont !== primaryFont) {
      fontFamilies.push(`${secondaryFont.replace(' ', '+')}:wght@400;500;600;700`);
    } else if (secondaryFont !== primaryFont) {
      fontFamilies.push('Source+Serif+4:wght@400;500;600;700');
    }

    if (fontFamilies.length > 0) {
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?${fontFamilies.map(family => `family=${family}`).join('&')}&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  };

  // Function to fetch and apply the active theme
  const fetchActiveTheme = async () => {
    try {
      console.log('🎨 ThemeContext: Fetching active theme...');
      setLoading(true);
      setError(null);

      const response = await fetch('/api/themes/active', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch theme: ${response.status} ${response.statusText}`);
      }

      const themeData = await response.json();
      console.log('✅ ThemeContext: Received theme data:', themeData);
      
      if (!themeData || !themeData.colors || !themeData.fonts) {
        throw new Error('Invalid theme data received');
      }
      
      setTheme(themeData);
      applyTheme(themeData);
      console.log('🎭 ThemeContext: Theme applied successfully');
    } catch (err) {
      console.error('❌ ThemeContext: Error fetching theme:', err);
      setError(err.message);
      
      // Apply default theme on error
      const defaultTheme = {
        name: 'Default Theme (Fallback)',
        colors: {
          primary: '#1B365F',
          primaryLight: '#284B87',
          primaryDark: '#14284A',
          accent1: '#00AFCE',
          accent1Light: '#00C4E6',
          accent1Dark: '#0095AF',
          accent2: '#E14F3D',
          textPrimary: '#2C2C2E',
          textSecondary: '#6C6C70',
          textTertiary: '#8E8E93',
          background: '#FFFFFF',
          surface: '#F8F8F9',
          surfaceHover: '#F1F5F9',
          border: '#E2E8F0',
          borderLight: '#F1F5F9'
        },
        fonts: {
          primary: 'Montserrat',
          secondary: 'Source Serif 4',
          primaryWeight: '700',
          secondaryWeight: '400'
        }
      };
      console.log('🔄 ThemeContext: Applying fallback theme');
      setTheme(defaultTheme);
      applyTheme(defaultTheme);
    } finally {
      setLoading(false);
    }
  };

  // Function to update theme (for admin use)
  const updateTheme = async (themeData) => {
    try {
      setTheme(themeData);
      applyTheme(themeData);
    } catch (err) {
      console.error('Error updating theme:', err);
      setError(err.message);
    }
  };

  // Function to refresh theme from server
  const refreshTheme = () => {
    fetchActiveTheme();
  };

  // Initialize theme on mount
  useEffect(() => {
    fetchActiveTheme();
  }, []);

  // Function to get CSS variable value
  const getCSSVariable = (variableName) => {
    if (typeof window !== 'undefined') {
      return getComputedStyle(document.documentElement)
        .getPropertyValue(`--${variableName}`)
        .trim();
    }
    return '';
  };

  const value = {
    theme,
    loading,
    error,
    applyTheme,
    updateTheme,
    refreshTheme,
    getCSSVariable
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};