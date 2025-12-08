import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useMediaQuery, useTheme } from '@mui/material';
import PaperCardDesktop from './PaperCardDesktop';
import PaperCardMobile from './PaperCardMobile';
import { trackPaperView } from '../../utils/analytics';

/**
 * Responsive PaperCard wrapper
 * Renders desktop or mobile layout based on screen size
 */
const PaperCard = ({ paper, selectedLabels = [], onLabelClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Track paper view when card is rendered
  useEffect(() => {
    trackPaperView(
      paper.title || 'Unknown paper',
      paper.labels?.join(', ') || 'no_category'
    );
  }, [paper.title, paper.labels]);

  const CardComponent = isMobile ? PaperCardMobile : PaperCardDesktop;

  return (
    <CardComponent
      paper={paper}
      selectedLabels={selectedLabels}
      onLabelClick={onLabelClick}
    />
  );
};

PaperCard.propTypes = {
  paper: PropTypes.shape({
    title: PropTypes.string,
    authors: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    labels: PropTypes.arrayOf(PropTypes.string),
    publications: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        year: PropTypes.number,
        url: PropTypes.string,
        bibtex: PropTypes.string,
      })
    ),
  }).isRequired,
  selectedLabels: PropTypes.arrayOf(PropTypes.string),
  onLabelClick: PropTypes.func,
};

PaperCard.defaultProps = {
  selectedLabels: [],
  onLabelClick: null,
};

export default PaperCard;
