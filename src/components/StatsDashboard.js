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
      <Stack spacing={2}>
        {/* Primary Metric */}
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              p: 1.2,
              borderRadius: 2,
              bgcolor: `${color}.light`,
              color: `${color}.contrastText`,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Icon sx={{ fontSize: 20 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              ~{value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Stack>

        {/* Secondary Metric */}
        {secondaryValue && SecondaryIcon && (
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                p: 1.2,
                borderRadius: 2,
                bgcolor: `${color}.light`,
                color: `${color}.contrastText`,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <SecondaryIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" fontWeight="bold" color="text.primary">
                ~{secondaryValue}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {secondaryTitle}
              </Typography>
            </Box>
          </Stack>
        )}

        {/* Tertiary Metric */}
        {tertiaryValue && TertiaryIcon && (
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                p: 1.2,
                borderRadius: 2,
                bgcolor: `${color}.light`,
                color: `${color}.contrastText`,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <TertiaryIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" fontWeight="bold" color="text.primary">
                ~{tertiaryValue}
              </Typography>
              <Typography variant="body2" color="text.secondary">
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
              color={trend.startsWith('+') ? 'success' : 'default'}
              variant="outlined"
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
        sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Paper Distribution by Year
        </Typography>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'end',
            justifyContent: 'space-around',
            mt: 2,
            mb: 2,
            minHeight: '120px',
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
                mx: 0.5,
              }}
            >
              {/* Bar */}
              <Box
                sx={{
                  width: '100%',
                  maxWidth: '24px',
                  height: `${(yearData[year] / maxCount) * 80 + 10}px`,
                  backgroundColor: theme => theme.palette.primary.main,
                  borderRadius: '4px 4px 0 0',
                  display: 'flex',
                  alignItems: 'end',
                  justifyContent: 'center',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: theme => theme.palette.primary.dark,
                    transform: 'scaleY(1.05)',
                  },
                }}
              >
                {/* Count label on top of bar */}
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    top: -20,
                    color: 'text.secondary',
                    fontSize: '0.7rem',
                    fontWeight: 'medium',
                  }}
                >
                  {yearData[year]}
                </Typography>
              </Box>

              {/* Year label */}
              <Typography
                variant="body2"
                sx={{
                  mt: 1,
                  fontSize: '0.75rem',
                  fontWeight: 'medium',
                  color: 'text.secondary',
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
      <Grid container spacing={2} alignItems="stretch">
        {/* Compact Total Papers & Authors & Venues */}
        <Grid item xs={12} sm={4} md={2.5}>
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
        <Grid item xs={12} sm={8} md={4.5}>
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
