import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

const pages = [
  { name: "Paper List", href: "/" },
  { name: "Further Material", href: "/material" },
  { name: "How to Contribute", href: "/contribute" },
  { name: "About", href: "/about" },
];

const Header = () => {
  return (
    <AppBar position="static" color="primary">
      <Toolbar disableGutters>
        <Typography
          variant="h5"
          noWrap
          component="div"
          sx={{ ml: 2, mr: 4, fontWeight: "bold" }}
        >
          Algorithms with Predictions
        </Typography>
        {pages.map((page) => (
          <Button
            key={page.name}
            sx={{ mr: 1 }}
            href={page.href}
            color="inherit"
            textAlign="center"
          >
            {page.name}
          </Button>
        ))}
      </Toolbar>
    </AppBar>
  );
};
export default Header;
