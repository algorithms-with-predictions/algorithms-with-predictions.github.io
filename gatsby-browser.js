// gatsby-browser.js
import React from 'react';

// Enhanced error tracking for hydration issues
let hydrationErrorCount = 0;

export const wrapRootElement = ({ element }) => {
  // Add global error tracking
  if (typeof window !== 'undefined') {
    // Track hydration errors
    window.addEventListener('error', (event) => {
      if (event.error && event.error.message.includes('hydrat')) {
        hydrationErrorCount++;
        console.group(`🔥 HYDRATION ERROR #${hydrationErrorCount}`);
        console.error('Error:', event.error);
        console.error('Filename:', event.filename);
        console.error('Line:', event.lineno);
        console.error('Column:', event.colno);
        console.groupEnd();
      }
    });

    // Track React errors
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && event.reason.message && event.reason.message.includes('hydrat')) {
        console.error('🔥 UNHANDLED HYDRATION REJECTION:', event.reason);
      }
    });

    // Debug helper function
    window.debugHydration = () => {
      console.group('🔍 HYDRATION DEBUG INFO');
      console.log('Hydration errors caught:', window.hydrationErrors || []);
      console.log('Error count:', hydrationErrorCount);
      console.log('React version:', React.version);
      console.log('Document ready state:', document.readyState);
      console.groupEnd();
    };
  }

  return element;
};

export const onClientEntry = () => {
  // Suppress hydration warnings in development for known issues
  if (process.env.NODE_ENV === 'development') {
    const originalError = console.error;
    console.error = (...args) => {
      const errorMessage = args[0];
      
      // Log hydration mismatches with more context
      if (typeof errorMessage === 'string' && errorMessage.includes('Text content does not match')) {
        console.group('⚠️ HYDRATION MISMATCH DETECTED');
        console.warn('This is a development-only warning about hydration mismatch');
        console.log('Error details:', ...args);
        console.log('Check for:');
        console.log('- Date/time formatting differences');
        console.log('- Random IDs or keys');
        console.log('- Browser-only APIs');
        console.log('- CSS-in-JS hydration issues');
        console.groupEnd();
        return;
      }

      // Log other hydration errors
      if (typeof errorMessage === 'string' && errorMessage.includes('hydrat')) {
        console.group('🚨 HYDRATION ERROR');
        originalError(...args);
        console.groupEnd();
        return;
      }

      // Pass through other errors
      originalError(...args);
    };
  }
};

// Handle page transitions to reset error state
export const onRouteUpdate = ({ location, prevLocation }) => {
  if (typeof window !== 'undefined') {
    // Reset hydration error tracking on route change
    if (prevLocation && prevLocation.pathname !== location.pathname) {
      hydrationErrorCount = 0;
      if (window.hydrationErrors) {
        window.hydrationErrors = [];
      }
    }
  }
};

// Wrap page elements with error boundaries
export const wrapPageElement = ({ element, props }) => {
  return element;
};
