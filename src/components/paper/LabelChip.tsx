import { Chip, type ChipPropsColorOverrides } from '@mui/material';
import { getLabelColor } from '../../utils/labelUtils';
import { trackEvent } from '../../utils/analytics';
import type { OverridableStringUnion } from '@mui/types';

interface LabelChipProps {
  label: string;
  isSelected?: boolean;
  onLabelClick?: ((label: string) => void) | null;
  paperTitle?: string | undefined;
}

type ExtendedChipColor = OverridableStringUnion<
  | 'default'
  | 'primary'
  | 'secondary'
  | 'error'
  | 'info'
  | 'success'
  | 'warning',
  ChipPropsColorOverrides
>;

/**
 * Clickable label chip component with consistent styling
 */
const LabelChip: React.FC<LabelChipProps> = ({
  label,
  isSelected = false,
  onLabelClick = null,
  paperTitle = '',
}) => {
  const labelColor = getLabelColor(label);

  const handleClick = () => {
    if (onLabelClick) {
      trackEvent('paper_label_click', {
        category: 'paper_interaction',
        label: label,
        custom_parameter_1: paperTitle || 'Unknown paper',
      });
      onLabelClick(label);
    }
  };

  return (
    <Chip
      label={label}
      size="small"
      variant={isSelected ? 'filled' : 'outlined'}
      color={labelColor as ExtendedChipColor}
      clickable
      onClick={handleClick}
      role="button"
      aria-label={`${isSelected ? 'Remove' : 'Add'} filter for ${label}`}
      aria-pressed={isSelected}
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
          borderRadius: 1,
          fontSize: '0.75rem',
          height: 22,
          px: 0.25,
          borderWidth: 1,
          cursor: 'pointer',
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
          ...(isSelected && {
            fontWeight: 700,
          }),
        };
      }}
    />
  );
};

export default LabelChip;
