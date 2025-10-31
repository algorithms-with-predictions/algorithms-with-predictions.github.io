import { blueGrey, amber, green, lightBlue } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light', // Enable dark mode support later
    primary: {
      main: '#1565C0', // Modern blue
      light: '#42A5F5',
      dark: '#0D47A1',
    },
    secondary: {
      main: lightBlue[600],
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    labels: {
      light: lightBlue[400],
      main: lightBlue[600],
      dark: lightBlue[800],
      contrastText: '#ffffff',
    },
    typeLabels: {
      light: green[400],
      main: green[600],
      dark: green[800],
      contrastText: '#ffffff',
    },
    pubLabels: {
      light: amber[600],
      main: amber[800],
      dark: amber[900],
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
  },
  shape: {
    borderRadius: 8, // Modern rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Modern button styling
          borderRadius: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16, // More modern chip styling
        },
      },
    },
  },
});

export default theme;
