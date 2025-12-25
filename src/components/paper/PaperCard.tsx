import { useEffect, useRef, memo } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import PaperCardDesktop from './PaperCardDesktop';
import PaperCardMobile from './PaperCardMobile';
import { trackPaperView } from '../../utils/analytics';

export interface Publication {
  name: string;
  year?: number;
  url?: string;
  bibtex?: string;
}

export interface Paper {
  title?: string;
  authors?: string | string[];
  labels?: string[];
  publications?: Publication[];
}

export interface PaperCardProps {
  paper: Paper;
  selectedLabels?: string[];
  onLabelClick?: ((label: string) => void) | null;
}

/**
 * Responsive PaperCard wrapper
 * Renders desktop or mobile layout based on screen size
 */
const PaperCard: React.FC<PaperCardProps> = ({
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

// Custom comparison function for memo
const arePropsEqual = (
  prevProps: PaperCardProps,
  nextProps: PaperCardProps
): boolean => {
  const prevSelectedLabels = prevProps.selectedLabels || [];
  const nextSelectedLabels = nextProps.selectedLabels || [];

  // Compare paper object by reference first for quick check
  if (
    prevProps.paper === nextProps.paper &&
    prevProps.onLabelClick === nextProps.onLabelClick &&
    prevSelectedLabels.length === nextSelectedLabels.length &&
    prevSelectedLabels.every((label, idx) => label === nextSelectedLabels[idx])
  ) {
    return true;
  }

  // Deep compare paper properties that affect rendering
  const paperEqual =
    prevProps.paper.title === nextProps.paper.title &&
    prevProps.paper.authors === nextProps.paper.authors &&
    JSON.stringify(prevProps.paper.labels) ===
      JSON.stringify(nextProps.paper.labels) &&
    JSON.stringify(prevProps.paper.publications) ===
      JSON.stringify(nextProps.paper.publications);

  // Compare selectedLabels array
  const labelsEqual =
    prevSelectedLabels.length === nextSelectedLabels.length &&
    prevSelectedLabels.every((label, idx) => label === nextSelectedLabels[idx]);

  // Compare onLabelClick function reference
  const callbackEqual = prevProps.onLabelClick === nextProps.onLabelClick;

  return paperEqual && labelsEqual && callbackEqual;
};

export default memo(PaperCard, arePropsEqual);
