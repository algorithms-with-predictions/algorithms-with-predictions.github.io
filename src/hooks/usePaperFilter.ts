import { useState, useMemo } from 'react';
import { SPECIAL_LABELS } from '../constants';
import type { Paper, Publication } from '@/types';

/**
 * Case-insensitive string comparison
 */
function stringCmp(a: string, b: string): number {
  return a.toLowerCase().localeCompare(b.toLowerCase());
}

/**
 * Return type for usePaperFilter hook
 */
export interface PaperFilterResult {
  /** Current search query */
  searchQuery: string;
  /** Set search query */
  setSearchQuery: (query: string) => void;
  /** Selected label filters */
  selLabels: string[];
  /** Set selected label filters */
  setSelLabels: (labels: string[] | ((prev: string[]) => string[])) => void;
  /** Filtered and sorted papers */
  sortedData: Paper[];
  /** All distinct labels (excluding special labels) */
  distinctLabels: string[];
  /** Clear all filters */
  handleClearFilters: () => void;
  /** Special labels constant */
  SPECIAL_LABELS: readonly string[];
}

/**
 * Hook for filtering and sorting papers based on search query and label selection
 *
 * Features:
 * - Search across title, authors, labels, and publications
 * - Filter by multiple labels (AND logic - all selected labels must match)
 * - Sort by publication date (newest first) then title (alphabetically)
 * - Extract distinct labels for filter UI
 *
 * @param data - Array of papers to filter
 * @returns Filter state and filtered data
 */
export const usePaperFilter = (data: Paper[] | null): PaperFilterResult => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selLabels, setSelLabels] = useState<string[]>([]);

  // Get all labels from papers
  const distinctLabels = useMemo(() => {
    if (!data) return [];
    const allLabels = data.flatMap(paper => (paper.labels ? paper.labels : []));
    const distinct = [...new Set(allLabels)];
    distinct.sort(stringCmp);
    return distinct.filter(
      el => !(SPECIAL_LABELS as readonly string[]).includes(el)
    );
  }, [data]);

  // Filter and sort papers
  const sortedData = useMemo(() => {
    if (!data) return [];
    let filtered = data;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        paper =>
          paper.title?.toLowerCase().includes(query) ||
          (typeof paper.authors === 'string'
            ? paper.authors.toLowerCase().includes(query)
            : paper.authors?.some(author =>
                author.toLowerCase().includes(query)
              )) ||
          paper.labels?.some(label => label.toLowerCase().includes(query)) ||
          paper.publications?.some(
            pub =>
              pub.name?.toLowerCase().includes(query) ||
              pub.year?.toString().includes(query)
          )
      );
    }

    // Apply label filter (AND logic - all selected labels must be present)
    if (selLabels.length > 0) {
      filtered = filtered.filter(paper =>
        selLabels.every(selectedLabel => paper.labels?.includes(selectedLabel))
      );
    }

    // Sort by year (newest first), then month/day (newest first), then title (alphabetically)
    return filtered.sort((a, b) => {
      const getLatestPublication = (paper: Paper): Publication => {
        if (!paper.publications || paper.publications.length === 0) {
          return { name: '', year: 0, month: 0, day: 0 };
        }
        // Find the most recent publication
        return paper.publications.reduce((latest, pub) => {
          const pubYear = pub.year || 0;
          const pubMonth = pub.month || 0;
          const pubDay = pub.day || 0;
          const latestYear = latest.year || 0;
          const latestMonth = latest.month || 0;
          const latestDay = latest.day || 0;

          if (pubYear > latestYear) return pub;
          if (pubYear < latestYear) return latest;
          // Same year, compare month
          if (pubMonth > latestMonth) return pub;
          if (pubMonth < latestMonth) return latest;
          // Same month, compare day
          if (pubDay > latestDay) return pub;
          return latest;
        }, paper.publications[0]!);
      };

      const pubA = getLatestPublication(a);
      const pubB = getLatestPublication(b);

      // Compare year (descending)
      const yearDiff = (pubB.year || 0) - (pubA.year || 0);
      if (yearDiff !== 0) return yearDiff;

      // Same year - papers with month/day come first (descending)
      const hasDateA = (pubA.month || 0) > 0 || (pubA.day || 0) > 0;
      const hasDateB = (pubB.month || 0) > 0 || (pubB.day || 0) > 0;

      if (hasDateA && !hasDateB) return -1; // A has date, comes first
      if (!hasDateA && hasDateB) return 1; // B has date, comes first

      if (hasDateA && hasDateB) {
        // Both have dates, compare month then day (descending)
        const monthDiff = (pubB.month || 0) - (pubA.month || 0);
        if (monthDiff !== 0) return monthDiff;

        const dayDiff = (pubB.day || 0) - (pubA.day || 0);
        if (dayDiff !== 0) return dayDiff;
      }

      // Same date or both missing date - sort alphabetically by title
      return stringCmp(a.title || '', b.title || '');
    });
  }, [data, searchQuery, selLabels]);

  const handleClearFilters = (): void => {
    setSearchQuery('');
    setSelLabels([]);
  };

  return {
    searchQuery,
    setSearchQuery,
    selLabels,
    setSelLabels,
    sortedData,
    distinctLabels,
    handleClearFilters,
    SPECIAL_LABELS,
  };
};
