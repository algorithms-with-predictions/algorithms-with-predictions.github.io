import {
  Box,
  Divider,
  Select,
  Slider,
  Stack,
  Typography,
  Chip,
  ListItem,
  ListItemText,
  List,
  MenuItem,
  Button,
  Container,
  Fade,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Download } from '@mui/icons-material';
import * as React from 'react';
import { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';

// Import our new components
import SearchAndFilter from './SearchAndFilter';
import PaperCard from './PaperCard';
import StatsDashboard from './StatsDashboard';

const openInNewTab = url => {
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (newWindow) newWindow.opener = null;
};

const AuthorText = styled('div')(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

const PriorTitleText = styled('div')(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontWeight: 'bold',
}));

const TitleText = styled('div')(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.palette.text.primary,
}));

function minDateOfPaper(paper) {
  const fullDates = paper.publications
    .filter(pub => pub.month !== undefined)
    .map(pub => new Date(pub.year, pub.month, pub.day));

  if (fullDates.length > 0) {
    return new Date(Math.min(...fullDates));
  } else {
    const dates = paper.publications.map(
      pub =>
        new Date(
          pub.year,
          pub.month === undefined ? 0 : pub.month,
          pub.day === undefined ? 0 : pub.day
        )
    );
    return new Date(Math.min(...dates));
  }
}

function stringCmp(a, b) {
  var nameA = a.toUpperCase();
  var nameB = b.toUpperCase();
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0;
}

