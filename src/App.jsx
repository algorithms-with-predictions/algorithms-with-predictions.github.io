import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeContextProvider } from './contexts/ThemeContext.jsx';
import Layout from './components/layout.jsx';
import HomePage from './pages/HomePage';
import MaterialPage from './pages/MaterialPage';
import ContributePage from './pages/ContributePage';
import AboutPage from './pages/AboutPage';
import PrivacyPage from './pages/PrivacyPage';
import NotFoundPage from './pages/NotFoundPage';
import CookieConsent from './components/CookieConsent.jsx';
import { initGA, trackPageView } from './utils/analytics.js';

function App() {
  const location = useLocation();

  useEffect(() => {
    // Initialize Google Analytics
    initGA();
  }, []);

  useEffect(() => {
    // Track page views on route changes
    trackPageView(location.pathname, document.title);
  }, [location]);

  const handleConsentAccept = () => {
    // Re-initialize analytics with consent
    initGA();
  };

  const handleConsentDecline = () => {
    // Disable any existing analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
      });
    }
  };

  return (
    <ThemeContextProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/material" element={<MaterialPage />} />
          <Route path="/contribute" element={<ContributePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <CookieConsent
          onAccept={handleConsentAccept}
          onDecline={handleConsentDecline}
        />
      </Layout>
    </ThemeContextProvider>
  );
}

export default App;
