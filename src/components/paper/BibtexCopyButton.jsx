import React from 'react';
import PropTypes from 'prop-types';
import { IconButton, Tooltip } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import { trackEvent } from '../../utils/analytics';
import { getBibtexEntries, getMainPublication } from '../../utils/paperUtils';

/**
 * BibTeX copy button with analytics tracking
 */
const BibtexCopyButton = ({
  publications = [],
  paperTitle = '',
  size = 'small',
}) => {
  const handleCopyBibtex = () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return;
    }

    const bibtexEntries = getBibtexEntries(publications);

    if (bibtexEntries) {
      navigator.clipboard?.writeText(bibtexEntries);
      const mainPublication = getMainPublication(publications);
      trackEvent('bibtex_copy', {
        category: 'paper_interaction',
        label: paperTitle || 'Unknown paper',
        custom_parameter_1: mainPublication?.name || 'unknown_venue',
      });
    }
  };

  return (
    <Tooltip title="Copy BibTeX">
      <IconButton
        onClick={handleCopyBibtex}
        size={size}
        color="primary"
        sx={{ p: 0.5 }}
      >
        <ContentCopy sx={{ fontSize: size === 'small' ? 18 : 24 }} />
      </IconButton>
    </Tooltip>
  );
};

BibtexCopyButton.propTypes = {
  publications: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      year: PropTypes.number,
      url: PropTypes.string,
      bibtex: PropTypes.string,
    })
  ),
  paperTitle: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
};

export default BibtexCopyButton;