const SORT_YEAR_TOP_DOWN = 'Newest first';
const SORT_YEAR_BOTTOM_UP = 'Oldest first';
const sortOptions = [SORT_YEAR_BOTTOM_UP, SORT_YEAR_TOP_DOWN];

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
  // preprocessing
  const allYears = data.flatMap(paper =>
    paper.publications.flatMap(pub => pub.year)
  );
  let distinctYears = [...new Set(allYears)];
  distinctYears.sort();
  const allLabels = data.flatMap(paper => (paper.labels ? paper.labels : []));
  let distinctLabels = [...new Set(allLabels)];
  distinctLabels.sort(stringCmp);
  distinctLabels = distinctLabels.filter(el => !SPECIAL_LABELS.includes(el));

  // component state definition - enhanced with new state
  const [yearsIdx, setYearsIdx] = React.useState([0, distinctYears.length - 1]);
  const [sort, setSort] = React.useState(SORT_YEAR_TOP_DOWN);
  const [selLabels, setSelLabels] = React.useState([]);

  // New state for modern UI
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [selectedVenues, setSelectedVenues] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // BibTeX export function
  const handleExportBibtex = () => {
    const bibtexEntries = sortedData
      .flatMap(
        paper =>
          paper.publications
            ?.filter(pub => pub.bibtex)
            .map(pub => pub.bibtex.trim()) || []
      )
      .filter(Boolean);

    if (bibtexEntries.length === 0) {
      alert('No BibTeX entries found in the current selection.');
      return;
    }

    const bibtexContent = bibtexEntries.join('\n\n');
    const blob = new Blob([bibtexContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `alps-papers-${new Date().toISOString().split('T')[0]}.bib`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Extract unique authors and venues for autocomplete
  const allAuthors = useMemo(() => {
    const authors = new Set();
    data.forEach(paper => {
      if (paper.authors) {
        // Handle both string and array formats
        const authorList =
          typeof paper.authors === 'string'
            ? paper.authors.split(', ').map(a => a.trim())
            : paper.authors;
        authorList.forEach(author => authors.add(author));
      }
    });
    return Array.from(authors).sort();
  }, [data]);

  const allVenues = useMemo(() => {
    const venues = new Set();
    data.forEach(paper => {
      paper.publications?.forEach(pub => {
        if (pub.name && pub.name !== 'arXiv') {
          venues.add(pub.name);
        }
      });
    });
    return Array.from(venues).sort();
  }, [data]);

  // helper functions
  const labelColor = label => {
    if (TYPE_LABELS.includes(label)) {
      return 'typeLabels';
    } else if (label === PRIOR_LABEL) {
      return 'default';
    } else {
      return 'labels';
    }
  };

  const labelChip = (label, deleteable) => (
    <Chip
      size="small"
      key={label}
      label={label}
      variant={
        (deleteable && selLabels.includes(label)) || label === PRIOR_LABEL
          ? 'outlined'
          : 'filled'
      }
      color={labelColor(label)}
      onClick={() => setSelLabels([label, ...selLabels])}
      onDelete={
        deleteable && selLabels.includes(label)
          ? () => {
              setSelLabels(selLabels.filter(l => l !== label));
            }
          : undefined
      }
      sx={{ borderRadius: 2 }}
    />
  );

  const paperChips = paper => {
    const labels = 'labels' in paper ? paper.labels : [];
    labels.sort(stringCmp);
    let pubs = paper.publications;
    pubs.sort((a, b) => stringCmp(a.name, b.name));
    let chips = paper.publications.map(pub => {
      let name = 'displayName' in pub ? pub.displayName : pub.name;
      let text = name + " '" + pub.year.toString().slice(-2);
      return (
        <Chip
          size="small"
          label={text}
          key={text}
          variant={'arXiv' === name ? 'outlined' : 'filled'}
          color="pubLabels"
          onClick={() => ('url' in pub ? openInNewTab(pub.url) : {})}
          sx={{ borderRadius: 2 }}
        />
      );
    });

    chips = chips.concat(labels.map(label => labelChip(label, false)));

    return chips;
  };

  const buildListItems = data => {
    return data.map((paper, i) => (
      <ListItem
        key={i}
        sx={{
          mb: 1,
          bgcolor: 'background.paper',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            bgcolor: 'action.hover',
            transform: 'translateY(-2px)',
            boxShadow: 2,
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <ListItemText
          primary={
            <Stack direction="row" spacing={3}>
              {paper.labels.includes(PRIOR_LABEL) ? (
                <PriorTitleText>{paper.title}</PriorTitleText>
              ) : (
                <TitleText>{paper.title}</TitleText>
              )}
              <AuthorText>{paper.authors}</AuthorText>
              <Stack direction="row" spacing={1}>
                {paperChips(paper)}
              </Stack>
            </Stack>
          }
        />
      </ListItem>
    ));
  };

  const selTypeLabels = selLabels.filter(l => TYPE_LABELS.includes(l));
  const selNonTypeLabels = selLabels.filter(l => !TYPE_LABELS.includes(l));

  // Enhanced data filtering with search functionality
  const filteredData = useMemo(() => {
    return data
      .filter(p =>
        p.publications.some(
          pub =>
            distinctYears[yearsIdx[0]] <= pub.year &&
            pub.year <= distinctYears[yearsIdx[1]]
        )
      )
      .filter(
        p =>
          (selTypeLabels.length === 0 ||
            selTypeLabels.every(l => p.labels?.includes(l))) &&
          (selNonTypeLabels.length === 0 ||
            p.labels?.some(l => selNonTypeLabels.includes(l)))
      )
      .filter(p => {
        // Text search
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const titleMatch = p.title?.toLowerCase().includes(query);
          const authorMatch =
            p.authors &&
            (typeof p.authors === 'string'
              ? p.authors.toLowerCase().includes(query)
              : p.authors.some(author => author.toLowerCase().includes(query)));
          const abstractMatch = p.abstract?.toLowerCase().includes(query);
          if (!titleMatch && !authorMatch && !abstractMatch) return false;
        }

        // Author filter
        if (selectedAuthors.length > 0) {
          if (p.authors) {
            const authorList =
              typeof p.authors === 'string'
                ? p.authors.split(', ').map(a => a.trim())
                : p.authors;
            if (!selectedAuthors.some(author => authorList.includes(author))) {
              return false;
            }
          } else {
            return false;
          }
        }

        // Venue filter
        if (selectedVenues.length > 0) {
          if (
            !selectedVenues.some(venue =>
              p.publications?.some(pub => pub.name === venue)
            )
          ) {
            return false;
          }
        }

        return true;
      });
  }, [
    data,
    yearsIdx,
    selTypeLabels,
    selNonTypeLabels,
    searchQuery,
    selectedAuthors,
    selectedVenues,
    distinctYears,
  ]);

  const sortedData = useMemo(() => {
    return filteredData.sort(function (p1, p2) {
      if (sort === SORT_YEAR_TOP_DOWN) {
        return minDateOfPaper(p2) - minDateOfPaper(p1);
      } else {
        return minDateOfPaper(p1) - minDateOfPaper(p2);
      }
    });
  }, [filteredData, sort]);

  // Count papers with BibTeX entries for display
  const bibtexCount = useMemo(() => {
    return sortedData.filter(paper =>
      paper.publications?.some(pub => pub.bibtex)
    ).length;
  }, [sortedData]);

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
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
        <Box sx={{ mb: 2 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={1}
            sx={{
              mb: 1.5,
              p: 2,
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: theme => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography
              variant="subtitle1"
              color="text.primary"
              sx={{ fontWeight: 600 }}
            >
              {sortedData.length} paper{sortedData.length !== 1 ? 's' : ''}{' '}
              found
              {searchQuery && (
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  for "{searchQuery}"
                </Typography>
              )}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              {/* Export BibTeX Button */}
              {sortedData.length > 0 && (
                <Tooltip
                  title={`Export BibTeX entries (${bibtexCount} of ${sortedData.length} papers have BibTeX)`}
                >
                  <IconButton
                    onClick={handleExportBibtex}
                    size="small"
                    color="primary"
                    disabled={bibtexCount === 0}
                    sx={{
                      border: theme =>
                        `1px solid ${theme.palette.primary.main}`,
                      borderRadius: 2,
                      '&:hover': {
                        backgroundColor: 'primary.light',
                        color: 'primary.contrastText',
                      },
                      '&.Mui-disabled': {
                        border: theme =>
                          `1px solid ${theme.palette.action.disabled}`,
                        opacity: 0.5,
                      },
                    }}
                  >
                    <Download sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}

              {/* Clear All Button */}
              {(selLabels.length > 0 || searchQuery) && (
                <Button
                  variant="outlined"
                  size="small"
                  color="primary"
                  onClick={() => {
                    setSearchQuery('');
                    setSelLabels([]);
                  }}
                  sx={{ borderRadius: 2, px: 2 }}
                >
                  Clear All
                </Button>
              )}
            </Stack>
          </Stack>

          {/* Compact Active filters display */}
          {(searchQuery || selLabels.length > 0) && (
            <Stack
              direction="row"
              spacing={0.5}
              flexWrap="wrap"
              sx={{ gap: 0.5, mb: 1 }}
            >
              {searchQuery && (
                <Chip
                  label={`"${searchQuery}"`}
                  onDelete={() => setSearchQuery('')}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ height: 24, borderRadius: 2 }}
                />
              )}

              {selLabels.map(label => (
                <Chip
                  key={label}
                  label={label}
                  onDelete={() =>
                    setSelLabels(prev => prev.filter(l => l !== label))
                  }
                  size="small"
                  color="secondary"
                  variant="outlined"
                  sx={{ height: 24, borderRadius: 2 }}
                />
              ))}
            </Stack>
          )}
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
                    onLabelClick={label => setSelLabels([label, ...selLabels])}
                  />
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </Fade>
    </Container>
  );
};

PaperList.propTypes = {
  data: PropTypes.array,
};

export default PaperList;
