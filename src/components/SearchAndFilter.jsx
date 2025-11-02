import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Chip,
  Stack,
  Collapse,
  Typography,
  Tooltip,
} from '@mui/material';
import { Search, Clear, FilterList } from '@mui/icons-material';
import { trackSearch, trackFilter } from '../utils/analytics.js';

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
                  {specialLabels.length > 0 && (
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          mb: 0.75,
                          color: 'text.secondary',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          fontSize: '0.65rem',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Paper Types
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        flexWrap="wrap"
                        sx={{ gap: 0.5 }}
                      >
                        {specialLabels.map(label => {
                          const isSelected = selectedLabels.includes(label);
                          const labelColor =
                            label === 'prior / related work'
                              ? 'default'
                              : 'typeLabels';
                          return (
                            <Chip
                              key={label}
                              label={label}
                              size="small"
                              clickable
                              color={labelColor}
                              variant={isSelected ? 'filled' : 'outlined'}
                              onClick={() => {
                                if (isSelected) {
                                  onLabelsChange(
                                    selectedLabels.filter(l => l !== label)
                                  );
                                  trackFilter(
                                    'special_label',
                                    `remove_${label}`
                                  );
                                } else {
                                  onLabelsChange([...selectedLabels, label]);
                                  trackFilter('special_label', `add_${label}`);
                                }
                              }}
                              sx={{
                                height: 28,
                                fontSize: '0.75rem',
                                borderRadius: 2,
                                '& .MuiChip-label': { px: 1.5 },
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  transform: 'translateY(-1px)',
                                  boxShadow: 2,
                                },
                              }}
                            />
                          );
                        })}
                      </Stack>
                    </Box>
                  )}

                  {/* Regular Labels Section */}
                  {availableLabels.length > 0 && (
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          mb: 0.75,
                          color: 'text.secondary',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          fontSize: '0.65rem',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Topics & Keywords
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        flexWrap="wrap"
                        sx={{ gap: 0.5 }}
                      >
                        {availableLabels.map(label => {
                          const isSelected = selectedLabels.includes(label);
                          return (
                            <Chip
                              key={label}
                              label={label}
                              size="small"
                              clickable
                              color="labels"
                              variant={isSelected ? 'filled' : 'outlined'}
                              onClick={() => {
                                if (isSelected) {
                                  onLabelsChange(
                                    selectedLabels.filter(l => l !== label)
                                  );
                                  trackFilter(
                                    'regular_label',
                                    `remove_${label}`
                                  );
                                } else {
                                  onLabelsChange([...selectedLabels, label]);
                                  trackFilter('regular_label', `add_${label}`);
                                }
                              }}
                              sx={{
                                height: 28,
                                fontSize: '0.75rem',
                                borderRadius: 2,
                                '& .MuiChip-label': { px: 1.5 },
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  transform: 'translateY(-1px)',
                                  boxShadow: 2,
                                },
                              }}
                            />
                          );
                        })}
                      </Stack>
                    </Box>
                  )}
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
