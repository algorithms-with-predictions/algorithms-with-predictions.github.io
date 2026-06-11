import { Container, Typography, Box, Button, Stack } from '@mui/material';

const sectionSx = {
  pt: { xs: 3, md: 3.5 },
  borderTop: 1,
  borderColor: 'divider',
};

const PrivacyPage: React.FC = () => {
  const clearCookiePreferences = (): void => {
    localStorage.removeItem('cookie_consent');
    localStorage.removeItem('cookie_consent_date');
    window.location.reload();
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={{ xs: 3, md: 3.5 }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            Privacy Policy
          </Typography>
        </Box>

        <Box component="section" sx={sectionSx}>
          <Typography variant="h5" gutterBottom>
            Data Collection and Usage
          </Typography>

          <Typography paragraph>
            The ALPS (Algorithms with Predictions) website collects anonymous
            usage data to help us understand how researchers use our resource
            and which papers are most valuable to the community.
          </Typography>
        </Box>

        <Box component="section" sx={sectionSx}>
          <Typography variant="h6" gutterBottom>
            What We Collect
          </Typography>
          <Box component="ul" sx={{ pl: 2, my: 0 }}>
            <li>Page views and navigation patterns</li>
            <li>Search queries and filter usage</li>
            <li>Geographic location (country/region level)</li>
            <li>Device type and browser information</li>
            <li>Paper interaction data (views, downloads)</li>
          </Box>
        </Box>

        <Box component="section" sx={sectionSx}>
          <Typography variant="h6" gutterBottom>
            What We Don&apos;t Collect
          </Typography>
          <Box component="ul" sx={{ pl: 2, my: 0 }}>
            <li>Personal identifying information</li>
            <li>Email addresses or names</li>
            <li>Precise location data</li>
            <li>Data for advertising purposes</li>
          </Box>
        </Box>

        <Box component="section" sx={sectionSx}>
          <Typography variant="h6" gutterBottom>
            Cookies and Tracking
          </Typography>
          <Typography paragraph>
            We use Google Analytics 4 with enhanced privacy settings. Cookies
            are only set with your explicit consent. You can withdraw consent at
            any time.
          </Typography>
        </Box>

        <Box component="section" sx={sectionSx}>
          <Typography variant="h6" gutterBottom>
            Data Retention
          </Typography>
          <Typography paragraph>
            Analytics data is automatically deleted after 14 months. We do not
            retain personal data beyond what&apos;s necessary for understanding
            website usage.
          </Typography>
        </Box>

        <Box component="section" sx={sectionSx}>
          <Typography variant="h6" gutterBottom>
            Your Rights
          </Typography>
          <Typography paragraph>
            You can opt out of tracking at any time by declining cookies or
            changing your browser settings. For questions about data usage,
            contact the site administrator.
          </Typography>
        </Box>

        <Box sx={{ ...sectionSx, textAlign: 'center' }}>
          <Button
            variant="outlined"
            onClick={clearCookiePreferences}
            sx={{ mr: 2 }}
          >
            Reset Cookie Preferences
          </Button>
        </Box>
      </Stack>
    </Container>
  );
};

export default PrivacyPage;
