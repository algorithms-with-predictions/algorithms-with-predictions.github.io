// Google Analytics utility functions

// Get GA4 Measurement ID from environment variables
const GA_MEASUREMENT_ID =
  import.meta.env.VITE_GA_MEASUREMENT_ID ||
  process.env.REACT_APP_GA_MEASUREMENT_ID;

// Check if user has consented to cookies
const hasConsent = () => {
  if (typeof window === 'undefined') return false;
  const consent = localStorage.getItem('cookie_consent');
  return consent === 'accepted';
};

// Initialize Google Analytics
export const initGA = () => {
  if (
    typeof window !== 'undefined' &&
    GA_MEASUREMENT_ID &&
    GA_MEASUREMENT_ID !== 'GA_MEASUREMENT_ID' &&
    hasConsent()
  ) {
    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function () {
        window.dataLayer.push(arguments);
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

// Track page views
export const trackPageView = (path, title) => {
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

// Track custom events
export const trackEvent = (eventName, parameters = {}) => {
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

// Track paper views/interactions
export const trackPaperView = (paperTitle, paperCategory) => {
  trackEvent('paper_view', {
    category: 'paper_interaction',
    label: paperTitle,
    custom_parameter_1: paperCategory,
  });
};

// Track search queries
export const trackSearch = (searchTerm, resultsCount) => {
  trackEvent('search', {
    category: 'search',
    label: searchTerm,
    value: resultsCount,
  });
};

// Track filter usage
export const trackFilter = (filterType, filterValue) => {
  trackEvent('filter_usage', {
    category: 'filtering',
    label: `${filterType}: ${filterValue}`,
  });
};
