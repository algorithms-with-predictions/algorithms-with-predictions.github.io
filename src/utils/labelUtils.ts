import { TYPE_LABELS, PRIOR_LABEL } from '../constants';

/**
 * MUI palette color keys for labels
 */
type LabelColorKey = 'typeLabels' | 'labels' | 'default';

/**
 * Get the color palette key for a label based on its type
 *
 * @param label - The label to get color for
 * @returns MUI palette color key
 *
 * Color mapping:
 * - TYPE_LABELS (e.g., "online", "streaming") → 'typeLabels' (orange)
 * - PRIOR_LABEL ("prior / related work") → 'default' (gray)
 * - Other labels → 'labels' (blue)
 */
export const getLabelColor = (label: string): LabelColorKey => {
  if (TYPE_LABELS.includes(label as (typeof TYPE_LABELS)[number])) {
    return 'typeLabels';
  } else if (label === PRIOR_LABEL) {
    return 'default';
  } else {
    return 'labels';
  }
};

/**
 * Sort labels by importance: type labels first, regular labels, prior label last
 *
 * @param labels - Array of labels to sort
 * @returns Sorted array of labels
 *
 * Sort order:
 * 1. Type labels (orange) - e.g., "online", "streaming"
 * 2. Regular labels (blue) - e.g., "caching/paging", "scheduling"
 * 3. Prior label (gray) - "prior / related work"
 */
export const sortLabels = (labels: string[] | undefined): string[] => {
  if (!labels) return [];
  return [...labels].sort((a, b) => {
    const aIsType = TYPE_LABELS.includes(a as (typeof TYPE_LABELS)[number]);
    const bIsType = TYPE_LABELS.includes(b as (typeof TYPE_LABELS)[number]);
    const aIsPrior = a === PRIOR_LABEL;
    const bIsPrior = b === PRIOR_LABEL;

    // Type labels (orange) come first
    if (aIsType && !bIsType) return -1;
    if (!aIsType && bIsType) return 1;

    // Prior label (gray) comes last
    if (aIsPrior && !bIsPrior) return 1;
    if (!aIsPrior && bIsPrior) return -1;

    // Otherwise maintain original order
    return 0;
  });
};
