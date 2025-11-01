import * as React from 'react';
import {
  AppBar,
  Button,
  Toolbar,
  Typography,
  Box,
  IconButton,
  useMediaQuery,
  useTheme,
  Collapse,
  Stack,
} from '@mui/material';
import { Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle.jsx';

const pages = [
  { name: 'Paper List', href: '/' },
  { name: 'Further Material', href: '/material' },
  { name: 'How to Contribute', href: '/contribute' },
  { name: 'About', href: '/about' },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Toolbar disableGutters sx={{ px: 2 }}>
        <Typography
          variant={isMobile ? 'h6' : 'h5'}
          noWrap
          component="div"
          sx={{
            mr: { xs: 1, md: 4 },
            fontWeight: 600,
            letterSpacing: '-0.02em',
            flexGrow: 1,
            fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
          }}
        >
          {isMobile ? 'ALPS' : 'Algorithms with Predictions'}
        </Typography>

        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
          {pages.map(page => (
            <Button
              key={page.name}
              component={RouterLink}
              to={page.href}
              sx={{
                mr: 1,
                px: 2,
                py: 1,
                borderRadius: 2,
                color: 'white !important',
                textDecoration: 'none !important',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-1px)',
                  color: 'white !important',
                },
                '&:visited': {
                  color: 'white !important',
                },
                transition: 'all 0.2s ease-in-out',
              }}
              color="inherit"
            >
              {page.name}
            </Button>
          ))}
          <ThemeToggle />
        </Box>

        {/* Mobile Navigation */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
          <ThemeToggle />
          <IconButton
            color="inherit"
            aria-label="open mobile menu"
            onClick={handleMobileMenuToggle}
            sx={{ ml: 1 }}
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </Box>
      </Toolbar>

      {/* Mobile Menu Collapse */}
      <Collapse in={mobileMenuOpen && isMobile}>
        <Box
          sx={{
            bgcolor: 'primary.dark',
            borderTop: 1,
            borderColor: 'primary.light',
          }}
        >
          <Stack spacing={0}>
            {pages.map(page => (
              <Button
                key={page.name}
                component={RouterLink}
                to={page.href}
                color="inherit"
                onClick={handleMobileMenuClose}
                sx={{
                  justifyContent: 'flex-start',
                  px: 3,
                  py: 1.5,
                  borderRadius: 0,
                  color: 'white !important',
                  textDecoration: 'none !important',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white !important',
                  },
                  '&:visited': {
                    color: 'white !important',
                  },
                  fontSize: '0.95rem',
                  fontWeight: 500,
                }}
              >
                {page.name}
              </Button>
            ))}
          </Stack>
        </Box>
      </Collapse>
    </AppBar>
  );
};
export default Header;
