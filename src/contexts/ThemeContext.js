import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  blueGrey,
  amber,
  green,
  lightBlue,
  grey,
  orange,
  blue,
  deepOrange,
} from '@mui/material/colors';

const ThemeContext = createContext();

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeContextProvider');
  }
  return context;
};

const createCustomTheme = mode => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#42A5F5' : '#1976D2', // Rich blue
        light: isDark ? '#80D6FF' : '#42A5F5',
        dark: isDark ? '#1565C0' : '#0D47A1',
      },
      secondary: {
        main: isDark ? orange[400] : orange[600], // Orange secondary
        light: isDark ? orange[300] : orange[400],
        dark: isDark ? orange[600] : orange[800],
      },
      background: {
        default: isDark ? '#0a0a0a' : '#f8faff', // Slightly blue-tinted background
        paper: isDark ? '#1a1a1a' : '#ffffff',
      },
      text: {
        primary: isDark ? '#ffffff' : '#1a1a1a',
        secondary: isDark ? grey[400] : grey[600],
      },
      // Custom colors for paper labels - cohesive blue-orange palette
      labels: {
        light: isDark ? blue[300] : blue[400],
        main: isDark ? blue[400] : blue[600],
        dark: isDark ? blue[600] : blue[800],
        contrastText: '#ffffff',
      },
      typeLabels: {
        light: isDark ? orange[300] : orange[400], // Orange for type labels (highlight)
        main: isDark ? orange[400] : orange[600],
        dark: isDark ? orange[600] : orange[800],
        contrastText: '#ffffff',
      },
      pubLabels: {
        light: isDark ? deepOrange[300] : deepOrange[400],
        main: isDark ? deepOrange[400] : deepOrange[600],
        dark: isDark ? deepOrange[600] : deepOrange[800],
        contrastText: '#ffffff',
      },
      success: {
        main: isDark ? '#4CAF50' : '#2E7D32', // Consistent with theme
        light: isDark ? '#81C784' : '#4CAF50',
        dark: isDark ? '#2E7D32' : '#1B5E20',
      },
      warning: {
        main: isDark ? orange[400] : orange[600], // Orange warnings match secondary
        light: isDark ? orange[300] : orange[400],
        dark: isDark ? orange[600] : orange[800],
      },
      // Custom link colors for markdown content
      link: {
        main: isDark ? '#64B5F6' : '#1976D2', // Bright blue for dark mode, standard blue for light
        hover: isDark ? '#90CAF9' : '#1565C0',
        visited: isDark ? '#BA68C8' : '#7B1FA2', // Purple tint for visited links
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 600,
      },
      h2: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 2, // Consistent with updated design
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 2,
            fontWeight: 500,
            '&:hover': {
              transform: 'translateY(-1px)',
              transition: 'all 0.2s ease-in-out',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 2, // Consistent with theme
            fontWeight: 500,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none', // Remove MUI's default gradient in dark mode
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: isDark ? '#1a1a1a' : undefined,
          },
        },
      },
      // Global CSS for markdown content links
      MuiCssBaseline: {
        styleOverrides: {
          a: {
            color: isDark ? '#64B5F6' : '#1976D2',
            textDecoration: 'underline',
            textDecorationColor: 'rgba(100, 181, 246, 0.4)',
            transition:
              'color 0.2s ease-in-out, text-decoration-color 0.2s ease-in-out',
            '&:hover': {
              color: isDark ? '#90CAF9' : '#1565C0',
              textDecoration: 'underline',
              textDecorationColor: isDark ? '#90CAF9' : '#1565C0',
            },
            '&:visited': {
              color: isDark ? '#BA68C8' : '#7B1FA2',
            },
            '&:visited:hover': {
              color: isDark ? '#CE93D8' : '#8E24AA',
            },
          },
        },
      },
    },
  });
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
