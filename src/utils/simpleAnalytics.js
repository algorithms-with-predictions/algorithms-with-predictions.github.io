// Simple, privacy-focused analytics alternative
// This is a lightweight option that doesn't use cookies and respects privacy

const ANALYTICS_ENDPOINT = 'https://api.your-analytics-service.com/track'; // Replace with your endpoint

// Simple analytics without cookies or personal data
export const initSimpleAnalytics = () => {
  // Only track basic page loads, no personal data
  if (
    typeof window !== 'undefined' &&
    !sessionStorage.getItem('analytics_session')
  ) {
    // Mark session to avoid double counting
    sessionStorage.setItem('analytics_session', Date.now().toString());

    trackSimpleEvent('page_load', {
      page: window.location.pathname,
      referrer: document.referrer
        ? new URL(document.referrer).hostname
        : 'direct',
      timestamp: new Date().toISOString(),
    });
  }
};

// Track simple events without personal identification
export const trackSimpleEvent = async (eventType, data = {}) => {
  try {
    // Only send if user hasn't opted out
    if (localStorage.getItem('analytics_opt_out') === 'true') {
      return;
    }

    const payload = {
      type: eventType,
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
      // No IP, no cookies, no fingerprinting
      ...data,
    };

    // Send to your analytics endpoint
    await fetch(ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    // Fail silently to not break the site
    console.debug('Analytics request failed:', error);
  }
};

// Alternative: Use a free service like GoatCounter
export const initGoatCounter = () => {
  if (typeof window !== 'undefined') {
    // GoatCounter script - replace 'your-site' with your actual GoatCounter site
    const script = document.createElement('script');
    script.async = true;
    script.src = '//gc.zgo.at/count.js';
    script.setAttribute(
      'data-goatcounter',
      'https://your-site.goatcounter.com/count'
    );
    document.head.appendChild(script);
  }
};

// Opt-out function for users who don't want tracking
export const optOutAnalytics = () => {
  localStorage.setItem('analytics_opt_out', 'true');
  console.log('Analytics tracking disabled');
};

// Check if user has opted out
export const hasOptedOut = () => {
  return localStorage.getItem('analytics_opt_out') === 'true';
};
