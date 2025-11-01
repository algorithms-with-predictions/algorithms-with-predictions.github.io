// HydrationDebug.jsx
// Add this component to help debug hydration mismatches

import React, { useState, useEffect } from 'react';

const HydrationDebug = ({ children, componentName = "Component" }) => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // This prevents hydration mismatch by only rendering on client
  if (!isClient) {
    return <div suppressHydrationWarning={true}>Loading...</div>;
  }

  return (
    <div>
      <div style={{ 
        fontSize: '12px', 
        color: '#666', 
        border: '1px dashed #ccc', 
        padding: '2px 4px',
        marginBottom: '4px'
      }}>
        [Client-only: {componentName}]
      </div>
      {children}
    </div>
  );
};

export default HydrationDebug;

// Usage example:
// import HydrationDebug from './HydrationDebug';
//
// function MyComponent() {
//   return (
//     <HydrationDebug componentName="MyComponent">
//       <div>{new Date().toISOString()}</div> {/* This would cause hydration mismatch */}
//     </HydrationDebug>
//   );
// }
