import { useState, useEffect, ChangeEvent } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Stack,
  Collapse,
  Tooltip,
  Alert,
} from '@mui/material';
import { Search, Clear, FilterList } from '@mui/icons-material';
import { trackSearch } from '../utils/analytics.js';
import FilterGroup from './FilterGroup';

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedLabels?: string[];
  onLabelsChange?: (labels: string[]) => void;
  availableLabels?: string[];
  specialLabels?: readonly string[];
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchQuery,
  onSearchChange,
  selectedLabels = [],
  onLabelsChange = () => {},
  availableLabels = [],
  specialLabels = [],
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [isKeywordSelectOpen, setIsKeywordSelectOpen] = useState(false);

  // Update local state when external searchQuery changes
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Handle input change with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localSearchQuery) {
        // Track search without results count (will be tracked elsewhere)
        trackSearch(localSearchQuery, 0);
      }
      onSearchChange(localSearchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearchQuery]);

  // Handle input change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
  };

  // Handle clear with immediate update
  const handleClear = () => {
    setLocalSearchQuery('');
    onSearchChange('');
  };
  return (
    <Box>
      <Stack spacing={1.5}>
        {/* Compact Search Bar */}
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          placeholder="Search papers by title, authors, or keywords..."
          value={localSearchQuery}
          onChange={handleInputChange}
          inputProps={{
            'aria-label': 'Search papers by title, authors, or keywords',
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" sx={{ fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Stack direction="row" spacing={0.5} alignItems="center">
                  {/* Quick Keyword Select Toggle - Now visible on all devices */}
                  {(availableLabels.length > 0 || specialLabels.length > 0) && (
                    <Tooltip
                      title={
                        isKeywordSelectOpen
                          ? 'Hide keyword filters'
                          : 'Show keyword filters'
                      }
                    >
                      <IconButton
                        edge="end"
                        onClick={() =>
                          setIsKeywordSelectOpen(!isKeywordSelectOpen)
                        }
                        size="small"
                        sx={{
                          color: isKeywordSelectOpen
                            ? 'primary.main'
                            : 'action.active',
                          transform: isKeywordSelectOpen
                            ? 'rotate(180deg)'
                            : 'rotate(0)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            color: 'primary.main',
                            bgcolor: 'action.hover',
                          },
                        }}
                      >
                        <FilterList sx={{ fontSize: 20 }} />
                      </IconButton>
                    </Tooltip>
                  )}

                  {localSearchQuery && (
                    <IconButton edge="end" onClick={handleClear} size="small">
                      <Clear sx={{ fontSize: 18 }} />
                    </IconButton>
                  )}
                </Stack>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'background.paper',
              '&:hover': {
                boxShadow: theme => theme.shadows[1],
              },
              '&.Mui-focused': {
                boxShadow: theme => theme.shadows[2],
              },
            },
          }}
        />

        {/* Topic Filter Labels - Now visible on all devices when toggled */}
        {(availableLabels.length > 0 || specialLabels.length > 0) && (
          <Box>
            <Collapse in={isKeywordSelectOpen}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  border: theme => `1px solid ${theme.palette.divider}`,
                  boxShadow: 1,
                }}
              >
                <Stack spacing={1.5}>
                  {/* Special Labels Section */}
                  <FilterGroup
                    title="Paper Types"
                    labels={[...specialLabels]}
                    selectedLabels={selectedLabels}
                    onLabelsChange={onLabelsChange}
                    colorType={label =>
                      label === 'prior / related work'
                        ? 'default'
                        : 'typeLabels'
                    }
                    trackCategory="special_label"
                  />

                  {/* Regular Labels Section */}
                  <FilterGroup
                    title="Topics & Keywords"
                    labels={availableLabels}
                    selectedLabels={selectedLabels}
                    onLabelsChange={onLabelsChange}
                    colorType="labels"
                    trackCategory="regular_label"
                  />
                </Stack>

                {/* Filter Logic Indicator */}
                {selectedLabels.length > 1 && (
                  <Alert
                    severity="info"
                    sx={{
                      mt: 1.5,
                      py: 0.5,
                      fontSize: '0.75rem',
                      '& .MuiAlert-message': {
                        fontSize: '0.75rem',
                      },
                    }}
                  >
                    Showing papers with ALL selected filters (AND logic)
                  </Alert>
                )}
              </Box>
            </Collapse>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default SearchAndFilter;
