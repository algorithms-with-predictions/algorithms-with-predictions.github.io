import { TYPE_LABELS, PRIOR_LABEL } from '../constants';

/**
 * Get the color palette key for a label based on its type
 * @param {string} label - The label to get color for
 * @returns {string} - MUI palette color key
 */
export const getLabelColor = label => {
  if (TYPE_LABELS.includes(label)) {
    return 'typeLabels';
  } else if (label === PRIOR_LABEL) {
    return 'default';
  } else {
    return 'labels';
  }
};

/**
 * Sort labels: type labels (orange) first, then regular labels (blue), prior label (gray) last
 * @param {string[]} labels - Array of labels to sort
 * @returns {string[]} - Sorted array of labels
 */
export const sortLabels = labels => {
  if (!labels) return [];
  return [...labels].sort((a, b) => {
    const aIsType = TYPE_LABELS.includes(a);
    const bIsType = TYPE_LABELS.includes(b);
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
