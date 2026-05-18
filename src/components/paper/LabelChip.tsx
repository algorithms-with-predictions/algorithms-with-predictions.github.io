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
      sx={{
        borderRadius: 2,
        fontSize: '0.75rem',
        height: 22,
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: 2,
        },
        '&:active': {
          transform: 'scale(0.98)',
        },
        ...(isSelected && {
          fontWeight: 600,
          boxShadow: 1,
        }),
      }}
    />
  );
};

export default LabelChip;
