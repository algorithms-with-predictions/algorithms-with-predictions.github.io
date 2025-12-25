/**
 * Statistics calculation utilities for paper data
 */

import { buildAuthorCanonicalizer, parseAuthors } from './authorUtils';
import type { Paper } from '@/types';

/**
 * Venue statistics
 */
export interface VenueStats {
  /** Venue name */
  name: string;
  /** Number of papers in this venue */
  count: number;
}

/**
 * Paper statistics
 */
export interface PaperStats {
  /** Total number of papers */
  totalPapers: number;
  /** Total number of unique authors (canonicalized) */
  totalAuthors: number;
  /** Total number of unique venues (excluding arXiv) */
  totalVenues: number;
  /** Year distribution: year -> count of papers */
  yearDistribution: Record<number, number>;
  /** Top venues by paper count (limited to 7) */
  venueStats: VenueStats[];
}

/**
 * Calculate comprehensive statistics from paper data
 *
 * Computes:
 * - Total papers
 * - Unique authors (using canonicalization to merge variants)
 * - Unique venues (excluding arXiv)
 * - Year distribution (uses earliest publication year per paper)
 * - Top 7 venues by publication count
 *
 * @param data - Array of paper objects
 * @returns Statistics object
 */
export const calculateStats = (data: Paper[]): PaperStats => {
  const canonicalizer = buildAuthorCanonicalizer(data);

  // Calculate total papers
  const totalPapers = data.length;

  // Calculate unique authors
  const allAuthors = new Set<string>();
  data.forEach(paper => {
    if (paper.authors) {
      const authorList = parseAuthors(paper.authors);
      const canonicalKeys = Array.from(
        new Set(authorList.map(a => canonicalizer.canonicalKey(a)))
      );
      canonicalKeys.forEach(key => allAuthors.add(key));
    }
  });
  const totalAuthors = allAuthors.size;

  // Calculate unique venues
  const uniqueVenues = new Set<string>();
  data.forEach(paper => {
    if (paper.publications) {
      paper.publications.forEach(pub => {
        if (pub.name && pub.name !== 'arXiv') {
          uniqueVenues.add(pub.name);
        }
      });
    }
  });
  const totalVenues = uniqueVenues.size;

  // Calculate year distribution
  const yearDistribution = data.reduce<Record<number, number>>((acc, paper) => {
    // Get the earliest publication year for each paper
    if (paper.publications && paper.publications.length > 0) {
      const years = paper.publications
        .map(pub => pub.year)
        .filter(
          (year): year is number =>
            year !== null &&
            year !== undefined &&
            !isNaN(year) &&
            isFinite(year)
        );
      if (years.length > 0) {
        const earliestYear = Math.min(...years);
        acc[earliestYear] = (acc[earliestYear] || 0) + 1;
      }
    }
    return acc;
  }, {});

  // Calculate venue stats
  const allVenues = data.flatMap(p =>
    (p.publications || []).map(pub => pub.name).filter(name => name !== 'arXiv')
  );

  const venueStats: VenueStats[] = Object.entries(
    allVenues.reduce<Record<string, number>>((acc, venue) => {
      if (venue) {
        acc[venue] = (acc[venue] || 0) + 1;
      }
      return acc;
    }, {})
  )
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7);

  return {
    totalPapers,
    totalAuthors,
    totalVenues,
    yearDistribution,
    venueStats,
  };
};
