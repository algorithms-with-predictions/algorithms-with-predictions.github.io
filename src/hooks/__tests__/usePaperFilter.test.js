import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePaperFilter } from '../usePaperFilter';

const mockPapers = [
  {
    title: 'Online Algorithms with Predictions',
    authors: 'Alice Smith, Bob Jones',
    labels: ['online', 'rent-or-buy'],
    publications: [
      { name: 'ICML', year: 2023 },
      { name: 'arXiv', year: 2022 },
    ],
  },
  {
    title: 'Streaming Data Structures',
    authors: ['Charlie Brown', 'Diana Prince'],
    labels: ['streaming', 'data-structure'],
    publications: [{ name: 'NeurIPS', year: 2022 }],
  },
  {
    title: 'Scheduling with Machine Learning',
    authors: 'Eve Wilson',
    labels: ['scheduling', 'online'],
    publications: [{ name: 'SODA', year: 2021 }],
  },
];

describe('usePaperFilter', () => {
  describe('initialization', () => {
    it('initializes with empty search query', () => {
      const { result } = renderHook(() => usePaperFilter(mockPapers));
      expect(result.current.searchQuery).toBe('');
    });

    it('initializes with empty selected labels', () => {
      const { result } = renderHook(() => usePaperFilter(mockPapers));
      expect(result.current.selLabels).toEqual([]);
    });

    it('returns all papers initially sorted by year', () => {
      const { result } = renderHook(() => usePaperFilter(mockPapers));
      expect(result.current.sortedData.length).toBe(3);
      // Should be sorted newest first (2023, 2022, 2021)
      expect(result.current.sortedData[0].title).toBe(
        'Online Algorithms with Predictions'
      );
    });
  });

  describe('distinctLabels', () => {
    it('extracts unique non-special labels', () => {
      const { result } = renderHook(() => usePaperFilter(mockPapers));
      const labels = result.current.distinctLabels;

      expect(labels).toContain('rent-or-buy');
      expect(labels).toContain('data-structure');
      expect(labels).toContain('scheduling');

      // Special labels should be excluded
      expect(labels).not.toContain('online');
      expect(labels).not.toContain('streaming');
    });

    it('sorts labels alphabetically', () => {
      const { result } = renderHook(() => usePaperFilter(mockPapers));
      const labels = result.current.distinctLabels;

      for (let i = 1; i < labels.length; i++) {
        expect(
          labels[i - 1].toLowerCase() <= labels[i].toLowerCase()
        ).toBeTruthy();
      }
    });
  });

  describe('search filtering', () => {
    it('filters by title', () => {
      const { result } = renderHook(() => usePaperFilter(mockPapers));

      act(() => {
        result.current.setSearchQuery('streaming');
      });

      expect(result.current.sortedData.length).toBe(1);
      expect(result.current.sortedData[0].title).toBe(
        'Streaming Data Structures'
      );
    });

    it('filters by author (string format)', () => {
      const { result } = renderHook(() => usePaperFilter(mockPapers));

      act(() => {
        result.current.setSearchQuery('alice');
      });

      expect(result.current.sortedData.length).toBe(1);
      expect(result.current.sortedData[0].authors).toContain('Alice');
    });

    it('filters by author (array format)', () => {
      const { result } = renderHook(() => usePaperFilter(mockPapers));

      act(() => {
        result.current.setSearchQuery('charlie');
      });

      expect(result.current.sortedData.length).toBe(1);
      expect(result.current.sortedData[0].authors).toContain('Charlie Brown');
    });

    it('filters by label', () => {
      const { result } = renderHook(() => usePaperFilter(mockPapers));

      act(() => {
        result.current.setSearchQuery('rent-or-buy');
      });

      expect(result.current.sortedData.length).toBe(1);
    });

    it('filters by venue name', () => {
      const { result } = renderHook(() => usePaperFilter(mockPapers));

      act(() => {
        result.current.setSearchQuery('neurips');
      });

      expect(result.current.sortedData.length).toBe(1);
      expect(result.current.sortedData[0].title).toBe(
        'Streaming Data Structures'
      );
    });

    it('filters by year', () => {
      const { result } = renderHook(() => usePaperFilter(mockPapers));

      act(() => {
        result.current.setSearchQuery('2021');
      });

      expect(result.current.sortedData.length).toBe(1);
      expect(result.current.sortedData[0].title).toBe(
        'Scheduling with Machine Learning'
      );
    });

    it('is case insensitive', () => {
      const { result } = renderHook(() => usePaperFilter(mockPapers));

      act(() => {
        result.current.setSearchQuery('STREAMING');
      });

      expect(result.current.sortedData.length).toBe(1);
    });
  });

  describe('label filtering', () => {
    it('filters by single label', () => {
      const { result } = renderHook(() => usePaperFilter(mockPapers));

      act(() => {
        result.current.setSelLabels(['online']);
      });

      expect(result.current.sortedData.length).toBe(2);
    });

    it('filters by multiple labels (AND logic)', () => {
      const { result } = renderHook(() => usePaperFilter(mockPapers));

      act(() => {
        result.current.setSelLabels(['online', 'rent-or-buy']);
      });

      expect(result.current.sortedData.length).toBe(1);
      expect(result.current.sortedData[0].title).toBe(
        'Online Algorithms with Predictions'
      );
    });

    it('returns empty when no papers match all labels', () => {
      const { result } = renderHook(() => usePaperFilter(mockPapers));

      act(() => {
        result.current.setSelLabels(['online', 'streaming']);
      });

      expect(result.current.sortedData.length).toBe(0);
    });
  });

  describe('combined filtering', () => {
    it('applies both search and label filters', () => {
      const { result } = renderHook(() => usePaperFilter(mockPapers));

      act(() => {
        result.current.setSearchQuery('alice');
        result.current.setSelLabels(['online']);
      });

      expect(result.current.sortedData.length).toBe(1);
      expect(result.current.sortedData[0].title).toBe(
        'Online Algorithms with Predictions'
      );
    });
  });

  describe('sorting', () => {
    it('sorts papers by newest publication year first', () => {
      const { result } = renderHook(() => usePaperFilter(mockPapers));

      const years = result.current.sortedData.map(paper =>
        Math.max(...paper.publications.map(p => p.year))
      );

      for (let i = 1; i < years.length; i++) {
        expect(years[i - 1] >= years[i]).toBeTruthy();
      }
    });
  });

  describe('handleClearFilters', () => {
    it('clears search query and selected labels', () => {
      const { result } = renderHook(() => usePaperFilter(mockPapers));

      act(() => {
        result.current.setSearchQuery('test');
        result.current.setSelLabels(['online']);
      });

      expect(result.current.searchQuery).toBe('test');
      expect(result.current.selLabels).toEqual(['online']);

      act(() => {
        result.current.handleClearFilters();
      });

      expect(result.current.searchQuery).toBe('');
      expect(result.current.selLabels).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('handles null data', () => {
      const { result } = renderHook(() => usePaperFilter(null));
      expect(result.current.sortedData).toEqual([]);
      expect(result.current.distinctLabels).toEqual([]);
    });

    it('handles empty data', () => {
      const { result } = renderHook(() => usePaperFilter([]));
      expect(result.current.sortedData).toEqual([]);
    });

    it('handles papers without labels', () => {
      const papersWithoutLabels = [{ title: 'Test', authors: 'Test' }];
      const { result } = renderHook(() => usePaperFilter(papersWithoutLabels));
      expect(result.current.distinctLabels).toEqual([]);
    });
  });
});
