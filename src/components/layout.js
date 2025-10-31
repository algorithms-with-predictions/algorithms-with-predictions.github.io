import { Container, Box, CssBaseline } from '@mui/material';
import * as React from 'react';
import PropTypes from 'prop-types';
import Header from './header';
import { useThemeMode } from '../contexts/ThemeContext';

import './layout.css';

const Layout = ({ children }) => {
  const { isDark } = useThemeMode();

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          color: 'text.primary',
          transition: 'background-color 0.3s ease, color 0.3s ease',
        }}
      >
        <Header />
        <main>
          <Container maxWidth="None" sx={{ py: 3 }}>
            {children}
          </Container>
        </main>
      </Box>
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
