import { Component, ReactNode, ErrorInfo } from 'react';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component to catch and display React errors gracefully
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(_error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }

    // Store error details in state
    this.setState({
      error,
      errorInfo,
    });

    // Optional: Log to error reporting service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    // Reload the page to reset application state
    window.location.reload();
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md">
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="60vh"
            textAlign="center"
            p={3}
          >
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 2,
                maxWidth: 600,
              }}
            >
              <ErrorOutline color="error" sx={{ fontSize: 64, mb: 2 }} />

              <Typography variant="h4" gutterBottom color="error">
                Oops! Something went wrong
              </Typography>

              <Typography variant="body1" color="text.secondary" paragraph>
                We encountered an unexpected error while rendering this page.
                Please try reloading the page.
              </Typography>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                    textAlign: 'left',
                    maxHeight: 200,
                    overflow: 'auto',
                  }}
                >
                  <Typography
                    variant="caption"
                    component="pre"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </Typography>
                </Box>
              )}

              <Button
                variant="contained"
                color="primary"
                onClick={this.handleReset}
                sx={{ mt: 3 }}
              >
                Reload Page
              </Button>
            </Paper>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
