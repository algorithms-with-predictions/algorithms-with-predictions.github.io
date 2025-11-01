import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
  LinearProgress,
} from '@mui/material';
import { School, People, Business } from '@mui/icons-material';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'primary',
  secondaryValue,
  secondaryTitle,
  secondaryIcon: SecondaryIcon,
  tertiaryValue,
  tertiaryTitle,
  tertiaryIcon: TertiaryIcon,
}) => (
  <Card sx={{ height: '100%', borderRadius: 2 }}>
    <CardContent>
      <Stack spacing={{ xs: 1, sm: 2 }}>
        {/* Mobile: Horizontal layout, Desktop: Vertical layout */}
        <Stack
          direction={{ xs: 'row', sm: 'column' }}
          spacing={{ xs: 2, sm: 2 }}
          sx={{
            justifyContent: { xs: 'space-between', sm: 'flex-start' },
            alignItems: { xs: 'center', sm: 'stretch' },
          }}
        >
          {/* Primary Metric */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ flex: { xs: 1, sm: 'none' } }}
          >
            <Box
              sx={{
                p: { xs: 0.8, sm: 1.2 },
                borderRadius: 2,
                bgcolor: `${color}.light`,
                color: `${color}.contrastText`,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Icon sx={{ fontSize: { xs: 16, sm: 20 } }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h4"
                fontWeight="bold"
                color="text.primary"
                sx={{ fontSize: { xs: '1.1rem', sm: '2.125rem' } }}
              >
                ~{value}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                {title}
              </Typography>
            </Box>
          </Stack>

          {/* Secondary Metric */}
          {secondaryValue && SecondaryIcon && (
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ flex: { xs: 1, sm: 'none' } }}
            >
              <Box
                sx={{
                  p: { xs: 0.8, sm: 1.2 },
                  borderRadius: 2,
                  bgcolor: `${color}.light`,
                  color: `${color}.contrastText`,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <SecondaryIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color="text.primary"
                  sx={{ fontSize: { xs: '1.1rem', sm: '2.125rem' } }}
                >
                  ~{secondaryValue}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  {secondaryTitle}
                </Typography>
              </Box>
            </Stack>
          )}
        </Stack>

        {/* Tertiary Metric - Now visible on mobile with responsive sizing */}
        {tertiaryValue && TertiaryIcon && (
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                p: { xs: 0.8, sm: 1.2 },
                borderRadius: 2,
                bgcolor: `${color}.light`,
                color: `${color}.contrastText`,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <TertiaryIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h4"
                fontWeight="bold"
                color="text.primary"
                sx={{ fontSize: { xs: '1.1rem', sm: '2.125rem' } }}
              >
                ~{tertiaryValue}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                {tertiaryTitle}
              </Typography>
            </Box>
          </Stack>
        )}

        {/* Subtitle */}
        {subtitle && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textAlign: 'center', mt: 1 }}
          >
            {subtitle}
          </Typography>
        )}

        {/* Trend */}
        {trend && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <Chip
              label={trend}
              size="small"
              color={trend.startsWith('+') ? 'secondary' : 'default'}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            />
          </Box>
        )}
      </Stack>
    </CardContent>
  </Card>
);

