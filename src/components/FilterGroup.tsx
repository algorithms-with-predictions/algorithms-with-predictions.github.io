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
          letterSpacing: '0.5px',
        }}
      >
        {title}
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
  );
};

export default FilterGroup;
