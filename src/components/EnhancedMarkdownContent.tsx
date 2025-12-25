import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Stack,
  Paper,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';
import { ExpandMore, ExpandLess, Toc } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ReactNode } from 'react';

interface TableOfContentsProps {
  content: string;
}

interface EnhancedMarkdownContentProps {
  content: string;
  frontmatter?: Record<string, string>;
  showTOC?: boolean;
  showWordCount?: boolean;
}

// Enhanced Table of Contents Component
const TableOfContentsComponent: React.FC<TableOfContentsProps> = ({
  content,
}) => {
  const [open, setOpen] = useState(false);

  const headings = useMemo(() => {
    const headingRegex = /^#{1,6}\s+(.+)$/gm;
    const matches: Array<{ level: number; text: string; id: string }> = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[0].indexOf(' ');
      const text = match[1];
      if (!text) continue;
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      matches.push({ level, text, id });
    }

    return matches;
  }, [content]);

  const scrollToHeading = (id: string): void => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (headings.length === 0) return null;

  return (
    <Paper
      elevation={1}
      sx={{
        mb: 3,
        borderRadius: 2,
        border: theme => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ p: 2 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Toc color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Table of Contents
            </Typography>
          </Stack>
          <IconButton onClick={() => setOpen(!open)} size="small">
            {open ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Stack>

        <Collapse in={open}>
          <Divider sx={{ my: 1 }} />
          <List dense>
            {headings.map((heading, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton
                  onClick={() => scrollToHeading(heading.id)}
                  sx={{
                    pl: heading.level * 2,
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <ListItemText
                    primary={heading.text}
                    primaryTypographyProps={{
                      variant: heading.level <= 2 ? 'body1' : 'body2',
                      fontWeight: heading.level <= 2 ? 'medium' : 'normal',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>
      </Box>
    </Paper>
  );
};

// Helper function to safely extract text from ReactNode for ID generation
const getTextFromChildren = (children: ReactNode): string => {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return children.toString();
  if (Array.isArray(children)) {
    return children
      .map((child: ReactNode) => getTextFromChildren(child))
      .join('');
  }
  return '';
};

const EnhancedMarkdownContent: React.FC<EnhancedMarkdownContentProps> = ({
  content,
  showTOC = true,
  showWordCount = true,
}) => {
  // Generate word count and reading time
  const { wordCount, readingTime } = useMemo(() => {
    const words = content.split(/\s+/).length;
    const reading = Math.ceil(words / 200); // Average reading speed: 200 words/minute

    return {
      wordCount: words,
      readingTime: reading,
    };
  }, [content]);

  return (
    <Box>
      {/* Reading Statistics */}
      {showWordCount && (
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip
            label={`${wordCount} words`}
            size="small"
            variant="outlined"
            color="primary"
          />
          <Chip
            label={`${readingTime} min read`}
            size="small"
            variant="outlined"
            color="secondary"
          />
        </Stack>
      )}

      {/* Table of Contents */}
      {showTOC && <TableOfContentsComponent content={content} />}

      {/* Enhanced Markdown Content */}
      <Box
        sx={{
          '& h1, & h2, & h3, & h4, & h5, & h6': {
            scrollMarginTop: '80px', // Account for fixed header
          },
          '& h1': {
            fontSize: '2.5rem',
            fontWeight: 'bold',
            mb: 2,
            mt: 3,
            color: 'text.primary',
            borderBottom: theme => `3px solid ${theme.palette.primary.main}`,
            paddingBottom: 1,
          },
          '& h2': {
            fontSize: '2rem',
            fontWeight: 'bold',
            mb: 2,
            mt: 4,
            color: 'primary.main',
            borderBottom: theme => `2px solid ${theme.palette.primary.light}`,
            paddingBottom: 0.5,
          },
          '& h3': {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            mb: 1.5,
            mt: 3,
            color: 'text.primary',
            borderBottom: theme => `1px solid ${theme.palette.divider}`,
            paddingBottom: 0.5,
          },
          '& h4': {
            fontSize: '1.25rem',
            fontWeight: 'bold',
            mb: 1,
            mt: 2,
            color: 'text.primary',
          },
          '& p': {
            mb: 2,
            lineHeight: 1.8,
            fontSize: '1rem',
            textAlign: 'justify',
          },
          '& ul': {
            mb: 2,
            pl: 3,
            '& li': {
              mb: 1.5,
              lineHeight: 1.7,
              '&::marker': {
                color: 'primary.main',
              },
            },
          },
          '& ol': {
            mb: 2,
            pl: 3,
            '& li': {
              mb: 1.5,
              lineHeight: 1.7,
            },
          },
          '& blockquote': {
            borderLeft: '4px solid',
            borderColor: 'primary.main',
            pl: 2,
            ml: 0,
            my: 2,
            fontStyle: 'italic',
            color: 'text.secondary',
            backgroundColor: 'action.hover',
            borderRadius: '0 4px 4px 0',
            padding: 2,
          },
          '& code': {
            backgroundColor: 'action.hover',
            padding: '4px 8px',
            borderRadius: 1,
            fontFamily: '"Monaco", "Consolas", monospace',
            fontSize: '0.9em',
            border: theme => `1px solid ${theme.palette.divider}`,
          },
          '& pre': {
            backgroundColor: 'action.hover',
            padding: 2,
            borderRadius: 2,
            overflow: 'auto',
            mb: 2,
            border: theme => `1px solid ${theme.palette.divider}`,
            '& code': {
              backgroundColor: 'transparent',
              padding: 0,
              border: 'none',
            },
          },
          '& strong': {
            color: 'text.primary',
            fontWeight: 600,
          },
          '& em': {
            color: 'text.secondary',
            fontStyle: 'italic',
          },
        }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ href, children }) => (
              <Box
                component="a"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 500,
                  borderBottom: theme =>
                    `2px solid ${theme.palette.primary.light}`,
                  paddingBottom: '1px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderBottomColor: 'primary.main',
                    color: 'primary.dark',
                  },
                  '&:after': {
                    content: '" ↗"',
                    fontSize: '0.8em',
                    opacity: 0.7,
                    marginLeft: '2px',
                  },
                }}
              >
                {children}
              </Box>
            ),
            h1: ({ children }: { children?: ReactNode }) => {
              const text = getTextFromChildren(children);
              const id = text
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-');
              return (
                <Typography id={id} variant="h3" component="h1">
                  {children}
                </Typography>
              );
            },
            h2: ({ children }: { children?: ReactNode }) => {
              const text = getTextFromChildren(children);
              const id = text
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-');
              return (
                <Typography id={id} variant="h4" component="h2">
                  {children}
                </Typography>
              );
            },
            h3: ({ children }: { children?: ReactNode }) => {
              const text = getTextFromChildren(children);
              const id = text
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-');
              return (
                <Typography id={id} variant="h5" component="h3">
                  {children}
                </Typography>
              );
            },
            h4: ({ children }: { children?: ReactNode }) => (
              <Typography variant="h6" component="h4">
                {children}
              </Typography>
            ),
            p: ({ children }: { children?: ReactNode }) => (
              <Typography variant="body1" paragraph>
                {children}
              </Typography>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </Box>
    </Box>
  );
};

export default EnhancedMarkdownContent;
