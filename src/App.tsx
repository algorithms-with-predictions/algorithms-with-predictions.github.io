import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { ThemeContextProvider } from './contexts/ThemeContext';
import Layout from './components/layout';
import ErrorBoundary from './components/ErrorBoundary';
import CookieConsent from './components/CookieConsent';
import { trackPageView } from './utils/analytics';
import { useCookieConsent } from './hooks/useCookieConsent';

// Lazy load route components
const HomePage = lazy(() => import('./pages/HomePage'));
const MaterialPage = lazy(() => import('./pages/MaterialPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContributePage = lazy(() => import('./pages/ContributePage'));
const AuthorGraphPage = lazy(() => import('./pages/AuthorGraphPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

/**
 * Loading fallback component for lazy-loaded routes
 */
const RouteLoader: React.FC = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="60vh"
  >
    <CircularProgress />
  </Box>
);

/**
 * Root application component
 *
 * Features:
 * - Lazy loading for all routes
 * - Error boundary wrapping
 * - Theme context provider
 * - Cookie consent management
 * - Analytics page view tracking
 */
const App: React.FC = () => {
  const location = useLocation();
  const { onAccept, onDecline } = useCookieConsent();

  useEffect(() => {
    // Track page views on route changes
    trackPageView(location.pathname, document.title);
  }, [location]);

  return (
    <ThemeContextProvider>
      <ErrorBoundary>
        <Layout>
          <Suspense fallback={<RouteLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/material" element={<MaterialPage />} />
              <Route path="/contribute" element={<ContributePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/authors" element={<AuthorGraphPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
          <CookieConsent onAccept={onAccept} onDecline={onDecline} />
        </Layout>
      </ErrorBoundary>
    </ThemeContextProvider>
  );
};

export default App;
