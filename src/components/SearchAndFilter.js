import React, { useState } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Chip,
  Stack,
  Autocomplete,
  Collapse,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
} from '@mui/material';
import {
  Search,
  Clear,
  FilterList,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';

const SearchAndFilter = ({
  searchQuery,
  onSearchChange,
  selectedAuthors = [],
  onAuthorsChange,
  selectedVenues = [],
  onVenuesChange,
  allAuthors = [],
  allVenues = [],
  showAdvanced = false,
  onAdvancedToggle,
  // Legacy props integration
  yearRange = [2020, 2025],
  onYearRangeChange = () => {},
  availableYears = [],
  sortOrder = 'Sort by year (newest first)',
  onSortOrderChange = () => {},
  selectedLabels = [],
  onLabelsChange = () => {},
  availableLabels = [],
  specialLabels = [],
}) => {
  const sortOptions = [
    'Sort by year (newest first)',
    'Sort by year (oldest first)',
  ];

  const yearMarks =
    availableYears.length > 0
      ? availableYears.map((year, index) => ({
          value: index,
          label: `'${year.toString().slice(-2)}`,
        }))
      : [];

  return (
    <Box sx={{ mb: 3 }}>
      <Stack spacing={2}>
        {/* Main Search Bar */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search papers by title, authors, or keywords..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {searchQuery && (
                  <IconButton
                    edge="end"
                    onClick={() => onSearchChange('')}
                    size="small"
                  >
                    <Clear />
                  </IconButton>
                )}
                <IconButton
                  edge="end"
                  onClick={() => onAdvancedToggle && onAdvancedToggle()}
                  size="small"
                  color={showAdvanced ? 'primary' : 'default'}
                >
                  <FilterList />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: 'background.paper',
              '&:hover': {
                boxShadow: theme => theme.shadows[2],
              },
              '&.Mui-focused': {
                boxShadow: theme => theme.shadows[4],
              },
            },
          }}
        />

        {/* Advanced Filters */}
        <Collapse in={showAdvanced}>
          <Stack
            spacing={3}
            sx={{
              p: 3,
              bgcolor: 'background.paper',
              borderRadius: 3,
              boxShadow: 2,
              border: theme => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
              Advanced Filters
            </Typography>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              {/* Author Filter */}
              <Box sx={{ flex: 1 }}>
                <Autocomplete
                  multiple
                  options={allAuthors}
                  value={selectedAuthors}
                  onChange={(_, newValue) => onAuthorsChange(newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        size="small"
                        color="secondary"
                        {...getTagProps({ index })}
                        key={option}
                      />
                    ))
                  }
                  renderInput={params => (
                    <TextField
                      {...params}
                      label="Filter by Authors"
                      placeholder="Select authors..."
                      size="small"
                    />
                  )}
                  sx={{ borderRadius: 2 }}
                />
              </Box>

              {/* Venue Filter */}
              <Box sx={{ flex: 1 }}>
                <Autocomplete
                  multiple
                  options={allVenues}
                  value={selectedVenues}
                  onChange={(_, newValue) => onVenuesChange(newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        size="small"
                        color="info"
                        {...getTagProps({ index })}
                        key={option}
                      />
                    ))
                  }
                  renderInput={params => (
                    <TextField
                      {...params}
                      label="Filter by Venues"
                      placeholder="Select venues..."
                      size="small"
                    />
                  )}
                  sx={{ borderRadius: 2 }}
                />
              </Box>
            </Stack>

            {/* Sort and Year Controls */}
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              alignItems="center"
            >
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Sort Order</InputLabel>
                <Select
                  value={sortOrder}
                  label="Sort Order"
                  onChange={e => onSortOrderChange(e.target.value)}
                >
                  {sortOptions.map(option => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {availableYears.length > 0 && (
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography
                    gutterBottom
                    variant="body2"
                    color="text.secondary"
                  >
                    Publication Years: {yearRange[0]} - {yearRange[1]}
                  </Typography>
                  <Slider
                    value={[
                      availableYears.indexOf(yearRange[0]),
                      availableYears.indexOf(yearRange[1]),
                    ]}
                    onChange={(_, newValue) => {
                      onYearRangeChange([
                        availableYears[newValue[0]],
                        availableYears[newValue[1]],
                      ]);
                    }}
                    valueLabelDisplay="auto"
                    valueLabelFormat={value => availableYears[value]}
                    marks={yearMarks}
                    min={0}
                    max={availableYears.length - 1}
                    size="small"
                  />
                </Box>
              )}
            </Stack>

            {/* Topic Labels */}
            {(availableLabels.length > 0 || specialLabels.length > 0) && (
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Research Topics:
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  sx={{ gap: 1 }}
                >
                  {[...specialLabels, ...availableLabels].map(label => (
                    <Chip
                      key={label}
                      label={label}
                      size="small"
                      clickable
                      color={
                        selectedLabels.includes(label) ? 'success' : 'default'
                      }
                      variant={
                        selectedLabels.includes(label) ? 'filled' : 'outlined'
                      }
                      onClick={() => {
                        if (selectedLabels.includes(label)) {
                          onLabelsChange(
                            selectedLabels.filter(l => l !== label)
                          );
                        } else {
                          onLabelsChange([...selectedLabels, label]);
                        }
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Collapse>
      </Stack>
    </Box>
  );
};

export default SearchAndFilter;
