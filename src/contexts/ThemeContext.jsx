import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider } from '@mui/material/styles';
import { createCustomTheme } from '../theme';

const ThemeContext = createContext();

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeContextProvider');
  }
  return context;
};

export const ThemeContextProvider = ({ children }) => {
  const [mode, setMode] = useState('light');
  const [isHydrated, setIsHydrated] = useState(false);

  // Load saved theme preference on mount
  useEffect(() => {
    setIsHydrated(true);

    // Only access browser APIs in client-side environment
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const savedMode = localStorage.getItem('themeMode');
      if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
        setMode(savedMode);
      } else {
        // Detect system preference
        if (typeof window.matchMedia !== 'undefined') {
          const prefersDark = window.matchMedia(
            '(prefers-color-scheme: dark)'
          ).matches;
          setMode(prefersDark ? 'dark' : 'light');
        }
      }
    }
  }, []);

  // Save theme preference when changed (only after hydration)
  useEffect(() => {
    if (
      isHydrated &&
      typeof window !== 'undefined' &&
      typeof localStorage !== 'undefined'
    ) {
      localStorage.setItem('themeMode', mode);
    }
  }, [mode, isHydrated]);

  const toggleTheme = () => {
    setMode(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Use light theme during SSR and initial render to prevent hydration mismatch
  const effectiveMode = isHydrated ? mode : 'light';
  const theme = createCustomTheme(effectiveMode);

  const value = {
    mode: effectiveMode,
    toggleTheme,
    isDark: effectiveMode === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};

ThemeContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
