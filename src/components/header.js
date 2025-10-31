import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';
import ThemeToggle from './ThemeToggle';

const pages = [
  { name: 'Paper List', href: '/' },
  { name: 'Further Material', href: '/material' },
  { name: 'How to Contribute', href: '/contribute' },
  { name: 'About', href: '/about' },
];

const Header = () => {
  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Toolbar disableGutters sx={{ px: 2 }}>
        <Typography
          variant="h5"
          noWrap
          component="div"
          sx={{
            mr: 4,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            flexGrow: 1,
          }}
        >
          Algorithms with Predictions
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {pages.map(page => (
            <Button
              key={page.name}
              sx={{
                mr: 1,
                px: 2,
                py: 1,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
              href={page.href}
              color="inherit"
            >
              {page.name}
            </Button>
          ))}
          <ThemeToggle />
        </Box>
      </Toolbar>
    </AppBar>
  );
};
export default Header;
