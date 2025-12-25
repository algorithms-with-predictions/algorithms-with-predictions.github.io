import { Typography, Box, Link } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
  content: string;
}

const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {
  return (
    <Box
      sx={{
        '& h1': {
          fontSize: '2.5rem',
          fontWeight: 'bold',
          mb: 2,
          mt: 3,
        },
        '& h2': {
          fontSize: '2rem',
          fontWeight: 'bold',
          mb: 2,
          mt: 4,
          color: 'primary.main',
        },
        '& h3': {
          fontSize: '1.5rem',
          fontWeight: 'bold',
          mb: 1.5,
          mt: 3,
        },
        '& h4': {
          fontSize: '1.25rem',
          fontWeight: 'bold',
          mb: 1,
          mt: 2,
        },
        '& p': {
          mb: 2,
          lineHeight: 1.6,
          fontSize: '1rem',
        },
        '& ul': {
          mb: 2,
          pl: 3,
          '& li': {
            mb: 1,
            lineHeight: 1.6,
          },
        },
        '& ol': {
          mb: 2,
          pl: 3,
          '& li': {
            mb: 1,
            lineHeight: 1.6,
          },
        },
        '& blockquote': {
          borderLeft: '4px solid',
          borderColor: 'primary.light',
          pl: 2,
          ml: 0,
          fontStyle: 'italic',
          color: 'text.secondary',
        },
        '& code': {
          backgroundColor: 'action.hover',
          padding: '2px 6px',
          borderRadius: 1,
          fontFamily: 'monospace',
          fontSize: '0.9em',
        },
        '& pre': {
          backgroundColor: 'action.hover',
          padding: 2,
          borderRadius: 1,
          overflow: 'auto',
          mb: 2,
          '& code': {
            backgroundColor: 'transparent',
            padding: 0,
          },
        },
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <Link
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              color="primary"
              sx={{
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {children}
            </Link>
          ),
          h1: ({ children }) => (
            <Typography
              variant="h3"
              component="h1"
              sx={{ fontSize: '2.5rem', fontWeight: 'bold', mb: 2, mt: 3 }}
            >
              {children}
            </Typography>
          ),
          h2: ({ children }) => (
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontSize: '2rem',
                fontWeight: 'bold',
                mb: 2,
                mt: 4,
                color: 'primary.main',
              }}
            >
              {children}
            </Typography>
          ),
          h3: ({ children }) => (
            <Typography
              variant="h5"
              component="h3"
              sx={{ fontSize: '1.5rem', fontWeight: 'bold', mb: 1.5, mt: 3 }}
            >
              {children}
            </Typography>
          ),
          h4: ({ children }) => (
            <Typography
              variant="h6"
              component="h4"
              sx={{ fontSize: '1.25rem', fontWeight: 'bold', mb: 1, mt: 2 }}
            >
              {children}
            </Typography>
          ),
          p: ({ children }) => (
            <Typography
              variant="body1"
              paragraph
              sx={{ mb: 2, lineHeight: 1.6, fontSize: '1rem' }}
            >
              {children}
            </Typography>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
};

export default MarkdownContent;
