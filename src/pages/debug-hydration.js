// src/pages/debug-hydration.js
import React from 'react';
import SafeHydrationWrapper from '../components/SafeHydrationWrapper';
import { useHydration, useBrowserAPI } from '../hooks/useHydration';

const DebugHydrationPage = () => {
  const isHydrated = useHydration();
  
  // Test browser API usage
  const userAgent = useBrowserAPI(() => navigator.userAgent, 'Server');
  const timestamp = useBrowserAPI(() => new Date().toISOString(), 'Server time');

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Hydration Debug Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Hydration Status</h2>
        <p>Is Hydrated: {isHydrated ? '✅ Yes' : '❌ No'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Browser API Tests</h2>
        <p>User Agent: {userAgent}</p>
        <p>Current Time: {timestamp}</p>
      </div>

      <SafeHydrationWrapper componentName="TestComponent">
        <div style={{ 
          padding: '10px', 
          border: '1px solid #ccc',
          backgroundColor: '#f9f9f9' 
        }}>
          <h3>Test Component (Safe Wrapped)</h3>
          <p>This component is wrapped with hydration safety.</p>
          <p>Random number: {Math.random()}</p>
        </div>
      </SafeHydrationWrapper>

      <div style={{ marginTop: '20px' }}>
        <h2>Debug Tools</h2>
        <button 
          onClick={() => {
            if (typeof window !== 'undefined' && window.debugHydration) {
              window.debugHydration();
            }
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Run Debug Info
        </button>
      </div>

      {typeof window !== 'undefined' && window.hydrationErrors && (
        <div style={{ marginTop: '20px' }}>
          <h2>Hydration Errors</h2>
          <pre style={{ 
            backgroundColor: '#f8f8f8', 
            padding: '10px',
            overflow: 'auto',
            maxHeight: '300px'
          }}>
            {JSON.stringify(window.hydrationErrors, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DebugHydrationPage;
