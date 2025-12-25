import React, { useEffect, useRef, memo } from 'react';
import PropTypes from 'prop-types';
import { useMediaQuery, useTheme } from '@mui/material';
import PaperCardDesktop from './PaperCardDesktop';
import PaperCardMobile from './PaperCardMobile';
import { trackPaperView } from '../../utils/analytics';

/**
 * Responsive PaperCard wrapper
 * Renders desktop or mobile layout based on screen size
 */
const PaperCard = ({
  paper,
  selectedLabels = [],
  onLabelClick = null,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Track if this paper has already been tracked
  const hasTrackedRef = useRef(false);

  // Track paper view only once when card is first rendered
  useEffect(() => {
    if (!hasTrackedRef.current) {
      trackPaperView(
        paper.title || 'Unknown paper',
        paper.labels?.join(', ') || 'no_category'
      );
      hasTrackedRef.current = true;
    }
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

// Custom comparison function for memo
const arePropsEqual = (prevProps, nextProps) => {
  // Compare paper object by reference first for quick check
  if (prevProps.paper === nextProps.paper &&
      prevProps.onLabelClick === nextProps.onLabelClick &&
      prevProps.selectedLabels.length === nextProps.selectedLabels.length &&
      prevProps.selectedLabels.every((label, idx) => label === nextProps.selectedLabels[idx])) {
    return true;
  }

  // Deep compare paper properties that affect rendering
  const paperEqual =
    prevProps.paper.title === nextProps.paper.title &&
    prevProps.paper.authors === nextProps.paper.authors &&
    JSON.stringify(prevProps.paper.labels) === JSON.stringify(nextProps.paper.labels) &&
    JSON.stringify(prevProps.paper.publications) === JSON.stringify(nextProps.paper.publications);

  // Compare selectedLabels array
  const labelsEqual =
    prevProps.selectedLabels.length === nextProps.selectedLabels.length &&
    prevProps.selectedLabels.every((label, idx) => label === nextProps.selectedLabels[idx]);

  // Compare onLabelClick function reference
  const callbackEqual = prevProps.onLabelClick === nextProps.onLabelClick;

  return paperEqual && labelsEqual && callbackEqual;
};

export default memo(PaperCard, arePropsEqual);
