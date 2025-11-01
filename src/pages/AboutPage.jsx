import React, { useState, useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import MarkdownContent from '../components/MarkdownContent.jsx';
import { loadMarkdownFile } from '../utils/markdownLoader.js';

const AboutPage = () => {
  const [markdownData, setMarkdownData] = useState({
    content: 'Loading...',
    frontmatter: {},
  });

  useEffect(() => {
    const loadContent = async () => {
      const data = await loadMarkdownFile('about');
      setMarkdownData(data);
    };

    loadContent();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mt: 3 }}>
        <MarkdownContent content={markdownData.content} />
      </Box>
    </Container>
  );
};

export default AboutPage;
