import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Stack,
  Collapse,
  Tooltip,
} from '@mui/material';
import { Search, Clear, FilterList } from '@mui/icons-material';
import { trackSearch } from '../utils/analytics.js';
import FilterGroup from './FilterGroup.jsx';

const SearchAndFilter = ({
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
        trackSearch(localSearchQuery);
      }
      onSearchChange(localSearchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localSearchQuery, onSearchChange]);

  // Handle input change
  const handleInputChange = e => {
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
                    labels={specialLabels}
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
              </Box>
            </Collapse>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

SearchAndFilter.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  selectedLabels: PropTypes.arrayOf(PropTypes.string),
  onLabelsChange: PropTypes.func,
  availableLabels: PropTypes.arrayOf(PropTypes.string),
  specialLabels: PropTypes.arrayOf(PropTypes.string),
};

export default SearchAndFilter;
