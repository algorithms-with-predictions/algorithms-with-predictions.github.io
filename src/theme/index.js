import { blueGrey, amber, green, lightBlue } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: blueGrey[700],
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
});

export default theme;
