import {
  Box,
  Stack,
  Typography,
  Container,
  Fade,
  IconButton,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import { Download, Clear } from '@mui/icons-material';
import * as React from 'react';
import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';

// Import our new components
import SearchAndFilter from './SearchAndFilter.jsx';
import PaperCard from './PaperCard.jsx';
import StatsDashboard from './StatsDashboard.jsx';

function stringCmp(a, b) {
  return a.toLowerCase().localeCompare(b.toLowerCase());
}

const TYPE_LABELS = [
  'dynamic / data structure',
  'online',
  'running time',
  'approximation',
  'streaming',
  'game theory / mechanism design',
  'differential privacy',
  'survey',
];
const PRIOR_LABEL = 'prior / related work';
let SPECIAL_LABELS = [...TYPE_LABELS, PRIOR_LABEL];

const PaperList = ({ data }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  // Get all years from publications
  const allYears = data.flatMap(paper =>
    paper.publications.flatMap(pub => pub.year)
  );
  const distinctYears = [...new Set(allYears)];
  distinctYears.sort();

  // Get all labels from papers
  const allLabels = data.flatMap(paper => (paper.labels ? paper.labels : []));
  let distinctLabels = [...new Set(allLabels)];
  distinctLabels.sort(stringCmp);
  distinctLabels = distinctLabels.filter(el => !SPECIAL_LABELS.includes(el));

  // Component state
  const [searchQuery, setSearchQuery] = useState('');
  const [selLabels, setSelLabels] = React.useState([]);

  // Filter and sort papers
  const sortedData = useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        paper =>
          paper.title?.toLowerCase().includes(query) ||
          (typeof paper.authors === 'string'
            ? paper.authors.toLowerCase().includes(query)
            : paper.authors?.some(author =>
                author.toLowerCase().includes(query)
              )) ||
          paper.labels?.some(label => label.toLowerCase().includes(query)) ||
          paper.publications?.some(
            pub =>
              pub.name?.toLowerCase().includes(query) ||
              pub.year?.toString().includes(query)
          )
      );
    }

    // Apply label filter
    if (selLabels.length > 0) {
      filtered = filtered.filter(paper =>
        selLabels.every(selectedLabel => paper.labels?.includes(selectedLabel))
      );
    }

    // Sort by year (newest first)
    return filtered.sort((a, b) => {
      const getLatestYear = paper => {
        if (!paper.publications || paper.publications.length === 0) return 0;
        return Math.max(...paper.publications.map(pub => pub.year || 0));
      };
      return getLatestYear(b) - getLatestYear(a);
    });
  }, [data, searchQuery, selLabels]);

  // Count papers with BibTeX
  const papersWithBibtex = useMemo(() => {
    return sortedData.filter(paper =>
      paper.publications?.some(pub => pub.bibtex)
    ).length;
  }, [sortedData]);

  // Generate BibTeX for filtered papers
  const handleExportBibtex = () => {
    if (typeof window === 'undefined') return;

    const bibtexEntries = sortedData
      .filter(paper => paper.publications?.some(pub => pub.bibtex))
      .map(paper => {
        const pubsWithBibtex = paper.publications.filter(pub => pub.bibtex);
        return pubsWithBibtex.map(pub => pub.bibtex).join('\n\n');
      })
      .join('\n\n');

    if (bibtexEntries) {
      const blob = new Blob([bibtexEntries], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `alps-papers-${new Date().toISOString().split('T')[0]}.bib`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelLabels([]);
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 1, md: 1.5 } }}>
      <Stack spacing={{ xs: 1, md: 1.5 }}>
        {/* Stats Dashboard */}
        <Fade in timeout={600}>
          <Box>
            <StatsDashboard data={data} />
          </Box>
        </Fade>

        {/* Search and Filters */}
        <Fade in timeout={800}>
          <Box>
            <SearchAndFilter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedLabels={selLabels}
              onLabelsChange={setSelLabels}
              availableLabels={distinctLabels}
              specialLabels={SPECIAL_LABELS}
            />
          </Box>
        </Fade>

        {/* Compact Results Summary */}
        <Fade in timeout={1000}>
          <Box>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={1}
              sx={{
                py: 1,
                px: 2,
                bgcolor: 'action.hover',
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Showing{' '}
                <strong>
                  {sortedData.length} of {data.length}
                </strong>{' '}
                papers
                {(searchQuery || selLabels.length > 0) && (
                  <>
                    {' '}
                    matching{' '}
                    {searchQuery && (
                      <>
                        &quot;{searchQuery}&quot;
                        {selLabels.length > 0 && ' and '}
                      </>
                    )}
                    {selLabels.length > 0 && (
                      <>
                        {selLabels.length === 1 ? 'label' : 'labels'}{' '}
                        {selLabels.join(', ')}
                      </>
                    )}
                  </>
                )}
              </Typography>

              <Stack direction="row" spacing={0.5}>
                {/* Clear filters button */}
                {(searchQuery || selLabels.length > 0) && (
                  <Tooltip title="Clear all filters">
                    <IconButton
                      size="small"
                      onClick={handleClearFilters}
                      sx={{
                        color: 'secondary.main',
                        '&:hover': {
                          bgcolor: 'secondary.light',
                          color: 'secondary.contrastText',
                        },
                      }}
                    >
                      <Clear fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}

                {/* Export BibTeX button */}
                {papersWithBibtex > 0 && isDesktop && (
                  <Tooltip
                    title={`Export BibTeX for ${papersWithBibtex} papers with bibliography`}
                  >
                    <IconButton
                      size="small"
                      onClick={handleExportBibtex}
                      sx={{
                        color: 'primary.main',
                        '&:hover': {
                          bgcolor: 'primary.light',
                          color: 'primary.contrastText',
                        },
                      }}
                    >
                      <Download fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Stack>
          </Box>
        </Fade>

        {/* Papers List */}
        <Fade in timeout={1200}>
          <Box>
            {sortedData.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 400,
                  textAlign: 'center',
                  color: 'text.secondary',
                }}
              >
                <Stack spacing={2} alignItems="center">
                  <Typography variant="h6" color="text.secondary">
                    {searchQuery || selLabels.length > 0
                      ? 'No papers match your search criteria.'
                      : 'No papers available.'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your search terms or filters.
                  </Typography>
                </Stack>
              </Box>
            ) : (
              <Stack spacing={1}>
                {sortedData.map((paper, index) => (
                  <Box key={`${paper.id}-${index}`}>
                    <PaperCard
                      paper={paper}
                      selectedLabels={selLabels}
                      onLabelClick={label =>
                        setSelLabels([label, ...selLabels])
                      }
                    />
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </Fade>
      </Stack>
    </Container>
  );
};

PaperList.propTypes = {
  data: PropTypes.array,
};

export default PaperList;
