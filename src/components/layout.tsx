import { Container, Box, CssBaseline } from '@mui/material';
import { ReactNode } from 'react';
import Header from './header';

import './layout.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
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
          <Container maxWidth={false} disableGutters sx={{ py: 3 }}>
            {children}
          </Container>
        </main>
      </Box>
    </>
  );
};

export default Layout;
