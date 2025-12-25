import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Link,
  Fade,
  IconButton,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Close } from '@mui/icons-material';

interface CookieConsentProps {
  onAccept: () => void;
  onDecline: () => void;
}

const CookieConsent: React.FC<CookieConsentProps> = ({
  onAccept,
  onDecline,
}) => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setShowBanner(false);
    if (onAccept) onAccept();
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setShowBanner(false);
    if (onDecline) onDecline();
  };

  const handleClose = () => {
    // Treat close as decline
    handleDecline();
  };

  if (!showBanner) return null;

  return (
    <Fade in={showBanner}>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          maxWidth: 400,
          p: 2,
          zIndex: 2000,
          borderRadius: 2,
          backgroundColor: 'background.paper',
          border: theme => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{
              position: 'absolute',
              top: -4,
              right: -4,
              backgroundColor: 'background.default',
              '&:hover': { backgroundColor: 'action.hover' },
            }}
          >
            <Close fontSize="small" />
          </IconButton>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, pr: 3 }}>
            Cookie Notice
          </Typography>

          <Typography variant="body2" color="text.secondary" paragraph>
            We use cookies to analyze website traffic and improve your
            experience.{' '}
            <Link
              component={RouterLink}
              to="/privacy"
              color="primary"
              sx={{
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Learn more
            </Link>
            .
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ mt: 2 }}
          >
            <Button
              variant="contained"
              onClick={handleAccept}
              size="small"
              sx={{ minWidth: 100 }}
            >
              Accept
            </Button>
            <Button
              variant="outlined"
              onClick={handleDecline}
              size="small"
              sx={{ minWidth: 100 }}
            >
              Decline
            </Button>
          </Stack>

          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ mt: 1, display: 'block' }}
          >
            You can change your preferences anytime in your browser settings.
          </Typography>
        </Box>
      </Paper>
    </Fade>
  );
};

export default CookieConsent;
