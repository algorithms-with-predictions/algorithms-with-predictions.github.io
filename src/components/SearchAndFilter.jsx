import React, { useState, useEffect, useCallback } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Chip,
  Stack,
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';

const SearchAndFilter = ({
  searchQuery,
  onSearchChange,
  selectedLabels = [],
  onLabelsChange = () => {},
  availableLabels = [],
  specialLabels = [],
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId;
      return query => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          onSearchChange(query);
        }, 300); // 300ms delay
      };
    })(),
    [onSearchChange]
  );

  // Update local state when external searchQuery changes
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Handle input change with debouncing
  const handleInputChange = e => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    debouncedSearch(value);
  };

  // Handle clear with immediate update
  const handleClear = () => {
    setLocalSearchQuery('');
    onSearchChange('');
  };
  return (
    <Box sx={{ mb: 2 }}>
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
                {localSearchQuery && (
                  <IconButton edge="end" onClick={handleClear} size="small">
                    <Clear sx={{ fontSize: 18 }} />
                  </IconButton>
                )}
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

        {/* Topic Filter Labels */}
        {(availableLabels.length > 0 || specialLabels.length > 0) && (
          <Box
            sx={{
              p: 1.5,
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: theme => `1px solid ${theme.palette.divider}`,
              boxShadow: 1,
            }}
          >
            <Stack
              direction="row"
              spacing={0.5}
              flexWrap="wrap"
              sx={{ gap: 0.5 }}
            >
              {/* Special Labels First */}
              {specialLabels.map(label => {
                const isSelected = selectedLabels.includes(label);
                const labelColor =
                  label === 'prior / related work' ? 'default' : 'typeLabels';
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
                        onLabelsChange(selectedLabels.filter(l => l !== label));
                      } else {
                        onLabelsChange([...selectedLabels, label]);
                      }
                    }}
                    sx={{
                      height: 26,
                      fontSize: '0.7rem',
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

              {/* Regular Labels - Show All */}
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
                        onLabelsChange(selectedLabels.filter(l => l !== label));
                      } else {
                        onLabelsChange([...selectedLabels, label]);
                      }
                    }}
                    sx={{
                      height: 26,
                      fontSize: '0.7rem',
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
  );
};

export default SearchAndFilter;
