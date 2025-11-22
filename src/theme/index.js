import { orange, blue, deepOrange } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976D2', // Rich blue - consistent with theme context
      light: '#42A5F5',
      dark: '#0D47A1',
    },
    secondary: {
      main: orange[600], // Orange secondary for highlights
      light: orange[400],
      dark: orange[800],
    },
    background: {
      default: '#f8faff', // Slightly blue-tinted background
      paper: '#ffffff',
    },
    labels: {
      light: blue[400],
      main: blue[600],
      dark: blue[800],
      contrastText: '#ffffff',
    },
    typeLabels: {
      light: orange[400], // Orange for type labels (highlights)
      main: orange[600],
      dark: orange[800],
      contrastText: '#ffffff',
    },
    pubLabels: {
      light: deepOrange[400],
      main: deepOrange[600],
      dark: deepOrange[800],
      contrastText: '#ffffff',
    },
    success: {
      main: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    warning: {
      main: orange[600], // Orange warnings match secondary
      light: orange[400],
      dark: orange[800],
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
  },
  shape: {
    borderRadius: 2, // Consistent rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Modern button styling
          borderRadius: 2,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 2, // Consistent with theme
        },
      },
    },
  },
});

export default theme;
