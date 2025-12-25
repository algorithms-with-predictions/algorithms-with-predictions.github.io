/**
 * Google Analytics utility functions with privacy-conscious implementation
 */

// Extend Window interface to include gtag
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

// Get GA4 Measurement ID from environment variables
const GA_MEASUREMENT_ID =
  import.meta.env?.VITE_GA_MEASUREMENT_ID ||
  process.env.REACT_APP_GA_MEASUREMENT_ID;

/**
 * Check if user has consented to cookies
 */
const hasConsent = (): boolean => {
  if (typeof window === 'undefined') return false;
  const consent = localStorage.getItem('cookie_consent');
  return consent === 'accepted';
};

/**
 * Initialize Google Analytics with privacy-enhanced settings
 *
 * Only initializes if:
 * - Running in browser
 * - GA Measurement ID is configured
 * - User has given cookie consent
 *
 * Privacy settings:
 * - IP anonymization enabled
 * - Google signals disabled
 * - Ad personalization disabled
 */
export const initGA = (): void => {
  if (
    typeof window !== 'undefined' &&
    GA_MEASUREMENT_ID &&
    GA_MEASUREMENT_ID !== 'GA_MEASUREMENT_ID' &&
    hasConsent()
  ) {
    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function (...args: unknown[]) {
        window.dataLayer.push(args);
      };

    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_title: document.title,
      page_location: window.location.href,
      // Enhanced privacy settings
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
  }
};

/**
 * Track page views
 *
 * @param path - Page path (e.g., "/about")
 * @param title - Page title
 */
export const trackPageView = (path: string, title: string): void => {
  if (
    typeof window !== 'undefined' &&
    window.gtag &&
    GA_MEASUREMENT_ID &&
    GA_MEASUREMENT_ID !== 'GA_MEASUREMENT_ID' &&
    hasConsent()
  ) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: path,
      page_title: title,
    });
  }
};

/**
 * Event parameters for custom analytics events
 */
interface EventParameters {
  category?: string;
  label?: string;
  value?: number;
  custom_parameter_1?: string;
  [key: string]: string | number | undefined;
}

/**
 * Track custom events
 *
 * @param eventName - Name of the event
 * @param parameters - Event parameters
 */
export const trackEvent = (
  eventName: string,
  parameters: EventParameters = {}
): void => {
  if (
    typeof window !== 'undefined' &&
    window.gtag &&
    GA_MEASUREMENT_ID &&
    GA_MEASUREMENT_ID !== 'GA_MEASUREMENT_ID' &&
    hasConsent()
  ) {
    window.gtag('event', eventName, {
      event_category: parameters.category || 'engagement',
      event_label: parameters.label,
      value: parameters.value,
      ...parameters,
    });
  }
};

/**
 * Track paper views/interactions
 *
 * @param paperTitle - Title of the paper
 * @param paperCategory - Category/label of the paper
 */
export const trackPaperView = (
  paperTitle: string,
  paperCategory: string
): void => {
  trackEvent('paper_view', {
    category: 'paper_interaction',
    label: paperTitle,
    custom_parameter_1: paperCategory,
  });
};

/**
 * Track search queries
 *
 * @param searchTerm - The search query
 * @param resultsCount - Number of results returned
 */
export const trackSearch = (searchTerm: string, resultsCount: number): void => {
  trackEvent('search', {
    category: 'search',
    label: searchTerm,
    value: resultsCount,
  });
};

/**
 * Track filter usage
 *
 * @param filterType - Type of filter (e.g., "label", "year")
 * @param filterValue - Value of the filter
 */
export const trackFilter = (filterType: string, filterValue: string): void => {
  trackEvent('filter_usage', {
    category: 'filtering',
    label: `${filterType}: ${filterValue}`,
  });
};
