import { Box, Container, Typography } from '@mui/material';
import PaperList from '../components/paperlist';
import { usePapersData } from '../hooks/usePapersData';
import PaperCardSkeleton from '@/components/skeletons/PaperCardSkeleton';
import StatsDashboardSkeleton from '@/components/skeletons/StatsDashboardSkeleton';

const HomePage: React.FC = () => {
  const { data, loading, error } = usePapersData();

  if (loading) {
    return (
      <Container
        maxWidth="xl"
        disableGutters
        sx={{ py: { xs: 1, md: 1.5 }, px: { xs: 0, sm: 2, md: 3 } }}
        role="status"
        aria-live="polite"
      >
        <Typography sx={{ position: 'absolute', left: '-10000px' }}>
          Loading papers...
        </Typography>
        <StatsDashboardSkeleton />
        {[1, 2, 3, 4, 5, 6].map(i => (
          <PaperCardSkeleton key={i} />
        ))}
      </Container>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        role="alert"
        aria-live="assertive"
      >
        <Typography color="error">
          Failed to load papers. Please try again later.
        </Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Typography>No papers found.</Typography>
      </Box>
    );
  }

  return <PaperList data={data} />;
};

export default HomePage;
