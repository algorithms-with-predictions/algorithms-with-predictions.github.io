/**
 * Format authors for display
 * @param {string|string[]} authors - Authors as string or array
 * @returns {string} - Formatted author string
 */
export const formatAuthors = authors => {
  if (!authors) return 'Unknown authors';
  return typeof authors === 'string' ? authors : authors.join(', ');
};

/**
 * Get the main publication for a paper (prefer non-arXiv)
 * @param {Array} publications - Array of publication objects
 * @returns {Object|undefined} - The main publication
 */
export const getMainPublication = publications => {
  if (!publications || publications.length === 0) return undefined;
  return publications.find(pub => pub.name !== 'arXiv') || publications[0];
};

/**
 * Open URL in new tab safely
 * @param {string} url - URL to open
 */
export const openInNewTab = url => {
  if (typeof window !== 'undefined') {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;
  }
};

/**
 * Check if a paper has any BibTeX entries
 * @param {Array} publications - Array of publication objects
 * @returns {boolean} - True if paper has BibTeX
 */
export const hasBibtex = publications => {
  return publications?.some(pub => pub.bibtex) ?? false;
};

/**
 * Get all BibTeX entries for a paper
 * @param {Array} publications - Array of publication objects
 * @returns {string} - Combined BibTeX entries
 */
export const getBibtexEntries = publications => {
  return (
    publications
      ?.filter(pub => pub.bibtex)
      .map(pub => pub.bibtex.trim())
      .join('\n\n') || ''
  );
};
