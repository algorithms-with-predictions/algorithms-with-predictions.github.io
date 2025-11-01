// src/components/HydrationErrorBoundary.jsx
import React from 'react';

class HydrationErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the hydration error with detailed information
    console.group('🚨 HYDRATION ERROR CAUGHT');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Props:', this.props);
    console.groupEnd();

    // Store error details in state
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Also log to a global array for debugging
    if (typeof window !== 'undefined') {
      window.hydrationErrors = window.hydrationErrors || [];
      window.hydrationErrors.push({
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        component: this.props.componentName || 'Unknown'
      });
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI for hydration errors
      return (
        <div style={{
          padding: '20px',
          border: '2px solid #ff6b6b',
          borderRadius: '8px',
          backgroundColor: '#fff5f5',
          color: '#d63031',
          fontFamily: 'monospace'
        }}>
          <h3>⚠️ Hydration Error Detected</h3>
          <p><strong>Component:</strong> {this.props.componentName || 'Unknown'}</p>
          <p><strong>Error:</strong> {this.state.error?.message}</p>
          {process.env.NODE_ENV === 'development' && (
            <details style={{ marginTop: '10px' }}>
              <summary>Debug Details</summary>
              <pre style={{ 
                fontSize: '12px', 
                overflow: 'auto', 
                maxHeight: '200px',
                backgroundColor: '#f8f8f8',
                padding: '10px',
                marginTop: '5px'
              }}>
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default HydrationErrorBoundary;
