import React from 'react';
import { Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h1" component="h1" gutterBottom>
        404
      </Typography>
      <Typography
        variant="h4"
        component="h2"
        gutterBottom
        color="text.secondary"
      >
        Page Not Found
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }} color="text.secondary">
        Sorry, we couldn&apos;t find the page you&apos;re looking for.
      </Typography>
      <Button
        variant="contained"
        size="large"
        onClick={() => navigate('/')}
        sx={{ borderRadius: 2 }}
      >
        Go Home
      </Button>
    </Container>
  );
};

export default NotFoundPage;
