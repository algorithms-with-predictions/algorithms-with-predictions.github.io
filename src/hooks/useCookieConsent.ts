import { useEffect } from 'react';
import { initGA } from '../utils/analytics';

/**
 * Return type for useCookieConsent hook
 */
export interface CookieConsentHandlers {
  /** Handler for when user accepts cookies */
  onAccept: () => void;
  /** Handler for when user declines cookies */
  onDecline: () => void;
}

/**
 * Hook for managing cookie consent and Google Analytics initialization
 *
 * Features:
 * - Auto-initializes GA on mount if consent was previously given
 * - Provides accept/decline handlers for consent UI
 * - Updates gtag consent settings when user declines
 *
 * @returns Handlers for accept/decline actions
 */
export const useCookieConsent = (): CookieConsentHandlers => {
  useEffect(() => {
    // Initialize Google Analytics (only if user has previously consented)
    initGA();
  }, []);

  const onAccept = (): void => {
    // Re-initialize analytics with consent
    initGA();
  };

  const onDecline = (): void => {
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
