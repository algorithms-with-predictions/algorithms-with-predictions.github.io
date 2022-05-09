import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";

const pages = [
  { name: "Paper List", href: "/" },
  { name: "Further Material", href: "/material" },
  { name: "About", href: "/about" },
];

const Header = () => {
  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters spac>
          <Typography
            variant="h5"
            noWrap
            component="div"
            sx={{ mr: 4, fontWeight: "bold" }}
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
      </Container>
    </AppBar>
  );
};
export default Header;
