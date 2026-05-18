import { useEffect, useRef, memo } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import PaperCardDesktop from './PaperCardDesktop';
import PaperCardMobile from './PaperCardMobile';
import { trackPaperView } from '../../utils/analytics';
import type { Paper } from '@/types/paper';

export interface PaperCardProps {
  paper: Paper;
  selectedLabels?: string[];
  onLabelClick?: ((label: string) => void) | null;
}

/**
 * Responsive PaperCard wrapper
 * Renders desktop or mobile layout based on screen size
 * Uses Intersection Observer to track only visible papers
 */
const PaperCard: React.FC<PaperCardProps> = ({
  paper,
  selectedLabels = [],
  onLabelClick = null,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Refs for viewport tracking
  const cardRef = useRef<HTMLDivElement>(null);
  const hasTrackedRef = useRef(false);
  const visibilityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track paper view only when it becomes visible in viewport
  useEffect(() => {
    if (!cardRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasTrackedRef.current) {
            // Wait 1 second before tracking to ensure user is actually viewing
            // This filters out papers that are scrolled past quickly
            visibilityTimerRef.current = setTimeout(() => {
              if (!hasTrackedRef.current) {
                trackPaperView(
                  paper.title || 'Unknown paper',
                  paper.labels?.join(', ') || 'no_category'
                );
                hasTrackedRef.current = true;
              }
            }, 1000);
          } else {
            // Clear timer if paper leaves viewport before 1 second
            if (visibilityTimerRef.current) {
              clearTimeout(visibilityTimerRef.current);
              visibilityTimerRef.current = null;
            }
          }
        });
      },
      {
        threshold: 0.5, // 50% of card must be visible
        rootMargin: '0px',
      }
    );

    observer.observe(cardRef.current);

    return () => {
      observer.disconnect();
      if (visibilityTimerRef.current) {
        clearTimeout(visibilityTimerRef.current);
      }
    };
  }, [paper.title, paper.labels]);

  const CardComponent = isMobile ? PaperCardMobile : PaperCardDesktop;

  return (
    <div ref={cardRef}>
      <CardComponent
        paper={paper}
        selectedLabels={selectedLabels}
        onLabelClick={onLabelClick}
      />
    </div>
  );
};

/**
 * Efficiently compare two string arrays for equality
 */
const areStringArraysEqual = (
  a: string[] | undefined,
  b: string[] | undefined
): boolean => {
  if (a === b) return true;
  if (!a || !b) return a === b;
  if (a.length !== b.length) return false;
  return a.every((val, idx) => val === b[idx]);
};

/**
 * Efficiently compare two publication arrays for equality
 * Compares only the fields that affect rendering
 */
const arePublicationsEqual = (
  a: Paper['publications'],
  b: Paper['publications']
): boolean => {
  if (a === b) return true;
  if (!a || !b) return a === b;
  if (a.length !== b.length) return false;

  return a.every((pubA, idx) => {
    const pubB = b[idx];
    if (!pubB) return false;
    return (
      pubA.name === pubB.name &&
      pubA.year === pubB.year &&
      pubA.url === pubB.url &&
      pubA.bibtex === pubB.bibtex
    );
  });
};

/**
 * Custom comparison function for memo
 * Optimized to avoid expensive JSON.stringify calls
 */
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
    areStringArraysEqual(prevProps.paper.labels, nextProps.paper.labels) &&
    arePublicationsEqual(
      prevProps.paper.publications,
      nextProps.paper.publications
    );

  // Compare selectedLabels array
  const labelsEqual =
    prevSelectedLabels.length === nextSelectedLabels.length &&
    prevSelectedLabels.every((label, idx) => label === nextSelectedLabels[idx]);

  // Compare onLabelClick function reference
  const callbackEqual = prevProps.onLabelClick === nextProps.onLabelClick;

  return paperEqual && labelsEqual && callbackEqual;
};

export default memo(PaperCard, arePropsEqual);
