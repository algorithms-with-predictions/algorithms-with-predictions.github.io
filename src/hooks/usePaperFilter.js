import { useState, useMemo } from 'react';
import { SPECIAL_LABELS } from '../constants';

function stringCmp(a, b) {
  return a.toLowerCase().localeCompare(b.toLowerCase());
}

export const usePaperFilter = data => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selLabels, setSelLabels] = useState([]);

  // Get all labels from papers
  const distinctLabels = useMemo(() => {
    if (!data) return [];
    const allLabels = data.flatMap(paper => (paper.labels ? paper.labels : []));
    let distinct = [...new Set(allLabels)];
    distinct.sort(stringCmp);
    return distinct.filter(el => !SPECIAL_LABELS.includes(el));
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

    // Apply label filter
    if (selLabels.length > 0) {
      filtered = filtered.filter(paper =>
        selLabels.every(selectedLabel => paper.labels?.includes(selectedLabel))
      );
    }

    // Sort by year (newest first)
    return filtered.sort((a, b) => {
      const getLatestYear = paper => {
        if (!paper.publications || paper.publications.length === 0) return 0;
        return Math.max(...paper.publications.map(pub => pub.year || 0));
      };
      return getLatestYear(b) - getLatestYear(a);
    });
  }, [data, searchQuery, selLabels]);

  const handleClearFilters = () => {
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
