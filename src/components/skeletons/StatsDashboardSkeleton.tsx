import { Grid, Card, CardContent, Stack, Skeleton, Box } from '@mui/material';

/**
 * Skeleton loading state for StatsDashboard
 * Shows placeholder cards matching the stats dashboard layout
 */
const StatsDashboardSkeleton: React.FC = () => (
  <Box sx={{ mb: { xs: 0.5, sm: 0.75 } }}>
    <Grid container spacing={{ xs: 1.5, sm: 2 }}>
      {/* First card - Stats card with multiple metrics */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
          }}
        >
          <CardContent sx={{ py: { xs: 1.5, sm: 2 }, px: { xs: 1.5, sm: 2 } }}>
            <Stack spacing={{ xs: 0.5, sm: 1 }}>
              {/* Primary metric */}
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Skeleton variant="rounded" width={32} height={32} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="50%" height={28} />
                  <Skeleton variant="text" width="70%" height={16} />
                </Box>
              </Stack>
              {/* Secondary metric */}
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Skeleton variant="rounded" width={32} height={32} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="50%" height={28} />
                  <Skeleton variant="text" width="70%" height={16} />
                </Box>
              </Stack>
              {/* Tertiary metric */}
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Skeleton variant="rounded" width={32} height={32} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="50%" height={28} />
                  <Skeleton variant="text" width="80%" height={16} />
                </Box>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Second card - Year distribution chart */}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
          }}
        >
          <CardContent sx={{ py: { xs: 1.5, sm: 2 }, px: { xs: 1.5, sm: 2 } }}>
            <Skeleton variant="text" width="80%" height={24} sx={{ mb: 2 }} />
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="flex-end"
              sx={{ height: 100 }}
            >
              {[60, 80, 100, 70, 90, 85, 95, 75].map((height, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  sx={{
                    flex: 1,
                    height: `${height}%`,
                    borderRadius: '4px 4px 0 0',
                  }}
                />
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Third card - Top venues */}
      <Grid size={{ xs: 12, md: 5 }}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
          }}
        >
          <CardContent sx={{ py: { xs: 1.5, sm: 2 }, px: { xs: 1.5, sm: 2 } }}>
            <Skeleton variant="text" width="60%" height={24} sx={{ mb: 2 }} />
            <Stack
              direction="row"
              spacing={1}
              alignItems="flex-end"
              sx={{ height: 100 }}
            >
              {[100, 85, 70, 60, 50].map((height, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  sx={{
                    flex: 1,
                    height: `${height}%`,
                    borderRadius: '4px 4px 0 0',
                  }}
                />
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Box>
);

export default StatsDashboardSkeleton;