const TopVenuesCard = ({ venues }) => (
  <Card sx={{ height: '100%', borderRadius: 2 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Top Venues
      </Typography>
      <Stack spacing={2}>
        {venues?.map((venue, index) => (
          <Box key={venue.name}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body2" fontWeight="medium">
                {venue.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {venue.count} papers
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={(venue.count / venues[0].count) * 100}
              sx={{ height: 4, borderRadius: 2, mt: 0.5 }}
            />
          </Box>
        ))}
      </Stack>
    </CardContent>
  </Card>
);

const YearDistributionChart = ({ yearData }) => {
  const maxCount = Math.max(...Object.values(yearData));
  const years = Object.keys(yearData).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <Card sx={{ height: '100%', borderRadius: 2 }}>
      <CardContent
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          py: { xs: 1, sm: 2 },
          px: { xs: 1.5, sm: 2 },
          overflow: 'hidden', // Prevent any overflow
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          fontWeight="bold"
          sx={{
            fontSize: { xs: '1rem', sm: '1.25rem' },
            mb: { xs: 1, sm: 2 },
            flexShrink: 0, // Don't shrink the title
          }}
        >
          Paper Distribution by Year
        </Typography>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'flex-end', // Align all bars to bottom
            justifyContent: 'space-around',
            position: 'relative',
            minHeight: { xs: '100px', sm: '140px' }, // Set consistent minimum height
            px: { xs: 0.5, sm: 1 },
            pb: { xs: 2, sm: 2.5 }, // Space for year labels
            pt: { xs: 2, sm: 2.5 }, // Space for count labels
          }}
        >
          {years.map(year => (
            <Box
              key={year}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                mx: { xs: 0.2, sm: 0.5 },
                height: '100%', // Full height of container
                position: 'relative',
                justifyContent: 'flex-end', // Push content to bottom
              }}
            >
              {/* Count label positioned at top */}
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  top: { xs: -20, sm: -24 },
                  color: 'text.secondary',
                  fontSize: { xs: '0.6rem', sm: '0.7rem' },
                  fontWeight: 'medium',
                  whiteSpace: 'nowrap',
                }}
              >
                {yearData[year]}
              </Typography>

              {/* Bar - proportional height based on data */}
              <Box
                sx={{
                  width: '100%',
                  maxWidth: { xs: '16px', sm: '24px' },
                  // Height proportional to data value, using available chart space
                  height: {
                    xs: `${Math.max((yearData[year] / maxCount) * 60, 4)}px`, // Min 4px, max 60px
                    sm: `${Math.max((yearData[year] / maxCount) * 90, 6)}px`, // Min 6px, max 90px
                  },
                  backgroundColor: theme => theme.palette.primary.main,
                  borderRadius: '4px 4px 0 0',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: theme => theme.palette.primary.dark,
                    transform: 'scaleY(1.05)',
                    transformOrigin: 'bottom',
                  },
                }}
              />

              {/* Year label positioned at bottom */}
              <Typography
                variant="body2"
                sx={{
                  position: 'absolute',
                  bottom: { xs: -18, sm: -22 },
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  fontWeight: 'medium',
                  color: 'text.secondary',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                {year}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

const StatsDashboard = ({ data }) => {
  // Calculate statistics
  const totalPapers = data.length;

  // Calculate unique authors
  const allAuthors = new Set();
  data.forEach(paper => {
    if (paper.authors) {
      // Handle both string and array formats
      const authorList =
        typeof paper.authors === 'string'
          ? paper.authors.split(', ').map(a => a.trim())
          : paper.authors;
      authorList.forEach(author => allAuthors.add(author));
    }
  });
  const totalAuthors = allAuthors.size;

  // Calculate unique venues
  const uniqueVenues = new Set();
  data.forEach(paper => {
    paper.publications.forEach(pub => {
      if (pub.name && pub.name !== 'arXiv') {
        uniqueVenues.add(pub.name);
      }
    });
  });
  const totalVenues = uniqueVenues.size;

  // Calculate year distribution
  const yearDistribution = data.reduce((acc, paper) => {
    // Get the earliest publication year for each paper
    if (paper.publications && paper.publications.length > 0) {
      const years = paper.publications
        .map(pub => pub.year)
        .filter(
          year =>
            year !== null &&
            year !== undefined &&
            !isNaN(year) &&
            isFinite(year)
        );
      if (years.length > 0) {
        const earliestYear = Math.min(...years);
        acc[earliestYear] = (acc[earliestYear] || 0) + 1;
      }
    }
    return acc;
  }, {});

  const allVenues = data.flatMap(p =>
    p.publications.map(pub => pub.name).filter(name => name !== 'arXiv')
  );
  const venueStats = Object.entries(
    allVenues.reduce((acc, venue) => {
      acc[venue] = (acc[venue] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="stretch">
        {/* Compact Total Papers & Authors & Venues */}
        <Grid item xs={12} sm={6} md={2.5}>
          <StatCard
            title="Papers"
            value={totalPapers}
            secondaryValue={totalAuthors}
            secondaryTitle="Authors"
            tertiaryValue={totalVenues}
            tertiaryTitle="Venues/Journals"
            icon={School}
            secondaryIcon={People}
            tertiaryIcon={Business}
            color="primary"
          />
        </Grid>

        {/* Year Distribution Chart */}
        <Grid item xs={12} sm={6} md={4.5}>
          <YearDistributionChart yearData={yearDistribution} />
        </Grid>

        {/* Compact Top Venues */}
        <Grid item xs={12} md={5}>
          <TopVenuesCard venues={venueStats} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default StatsDashboard;
