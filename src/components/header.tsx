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
import { Link as RouterLink, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const pages = [
  { name: 'Paper List', href: '/' },
  { name: 'Further Material', href: '/material' },
  { name: 'How to Contribute', href: '/contribute' },
  { name: 'About', href: '/about' },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          minHeight: { xs: 56, md: 64 },
          px: { xs: 2, md: 3 },
        }}
      >
        <Typography
          variant={isMobile ? 'h6' : 'h5'}
          noWrap
          component="div"
          sx={{
            mr: { xs: 1, md: 4 },
            fontWeight: 700,
            letterSpacing: 0,
            flexGrow: 1,
            fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
            color: 'primary.main',
          }}
        >
          {isMobile ? 'ALPS' : 'Algorithms with Predictions'}
        </Typography>

        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
          {pages.map(page => {
            const isActive = location.pathname === page.href;

            return (
              <Button
                key={page.name}
                component={RouterLink}
                to={page.href}
                sx={{
                  mr: 0.5,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 1,
                  color: isActive ? 'primary.dark' : 'text.secondary',
                  bgcolor: isActive ? 'primary.light' : 'transparent',
                  textDecoration: 'none !important',
                  fontSize: '0.95rem',
                  fontWeight: isActive ? 700 : 650,
                  '&:hover': {
                    bgcolor: isActive ? 'primary.light' : 'action.hover',
                    color: 'primary.dark',
                  },
                  '&:visited': {
                    color: isActive ? 'primary.dark' : 'text.secondary',
                  },
                  transition: 'background-color 0.2s ease, color 0.2s ease',
                }}
                color="inherit"
              >
                {page.name}
              </Button>
            );
          })}
          <ThemeToggle />
        </Box>

        {/* Mobile Navigation */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
          <ThemeToggle />
          <IconButton
            color="inherit"
            aria-label={
              mobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'
            }
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-menu"
            onClick={handleMobileMenuToggle}
            sx={{ ml: 1 }}
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </Box>
      </Toolbar>

      {/* Mobile Menu Collapse */}
      <Collapse
        in={mobileMenuOpen && isMobile}
        id="mobile-navigation-menu"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Stack spacing={0}>
            {pages.map(page => {
              const isActive = location.pathname === page.href;

              return (
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
                    color: isActive ? 'primary.dark' : 'text.primary',
                    bgcolor: isActive ? 'primary.light' : 'transparent',
                    textDecoration: 'none !important',
                    '&:hover': {
                      bgcolor: isActive ? 'primary.light' : 'action.hover',
                      color: 'primary.dark',
                    },
                    '&:visited': {
                      color: isActive ? 'primary.dark' : 'text.primary',
                    },
                    fontSize: '1rem',
                    fontWeight: isActive ? 700 : 650,
                  }}
                >
                  {page.name}
                </Button>
              );
            })}
          </Stack>
        </Box>
      </Collapse>
    </AppBar>
  );
};
export default Header;
