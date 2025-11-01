import React from 'react';
import { Container, Typography, Box, Paper, Button } from '@mui/material';

const PrivacyPage = () => {
  const clearCookiePreferences = () => {
    localStorage.removeItem('cookie_consent');
    localStorage.removeItem('cookie_consent_date');
    window.location.reload();
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Privacy Policy
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Data Collection and Usage
        </Typography>

        <Typography paragraph>
          The ALPS (Algorithms with Predictions) website collects anonymous
          usage data to help us understand how researchers use our resource and
          which papers are most valuable to the community.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          What We Collect
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          <li>Page views and navigation patterns</li>
          <li>Search queries and filter usage</li>
          <li>Geographic location (country/region level)</li>
          <li>Device type and browser information</li>
          <li>Paper interaction data (views, downloads)</li>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          What We Don't Collect
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          <li>Personal identifying information</li>
          <li>Email addresses or names</li>
          <li>Precise location data</li>
          <li>Data for advertising purposes</li>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Cookies and Tracking
        </Typography>
        <Typography paragraph>
          We use Google Analytics 4 with enhanced privacy settings. Cookies are
          only set with your explicit consent. You can withdraw consent at any
          time.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Data Retention
        </Typography>
        <Typography paragraph>
          Analytics data is automatically deleted after 14 months. We do not
          retain personal data beyond what's necessary for understanding website
          usage.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Your Rights
        </Typography>
        <Typography paragraph>
          You can opt out of tracking at any time by declining cookies or
          changing your browser settings. For questions about data usage,
          contact the site administrator.
        </Typography>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="outlined"
            onClick={clearCookiePreferences}
            sx={{ mr: 2 }}
          >
            Reset Cookie Preferences
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default PrivacyPage;
