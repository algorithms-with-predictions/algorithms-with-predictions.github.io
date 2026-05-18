import { Container, Box, CircularProgress, Alert } from '@mui/material';
import EnhancedMarkdownContent from '../components/EnhancedMarkdownContent';
import { useMarkdownContent } from '../hooks/useMarkdownContent';

const ContributePage = () => {
  const {
    data: markdownData,
    isLoading,
    error,
  } = useMarkdownContent('contribute');

  // Handle loading state
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
          }}
        >
          <CircularProgress aria-label="Loading contribute content" />
        </Box>
      </Container>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Failed to load contribute page content. Please try again later.
        </Alert>
      </Container>
    );
  }

  // Handle case where data might be undefined (shouldn't happen but TypeScript safety)
  if (!markdownData) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mt: 3 }}>
        <EnhancedMarkdownContent
          content={markdownData.content}
          frontmatter={markdownData.frontmatter}
          showTOC={false}
          showWordCount={false}
        />
      </Box>
    </Container>
  );
};

export default ContributePage;
