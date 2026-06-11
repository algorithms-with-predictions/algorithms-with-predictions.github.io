import { createTheme } from '@mui/material/styles';

/**
 * Theme mode type (user preference)
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Resolved theme mode (actual theme applied)
 */
export type ResolvedThemeMode = 'light' | 'dark';

export const createCustomTheme = (mode: ResolvedThemeMode) => {
  const isDark = mode === 'dark';
  const colors = {
    primary: isDark
      ? { main: '#75bdb6', light: '#202c2c', dark: '#afd8d3' }
      : { main: '#2d6f6b', light: '#e1ede9', dark: '#245955' },
    secondary: isDark
      ? { main: '#d99562', light: '#33251f', dark: '#edbd96' }
      : { main: '#bd6a3f', light: '#f8e3d4', dark: '#934f2e' },
    labels: isDark
      ? { main: '#8fabc9', light: '#202934', dark: '#bdcede' }
      : { main: '#466b82', light: '#e9eff2', dark: '#355469' },
    typeLabels: isDark
      ? { main: '#d99a6a', light: '#342922', dark: '#efc29f' }
      : { main: '#c46f43', light: '#fae5d6', dark: '#98512f' },
    surface: isDark
      ? { default: '#101111', paper: '#171818', raised: '#1d1f1f' }
      : { default: '#f5f6f2', paper: '#fffef9', raised: '#ffffff' },
    text: isDark
      ? { primary: '#ecefed', secondary: '#b3b8b6', muted: '#8e9491' }
      : { primary: '#202927', secondary: '#63706b', muted: '#7d8783' },
    border: isDark ? '#303433' : '#d9ded9',
  };

  return createTheme({
    palette: {
      mode,
      primary: {
        ...colors.primary,
        contrastText: isDark ? '#10201e' : '#fffefa',
      },
      secondary: {
        ...colors.secondary,
        contrastText: isDark ? '#1f120c' : '#fffefa',
      },
      background: {
        default: colors.surface.default,
        paper: colors.surface.paper,
      },
      text: {
        primary: colors.text.primary,
        secondary: colors.text.secondary,
      },
      labels: {
        ...colors.labels,
        contrastText: isDark ? '#101716' : '#fffefa',
      },
      typeLabels: {
        ...colors.typeLabels,
        contrastText: isDark ? '#101716' : '#fffefa',
      },
      success: {
        main: isDark ? '#7fc48f' : '#2f7653',
        light: isDark ? '#20422f' : '#dff0e5',
        dark: isDark ? '#aad8b5' : '#22583d',
      },
      warning: {
        main: colors.secondary.main,
        light: colors.secondary.light,
        dark: colors.secondary.dark,
      },
      link: {
        main: isDark ? '#8acbc2' : '#286d69',
        hover: isDark ? '#b9e1db' : '#174c4a',
        visited: isDark ? '#c4a386' : '#74432d',
      },
      divider: colors.border,
    },
    typography: {
      fontFamily:
        'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h1: {
        fontWeight: 600,
        letterSpacing: 0,
      },
      h2: {
        fontWeight: 600,
        letterSpacing: 0,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
        fontSize: '1.1rem',
      },
      subtitle1: {
        fontWeight: 500,
        fontSize: '1rem',
      },
      subtitle2: {
        fontWeight: 500,
        fontSize: '0.9rem',
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
      caption: {
        fontSize: '0.75rem',
        lineHeight: 1.4,
      },
    },
    shape: {
      borderRadius: 4,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 4,
            fontWeight: 650,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            fontWeight: 650,
          },
        },
      },
      MuiCard: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: 'none',
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: colors.surface.default,
          },
          '::selection': {
            backgroundColor: isDark ? '#315e5a' : '#d9ece7',
            color: colors.text.primary,
          },
          a: {
            color: colors.primary.main,
            textDecoration: 'none',
            transition: 'color 0.2s ease-in-out',
            '&:hover': {
              color: colors.primary.dark,
            },
            '&:visited': {
              color: colors.primary.main,
            },
            '&:visited:hover': {
              color: colors.primary.dark,
            },
          },
        },
      },
    },
  });
};
