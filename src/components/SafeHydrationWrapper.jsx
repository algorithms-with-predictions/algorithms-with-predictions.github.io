// src/components/SafeHydrationWrapper.jsx
import React, { useState, useEffect } from 'react';
import HydrationErrorBoundary from './HydrationErrorBoundary';

const SafeHydrationWrapper = ({ 
  children, 
  componentName = 'Component',
  fallback = null,
  suppressHydrationWarning = false 
}) => {
  const [isClient, setIsClient] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Small delay to ensure hydration is complete
    const timer = setTimeout(() => {
      setHasHydrated(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // For server-side rendering, render a safe fallback
  if (!isClient) {
    return (
      <div suppressHydrationWarning={suppressHydrationWarning}>
        {fallback || <div>Loading...</div>}
      </div>
    );
  }

  // Wrap in error boundary to catch hydration issues
  return (
    <HydrationErrorBoundary componentName={componentName}>
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          fontSize: '11px',
          color: hasHydrated ? '#27ae60' : '#f39c12',
          backgroundColor: '#f8f9fa',
          padding: '2px 6px',
          marginBottom: '4px',
          border: '1px solid #dee2e6',
          borderRadius: '3px',
          fontFamily: 'monospace'
        }}>
          [{componentName}] {hasHydrated ? '✅ Hydrated' : '⏳ Hydrating...'}
        </div>
      )}
      {children}
    </HydrationErrorBoundary>
  );
};

export default SafeHydrationWrapper;
