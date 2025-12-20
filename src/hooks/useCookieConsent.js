import { useEffect } from 'react';
import { initGA } from '../utils/analytics.js';

export const useCookieConsent = () => {
  useEffect(() => {
    // Initialize Google Analytics
    initGA();
  }, []);

  const onAccept = () => {
    // Re-initialize analytics with consent
    initGA();
  };

  const onDecline = () => {
    // Disable any existing analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
      });
    }
  };

  return {
    onAccept,
    onDecline,
  };
};
