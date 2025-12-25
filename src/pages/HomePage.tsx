import { Box, CircularProgress, Typography } from '@mui/material';
import PaperList from '../components/paperlist.jsx';
import { usePapersData } from '../hooks/usePapersData';

const HomePage: React.FC = () => {
  const { data, loading, error } = usePapersData();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        role="status"
        aria-live="polite"
        aria-label="Loading papers"
      >
        <CircularProgress aria-label="Loading" />
        <Typography sx={{ position: 'absolute', left: '-10000px' }}>
          Loading papers...
        </Typography>
      </Box>
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
