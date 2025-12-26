import {
  Box,
  Stack,
  Typography,
  Container,
  Fade,
  IconButton,
  Tooltip,
  useMediaQuery,
  Button,
} from '@mui/material';
import { Download, Clear } from '@mui/icons-material';
import * as React from 'react';
import { useMemo, useCallback } from 'react';
import { useTheme } from '@mui/material/styles';
import type { Paper } from '@/types';

// Import our new components
import SearchAndFilter from './SearchAndFilter';
import { PaperCard } from './paper';
import StatsDashboard from './StatsDashboard';
import EmptyState from './EmptyState';
import { usePaperFilter } from '../hooks/usePaperFilter';
import { exportBibtex } from '../utils/exportUtils';

interface PaperListProps {
  data: Paper[];
}

const PaperList: React.FC<PaperListProps> = ({ data }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  const {
    searchQuery,
    setSearchQuery,
    selLabels,
    setSelLabels,
    sortedData,
    distinctLabels,
    handleClearFilters,
    SPECIAL_LABELS,
  } = usePaperFilter(data);

  // Count papers with BibTeX
  const papersWithBibtex = useMemo(() => {
    return sortedData.filter(paper =>
      paper.publications?.some(pub => pub.bibtex)
    ).length;
  }, [sortedData]);

  // Stable callback for label clicks to enable PaperCard memoization
  const handleLabelClick = useCallback(
    (label: string): void => {
      setSelLabels((prev: string[]) => {
        // Avoid duplicates
        if (prev.includes(label)) return prev;
        return [label, ...prev];
      });
    },
    [setSelLabels]
  );

  return (
    <Container
      maxWidth="xl"
      disableGutters
      sx={{ py: { xs: 1, md: 1.5 }, px: { xs: 0, sm: 2, md: 3 } }}
    >
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
                  {sortedData.length} of {data?.length ?? 0}
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
                  <>
                    {isDesktop ? (
                      <Button
                        size="medium"
                        startIcon={<Clear />}
                        onClick={handleClearFilters}
                        sx={{
                          color: 'secondary.main',
                          fontWeight: 500,
                          '&:hover': {
                            bgcolor: 'secondary.light',
                            color: 'secondary.contrastText',
                          },
                        }}
                      >
                        Clear Filters
                      </Button>
                    ) : (
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
                  </>
                )}

                {/* Export BibTeX button */}
                {papersWithBibtex > 0 && isDesktop && (
                  <Tooltip
                    title={`Export BibTeX for ${papersWithBibtex} papers with bibliography`}
                  >
                    <IconButton
                      size="small"
                      onClick={() => exportBibtex(sortedData)}
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
              <EmptyState
                variant="no-results"
                title="No papers found"
                message={
                  searchQuery
                    ? `No papers match "${searchQuery}". Try different keywords or clear filters.`
                    : selLabels.length > 0
                      ? `No papers match the selected filters. Try selecting different labels.`
                      : 'No papers available in the database.'
                }
                action={
                  searchQuery || selLabels.length > 0
                    ? {
                        label: 'Clear Filters',
                        onClick: handleClearFilters,
                      }
                    : undefined
                }
              />
            ) : (
              <Stack spacing={1}>
                {sortedData.map((paper, index) => (
                  <Box key={`${paper.title || 'untitled'}-${index}`}>
                    <PaperCard
                      paper={paper}
                      selectedLabels={selLabels}
                      onLabelClick={handleLabelClick}
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

export default PaperList;
