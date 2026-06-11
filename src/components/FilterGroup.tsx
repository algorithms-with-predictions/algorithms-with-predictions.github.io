import { Box, Typography, Stack, Chip } from '@mui/material';
import { trackFilter } from '../utils/analytics.js';

type ColorType =
  | 'labels'
  | 'typeLabels'
  | 'primary'
  | 'secondary'
  | ((label: string) => string);

interface FilterGroupProps {
  title: string;
  labels: string[];
  selectedLabels: string[];
  onLabelsChange: (labels: string[]) => void;
  colorType?: ColorType;
  trackCategory?: string;
}

const FilterGroup: React.FC<FilterGroupProps> = ({
  title,
  labels,
  selectedLabels,
  onLabelsChange,
  colorType = 'labels',
  trackCategory = 'regular_label',
}) => {
  if (!labels || labels.length === 0) return null;

  // Count selected labels in this group
  const selectedCount = labels.filter(label =>
    selectedLabels.includes(label)
  ).length;

  return (
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
          letterSpacing: 0,
        }}
      >
        {title}
        {selectedCount > 0 && (
          <Box
            component="span"
            sx={{
              ml: 0.5,
              color: 'primary.main',
              fontWeight: 700,
            }}
          >
            ({selectedCount} selected)
          </Box>
        )}
      </Typography>
      <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
        {labels.map((label: string) => {
          const isSelected = selectedLabels.includes(label);

          let labelColor: string =
            typeof colorType === 'string' ? colorType : 'labels';
          if (typeof colorType === 'function') {
            labelColor = colorType(label);
          }

          return (
            <Chip
              key={label}
              label={label}
              size="small"
              clickable
              color={labelColor as 'primary' | 'secondary' | 'default'}
              variant={isSelected ? 'filled' : 'outlined'}
              onClick={() => {
                if (isSelected) {
                  onLabelsChange(
                    selectedLabels.filter((l: string) => l !== label)
                  );
                  trackFilter(trackCategory, `remove_${label}`);
                } else {
                  onLabelsChange([...selectedLabels, label]);
                  trackFilter(trackCategory, `add_${label}`);
                }
              }}
              sx={theme => {
                const palette =
                  labelColor === 'typeLabels'
                    ? theme.palette.typeLabels
                    : labelColor === 'labels'
                      ? theme.palette.labels
                      : null;

                const baseColors = palette
                  ? {
                      bgcolor: isSelected ? palette.main : palette.light,
                      color: isSelected ? palette.contrastText : palette.dark,
                      borderColor: isSelected ? palette.main : palette.light,
                    }
                  : {
                      bgcolor: isSelected ? 'text.secondary' : 'action.hover',
                      color: isSelected ? 'background.paper' : 'text.secondary',
                      borderColor: 'divider',
                    };

                return {
                  ...baseColors,
                  height: 28,
                  fontSize: '0.75rem',
                  borderRadius: 1,
                  '& .MuiChip-label': { px: 1.5 },
                  transition:
                    'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
                  '&:hover': {
                    borderColor:
                      labelColor === 'typeLabels'
                        ? 'typeLabels.main'
                        : labelColor === 'labels'
                          ? 'labels.main'
                          : 'text.secondary',
                  },
                  '&:active': {
                    opacity: 0.85,
                  },
                };
              }}
            />
          );
        })}
      </Stack>
    </Box>
  );
};

export default FilterGroup;
