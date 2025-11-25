import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import PaperList from '../components/paperlist.jsx';
import { usePapersData } from '../hooks/usePapersData';

const HomePage = () => {
  const { data, loading, error } = usePapersData();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
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
      >
        <Typography color="error">
          Failed to load papers. Please try again later.
        </Typography>
      </Box>
    );
  }

  return <PaperList data={data} />;
};

export default HomePage;
