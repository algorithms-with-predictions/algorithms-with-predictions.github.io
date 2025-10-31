import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Box,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 0,
  border: `1px solid ${theme.palette.divider}`,
  borderTop: 0,
  transition: 'all 0.2s ease',
  margin: 0,
  '&:first-of-type': {
    borderTop: `1px solid ${theme.palette.divider}`,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  '&:last-of-type': {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: theme.shadows[4],
    borderColor: theme.palette.primary.main,
    zIndex: 1,
  },
}));

const PaperTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  lineHeight: 1.1,
  marginBottom: theme.spacing(0.25),
  fontSize: '1rem',
}));

const AuthorText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.8rem',
  fontWeight: 500,
}));

const openInNewTab = url => {
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (newWindow) newWindow.opener = null;
};

const PaperCard = ({ paper }) => {
  const mainPublication =
    paper.publications?.find(pub => pub.name !== 'arXiv') ||
    paper.publications?.[0];

  const handleCopyBibtex = () => {
    const bibtexEntries = paper.publications
      ?.filter(pub => pub.bibtex)
      .map(pub => pub.bibtex.trim())
      .join('\n\n');

    if (bibtexEntries) {
      navigator.clipboard?.writeText(bibtexEntries);
      // You could add a toast notification here
    }
  };

  const hasBibtex = paper.publications?.some(pub => pub.bibtex);

  return (
    <StyledCard>
      <CardContent sx={{ py: 0.5, px: 1, '&:last-child': { pb: 0.5 } }}>
        {/* Header with title, labels, and BibTeX action */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ mb: 0.5 }}
        >
          <Box sx={{ flex: 1 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{ flexWrap: 'wrap', gap: 0.5 }}
            >
              <PaperTitle
                variant="subtitle1"
                component="h3"
                sx={{ display: 'inline', mb: 0 }}
              >
                {paper.title}
              </PaperTitle>

              {/* Topic labels inline with title */}
              {paper.labels?.map(label => (
                <Chip
                  key={`label-${label}`}
                  label={label}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderRadius: 1.5,
                    fontSize: '0.75rem',
                    height: 22,
                  }}
                />
              ))}
            </Stack>
          </Box>

          {hasBibtex && (
            <Tooltip title="Copy BibTeX">
              <IconButton
                onClick={handleCopyBibtex}
                size="small"
                color="primary"
                sx={{ p: 0.5 }}
              >
                <ContentCopy sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>

        {/* Authors and publication badges on second line */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          sx={{ flexWrap: 'wrap', gap: 0.5 }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: '0.8rem', lineHeight: 1.2 }}
          >
            By{' '}
            {paper.authors
              ? typeof paper.authors === 'string'
                ? paper.authors
                : paper.authors.join(', ')
              : 'Unknown authors'}
          </Typography>

          {/* Publication badges inline with authors */}
          {paper.publications?.map((pub, index) => (
            <Tooltip
              key={`pub-${index}`}
              title={`${pub.name} ${pub.year}${pub.url ? ' - Click to view' : ''}`}
            >
              <Chip
                label={`${pub.name} '${pub.year.toString().slice(-2)}`}
                size="small"
                variant={pub.name === 'arXiv' ? 'outlined' : 'filled'}
                color={pub.name === 'arXiv' ? 'default' : 'primary'}
                onClick={() => pub.url && openInNewTab(pub.url)}
                sx={{
                  cursor: pub.url ? 'pointer' : 'default',
                  '&:hover': pub.url
                    ? {
                        transform: 'scale(1.05)',
                      }
                    : {},
                  transition: 'transform 0.2s',
                  height: 20,
                  fontSize: '0.75rem',
                }}
              />
            </Tooltip>
          ))}
        </Stack>
      </CardContent>
    </StyledCard>
  );
};

export default PaperCard;
