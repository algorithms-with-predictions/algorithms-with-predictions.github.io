import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeContextProvider } from './contexts/ThemeContext.jsx';
import Layout from './components/layout.jsx';
import HomePage from './pages/HomePage';
import MaterialPage from './pages/MaterialPage';
import ContributePage from './pages/ContributePage';
import AboutPage from './pages/AboutPage';
import PrivacyPage from './pages/PrivacyPage';
import AuthorGraphPage from './pages/AuthorGraphPage';
import NotFoundPage from './pages/NotFoundPage';
import CookieConsent from './components/CookieConsent.jsx';
import { trackPageView } from './utils/analytics.js';
import { useCookieConsent } from './hooks/useCookieConsent.js';

function App() {
  const location = useLocation();
  const { onAccept, onDecline } = useCookieConsent();

  useEffect(() => {
    // Track page views on route changes
    trackPageView(location.pathname, document.title);
  }, [location]);

  return (
    <ThemeContextProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/material" element={<MaterialPage />} />
          <Route path="/contribute" element={<ContributePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/authors" element={<AuthorGraphPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <CookieConsent onAccept={onAccept} onDecline={onDecline} />
      </Layout>
    </ThemeContextProvider>
  );
}

export default App;
