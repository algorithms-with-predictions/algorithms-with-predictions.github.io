import type { Publication } from '@/types';

/**
 * Format authors for display
 *
 * @param authors - Authors as string or array
 * @param maxAuthors - Maximum number of authors to display before truncating (default: 3)
 * @returns Formatted author string
 */
export const formatAuthors = (
  authors: string | string[] | undefined,
  maxAuthors: number = 3
): string => {
  if (!authors) return 'Unknown authors';

  if (typeof authors === 'string') return authors;

  const authorArray = authors;

  if (authorArray.length <= maxAuthors) {
    return authorArray.join(', ');
  }

  // Show first maxAuthors + count of remaining
  const firstAuthors = authorArray.slice(0, maxAuthors).join(', ');
  const remaining = authorArray.length - maxAuthors;
  return `${firstAuthors} and ${remaining} more`;
};

/**
 * Get full author list for tooltip (without truncation)
 *
 * @param authors - Authors as string or array
 * @returns Full author string
 */
export const getFullAuthorList = (
  authors: string | string[] | undefined
): string => {
  if (!authors) return 'Unknown authors';
  return typeof authors === 'string' ? authors : authors.join(', ');
};

/**
 * Get the main publication for a paper (prefer non-arXiv publications)
 *
 * @param publications - Array of publication objects
 * @returns The main publication, or undefined if no publications
 */
export const getMainPublication = (
  publications: Publication[] | undefined
): Publication | undefined => {
  if (!publications || publications.length === 0) return undefined;
  return publications.find(pub => pub.name !== 'arXiv') || publications[0];
};

/**
 * Open URL in new tab safely with noopener and noreferrer
 *
 * @param url - URL to open
 */
export const openInNewTab = (url: string): void => {
  if (typeof window !== 'undefined') {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;
  }
};

/**
 * Check if a paper has any BibTeX entries
 *
 * @param publications - Array of publication objects
 * @returns True if at least one publication has BibTeX
 */
export const hasBibtex = (publications: Publication[] | undefined): boolean => {
  return publications?.some(pub => pub.bibtex) ?? false;
};

/**
 * Get all BibTeX entries for a paper, combined into a single string
 *
 * @param publications - Array of publication objects
 * @returns Combined BibTeX entries, separated by blank lines
 */
export const getBibtexEntries = (
  publications: Publication[] | undefined
): string => {
  return (
    publications
      ?.filter(pub => pub.bibtex)
      .map(pub => pub.bibtex!.trim())
      .join('\n\n') || ''
  );
};
