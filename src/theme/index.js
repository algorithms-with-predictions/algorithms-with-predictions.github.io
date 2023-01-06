import { blueGrey, amber, green, lightBlue } from "@mui/material/colors";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: blueGrey[700],
    },
    labels: {
      main: lightBlue[600],
      contrastText: "#ffffff",
    },
    typeLabels: {
      main: green[600],
      contrastText: "#ffffff",
    },
    pubLabels: {
      main: amber[800],
      contrastText: "#ffffff",
    },
  },
});

export default theme;
