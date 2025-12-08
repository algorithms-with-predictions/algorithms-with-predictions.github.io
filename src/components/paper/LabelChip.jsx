import React from 'react';
import PropTypes from 'prop-types';
import { Chip } from '@mui/material';
import { getLabelColor } from '../../utils/labelUtils';
import { trackEvent } from '../../utils/analytics';

/**
 * Clickable label chip component with consistent styling
 */
const LabelChip = ({ label, isSelected, onLabelClick, paperTitle }) => {
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
      color={labelColor}
      clickable
      onClick={handleClick}
      sx={{
        borderRadius: 2,
        fontSize: '0.75rem',
        height: 22,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: 2,
        },
      }}
    />
  );
};

LabelChip.propTypes = {
  label: PropTypes.string.isRequired,
  isSelected: PropTypes.bool,
  onLabelClick: PropTypes.func,
  paperTitle: PropTypes.string,
};

LabelChip.defaultProps = {
  isSelected: false,
  onLabelClick: null,
  paperTitle: '',
};

export default LabelChip;
