import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { blueGrey, amber, green, lightBlue, grey } from '@mui/material/colors';

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
        main: isDark ? '#42A5F5' : '#1565C0',
        light: isDark ? '#80D6FF' : '#42A5F5',
        dark: isDark ? '#0D47A1' : '#003C8F',
      },
      secondary: {
        main: lightBlue[600],
      },
      background: {
        default: isDark ? '#0a0a0a' : '#fafafa',
        paper: isDark ? '#1a1a1a' : '#ffffff',
      },
      text: {
        primary: isDark ? '#ffffff' : '#000000',
        secondary: isDark ? grey[400] : grey[600],
      },
      // Custom colors for paper labels
      labels: {
        light: isDark ? lightBlue[300] : lightBlue[400],
        main: isDark ? lightBlue[400] : lightBlue[600],
        dark: isDark ? lightBlue[600] : lightBlue[800],
        contrastText: '#ffffff',
      },
      typeLabels: {
        light: isDark ? green[300] : green[400],
        main: isDark ? green[400] : green[600],
        dark: isDark ? green[600] : green[800],
        contrastText: '#ffffff',
      },
      pubLabels: {
        light: isDark ? amber[400] : amber[600],
        main: isDark ? amber[500] : amber[800],
        dark: isDark ? amber[700] : amber[900],
        contrastText: '#ffffff',
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
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
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
            borderRadius: 16,
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
    },
  });
};

export const ThemeContextProvider = ({ children }) => {
  const [mode, setMode] = useState('light');

  // Load saved theme preference on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
      setMode(savedMode);
    } else {
      // Detect system preference
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      setMode(prefersDark ? 'dark' : 'light');
    }
  }, []);

  // Save theme preference when changed
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = createCustomTheme(mode);

  const value = {
    mode,
    toggleTheme,
    isDark: mode === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};
