import React, { useState, useEffect } from 'react';
import { Container, Box } from '@mui/material';
import EnhancedMarkdownContent from '../components/EnhancedMarkdownContent.jsx';
import { loadMarkdownFile } from '../utils/markdownLoader.js';

const MaterialPage = () => {
  const [markdownData, setMarkdownData] = useState({
    content: 'Loading...',
    frontmatter: {},
  });

  useEffect(() => {
    const loadContent = async () => {
      const data = await loadMarkdownFile('material');
      setMarkdownData(data);
    };

    loadContent();
  }, []);

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

export default MaterialPage;
