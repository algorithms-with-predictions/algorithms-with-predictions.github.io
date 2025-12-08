import React from 'react';
import PropTypes from 'prop-types';
import { Chip, Tooltip } from '@mui/material';
import { trackEvent } from '../../utils/analytics';
import { openInNewTab } from '../../utils/paperUtils';

/**
 * Publication badge chip with tooltip and click handling
 */
const PublicationBadge = ({ publication, paperTitle }) => {
  const { name, year, url } = publication;
  const isArxiv = name === 'arXiv';

  const displayLabel = `${name}${year ? " '" + year.toString().slice(-2) : ''}`;
  const tooltipTitle = `${name}${year ? ' ' + year : ''}${url ? ' - Click to view' : ''}`;

  const handleClick = () => {
    if (url) {
      trackEvent('publication_link_click', {
        category: 'paper_interaction',
        label: paperTitle || 'Unknown paper',
        custom_parameter_1: name,
        custom_parameter_2: year?.toString(),
      });
      openInNewTab(url);
    }
  };

  return (
    <Tooltip title={tooltipTitle}>
      <Chip
        label={displayLabel}
        size="small"
        variant={isArxiv ? 'outlined' : 'filled'}
        color={isArxiv ? 'default' : 'primary'}
        onClick={handleClick}
        sx={{
          cursor: url ? 'pointer' : 'default',
          '&:hover': url
            ? {
                transform: 'scale(1.05)',
              }
            : {},
          transition: 'transform 0.2s',
          height: 20,
          fontSize: '0.75rem',
        }}
      />
    </Tooltip>
  );
};

PublicationBadge.propTypes = {
  publication: PropTypes.shape({
    name: PropTypes.string.isRequired,
    year: PropTypes.number,
    url: PropTypes.string,
    bibtex: PropTypes.string,
  }).isRequired,
  paperTitle: PropTypes.string,
};

PublicationBadge.defaultProps = {
  paperTitle: '',
};

export default PublicationBadge;
