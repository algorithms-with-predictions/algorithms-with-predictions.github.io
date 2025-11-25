import React from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
} from '@mui/material';
import { School, People, Business } from '@mui/icons-material';
import { calculateStats } from '../utils/statsUtils';

const MetricItem = ({ icon: Icon, value, title, color = 'primary' }) => (
  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1 }}>
    <Box
      sx={{
        p: { xs: 0.6, sm: 1 },
        borderRadius: 1.5,
        bgcolor: `${color}.light`,
        color: `${color}.contrastText`,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Icon sx={{ fontSize: { xs: 14, sm: 18 } }} />
    </Box>
    <Box sx={{ flex: 1 }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        color="text.primary"
        sx={{
          fontSize: { xs: '1rem', sm: '1.75rem' },
          lineHeight: 1.2,
        }}
      >
        {value}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
      >
        {title}
      </Typography>
    </Box>
  </Stack>
);

MetricItem.propTypes = {
  icon: PropTypes.elementType.isRequired,
  value: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  color: PropTypes.string,
};

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'primary',
  secondaryValue,
  secondaryTitle,
  secondaryIcon,
  tertiaryValue,
  tertiaryTitle,
  tertiaryIcon,
}) => (
  <Card sx={{ height: '100%', borderRadius: 2 }}>
    <CardContent sx={{ py: { xs: 1.5, sm: 2 }, px: { xs: 1.5, sm: 2 } }}>
      <Stack spacing={{ xs: 0.5, sm: 1 }}>
        {/* Mobile: Horizontal layout, Desktop: Vertical layout */}
        <Stack
          direction={{ xs: 'row', sm: 'column' }}
          spacing={{ xs: 1.5, sm: 1 }}
          sx={{
            justifyContent: { xs: 'space-between', sm: 'flex-start' },
            alignItems: { xs: 'center', sm: 'stretch' },
          }}
        >
          <MetricItem icon={icon} value={value} title={title} color={color} />

          {secondaryValue && secondaryIcon && (
            <MetricItem
              icon={secondaryIcon}
              value={secondaryValue}
              title={secondaryTitle}
              color={color}
            />
          )}
        </Stack>

        {tertiaryValue && tertiaryIcon && (
          <MetricItem
            icon={tertiaryIcon}
            value={tertiaryValue}
            title={tertiaryTitle}
            color={color}
          />
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

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.elementType.isRequired,
  trend: PropTypes.string,
  color: PropTypes.string,
  secondaryValue: PropTypes.number,
  secondaryTitle: PropTypes.string,
  secondaryIcon: PropTypes.elementType,
  tertiaryValue: PropTypes.number,
  tertiaryTitle: PropTypes.string,
  tertiaryIcon: PropTypes.elementType,
};

const TopVenuesCard = ({ venues }) => {
  const maxCount = venues.length > 0 ? venues[0].count : 1;

  return (
    <Card sx={{ height: '100%', borderRadius: 2 }}>
      <CardContent
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          py: { xs: 1.5, sm: 2 },
          px: { xs: 1.5, sm: 2 },
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          fontWeight="bold"
          sx={{
            fontSize: { xs: '0.9rem', sm: '1.25rem' },
            mb: { xs: 0.75, sm: 1.5 },
            flexShrink: 0,
          }}
        >
          Top Venues
        </Typography>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-around',
            position: 'relative',
            minHeight: { xs: '80px', sm: '110px' },
            px: { xs: 0.5, sm: 1 },
            pb: { xs: 1.5, sm: 2 },
            pt: { xs: 1.5, sm: 2 },
          }}
        >
          {venues?.map(venue => (
            <Box
              key={venue.name}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                mx: { xs: 0.2, sm: 0.4 },
                height: '100%',
                position: 'relative',
                justifyContent: 'flex-end',
              }}
            >
              {/* Count label positioned at top */}
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  top: { xs: -16, sm: -20 },
                  color: 'text.secondary',
                  fontSize: { xs: '0.55rem', sm: '0.65rem' },
                  fontWeight: 'medium',
                  whiteSpace: 'nowrap',
                }}
              >
                {venue.count}
              </Typography>

              {/* Bar - proportional height based on data */}
              <Box
                sx={{
                  width: '100%',
                  maxWidth: { xs: '28px', sm: '44px' },
                  height: {
                    xs: `${Math.max((venue.count / maxCount) * 45, 4)}px`,
                    sm: `${Math.max((venue.count / maxCount) * 65, 6)}px`,
                  },
                  backgroundColor: theme => theme.palette.secondary.main,
                  borderRadius: '4px 4px 0 0',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: theme => theme.palette.secondary.dark,
                    transform: 'scaleY(1.05)',
                    transformOrigin: 'bottom',
                  },
                }}
              />

              {/* Venue label positioned at bottom */}
              <Typography
                variant="body2"
                sx={{
                  position: 'absolute',
                  bottom: { xs: -16, sm: -20 },
                  fontSize: { xs: '0.55rem', sm: '0.65rem' },
                  fontWeight: 'medium',
                  color: 'text.secondary',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  maxWidth: { xs: '35px', sm: '50px' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {venue.name}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

TopVenuesCard.propTypes = {
  venues: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
    })
  ),
};

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
          py: { xs: 1.5, sm: 2 },
          px: { xs: 1.5, sm: 2 },
          overflow: 'hidden',
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          fontWeight="bold"
          sx={{
            fontSize: { xs: '0.9rem', sm: '1.25rem' },
            mb: { xs: 0.75, sm: 1.5 },
            flexShrink: 0,
          }}
        >
          Paper Distribution by Year
        </Typography>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-around',
            position: 'relative',
            minHeight: { xs: '80px', sm: '110px' },
            px: { xs: 0.5, sm: 1 },
            pb: { xs: 1.5, sm: 2 },
            pt: { xs: 1.5, sm: 2 },
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
                height: '100%',
                position: 'relative',
                justifyContent: 'flex-end',
              }}
            >
              {/* Count label positioned at top */}
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  top: { xs: -16, sm: -20 },
                  color: 'text.secondary',
                  fontSize: { xs: '0.55rem', sm: '0.65rem' },
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
                  maxWidth: { xs: '14px', sm: '20px' },
                  height: {
                    xs: `${Math.max((yearData[year] / maxCount) * 45, 4)}px`,
                    sm: `${Math.max((yearData[year] / maxCount) * 65, 6)}px`,
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
                  bottom: { xs: -16, sm: -20 },
                  fontSize: { xs: '0.6rem', sm: '0.7rem' },
                  fontWeight: 'medium',
                  color: 'text.secondary',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                &apos;{year.toString().slice(-2)}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

YearDistributionChart.propTypes = {
  yearData: PropTypes.objectOf(PropTypes.number).isRequired,
};

const StatsDashboard = ({ data }) => {
  const {
    totalPapers,
    totalAuthors,
    totalVenues,
    yearDistribution,
    venueStats,
  } = calculateStats(data);

  return (
    <Box sx={{ mb: { xs: 0.5, sm: 0.75 } }}>
      <Grid container spacing={{ xs: 1.5, sm: 2 }}>
        {/* Compact Total Papers & Authors & Venues */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <YearDistributionChart yearData={yearDistribution} />
        </Grid>

        {/* Compact Top Venues */}
        <Grid size={{ xs: 12, md: 5 }}>
          <TopVenuesCard venues={venueStats} />
        </Grid>
      </Grid>
    </Box>
  );
};

StatsDashboard.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default StatsDashboard;
