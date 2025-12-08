import { describe, it, expect } from 'vitest';
import { calculateStats } from '../statsUtils';

describe('calculateStats', () => {
  it('returns zeros for empty data', () => {
    const result = calculateStats([]);
    expect(result.totalPapers).toBe(0);
    expect(result.totalAuthors).toBe(0);
    expect(result.totalVenues).toBe(0);
    expect(result.yearDistribution).toEqual({});
    expect(result.venueStats).toEqual([]);
  });

  it('counts total papers correctly', () => {
    const data = [
      { title: 'Paper 1' },
      { title: 'Paper 2' },
      { title: 'Paper 3' },
    ];
    const result = calculateStats(data);
    expect(result.totalPapers).toBe(3);
  });

  it('counts unique authors from string format', () => {
    const data = [{ authors: 'Alice, Bob' }, { authors: 'Bob, Charlie' }];
    const result = calculateStats(data);
    expect(result.totalAuthors).toBe(3); // Alice, Bob, Charlie
  });

  it('counts unique authors from array format', () => {
    const data = [
      { authors: ['Alice', 'Bob'] },
      { authors: ['Bob', 'Charlie'] },
    ];
    const result = calculateStats(data);
    expect(result.totalAuthors).toBe(3);
  });

  it('handles mixed author formats', () => {
    const data = [{ authors: 'Alice, Bob' }, { authors: ['Charlie', 'David'] }];
    const result = calculateStats(data);
    expect(result.totalAuthors).toBe(4);
  });

  it('excludes arXiv from venue count', () => {
    const data = [
      {
        publications: [
          { name: 'arXiv', year: 2023 },
          { name: 'ICML', year: 2023 },
        ],
      },
      {
        publications: [{ name: 'NeurIPS', year: 2023 }],
      },
    ];
    const result = calculateStats(data);
    expect(result.totalVenues).toBe(2); // ICML, NeurIPS (not arXiv)
  });

  it('calculates year distribution correctly', () => {
    const data = [
      { publications: [{ year: 2022 }, { year: 2023 }] },
      { publications: [{ year: 2022 }] },
      { publications: [{ year: 2023 }] },
    ];
    const result = calculateStats(data);
    expect(result.yearDistribution).toEqual({
      2022: 2, // First paper's earliest is 2022, second paper is 2022
      2023: 1, // Third paper is 2023
    });
  });

  it('calculates venue stats sorted by count', () => {
    const data = [
      { publications: [{ name: 'ICML' }, { name: 'arXiv' }] },
      { publications: [{ name: 'ICML' }] },
      { publications: [{ name: 'NeurIPS' }] },
    ];
    const result = calculateStats(data);
    expect(result.venueStats[0]).toEqual({ name: 'ICML', count: 2 });
    expect(result.venueStats[1]).toEqual({ name: 'NeurIPS', count: 1 });
  });

  it('limits venue stats to top 7', () => {
    const data = Array.from({ length: 10 }, (_, i) => ({
      publications: [{ name: `Venue${i}` }],
    }));
    const result = calculateStats(data);
    expect(result.venueStats.length).toBe(7);
  });

  it('handles papers without authors', () => {
    const data = [{ title: 'Paper without authors' }];
    const result = calculateStats(data);
    expect(result.totalAuthors).toBe(0);
  });

  it('handles papers without publications', () => {
    const data = [{ title: 'Paper without publications' }];
    const result = calculateStats(data);
    expect(result.totalVenues).toBe(0);
    expect(result.yearDistribution).toEqual({});
  });
});
