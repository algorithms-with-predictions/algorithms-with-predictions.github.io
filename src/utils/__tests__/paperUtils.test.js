import { describe, it, expect } from 'vitest';
import {
  formatAuthors,
  getMainPublication,
  hasBibtex,
  getBibtexEntries,
} from '../paperUtils';

describe('formatAuthors', () => {
  it('returns "Unknown authors" for null/undefined', () => {
    expect(formatAuthors(null)).toBe('Unknown authors');
    expect(formatAuthors(undefined)).toBe('Unknown authors');
  });

  it('returns string as-is', () => {
    expect(formatAuthors('Alice, Bob, Charlie')).toBe('Alice, Bob, Charlie');
  });

  it('joins array with commas', () => {
    expect(formatAuthors(['Alice', 'Bob', 'Charlie'])).toBe(
      'Alice, Bob, Charlie'
    );
  });

  it('handles single author array', () => {
    expect(formatAuthors(['Alice'])).toBe('Alice');
  });

  it('handles empty array', () => {
    expect(formatAuthors([])).toBe('');
  });
});

describe('getMainPublication', () => {
  it('returns undefined for empty/null publications', () => {
    expect(getMainPublication(null)).toBeUndefined();
    expect(getMainPublication(undefined)).toBeUndefined();
    expect(getMainPublication([])).toBeUndefined();
  });

  it('prefers non-arXiv publication', () => {
    const publications = [
      { name: 'arXiv', year: 2023 },
      { name: 'ICML', year: 2023 },
    ];
    expect(getMainPublication(publications)).toEqual({
      name: 'ICML',
      year: 2023,
    });
  });

  it('returns first publication if all are arXiv', () => {
    const publications = [
      { name: 'arXiv', year: 2022 },
      { name: 'arXiv', year: 2023 },
    ];
    expect(getMainPublication(publications)).toEqual({
      name: 'arXiv',
      year: 2022,
    });
  });

  it('returns first non-arXiv when multiple non-arXiv exist', () => {
    const publications = [
      { name: 'arXiv', year: 2022 },
      { name: 'ICML', year: 2023 },
      { name: 'NeurIPS', year: 2023 },
    ];
    expect(getMainPublication(publications).name).toBe('ICML');
  });
});

describe('hasBibtex', () => {
  it('returns false for null/undefined', () => {
    expect(hasBibtex(null)).toBe(false);
    expect(hasBibtex(undefined)).toBe(false);
  });

  it('returns false for empty array', () => {
    expect(hasBibtex([])).toBe(false);
  });

  it('returns false when no publications have bibtex', () => {
    const publications = [
      { name: 'ICML', year: 2023 },
      { name: 'arXiv', year: 2023 },
    ];
    expect(hasBibtex(publications)).toBe(false);
  });

  it('returns true when at least one publication has bibtex', () => {
    const publications = [
      { name: 'ICML', year: 2023, bibtex: '@article{...}' },
      { name: 'arXiv', year: 2023 },
    ];
    expect(hasBibtex(publications)).toBe(true);
  });
});

describe('getBibtexEntries', () => {
  it('returns empty string for null/undefined', () => {
    expect(getBibtexEntries(null)).toBe('');
    expect(getBibtexEntries(undefined)).toBe('');
  });

  it('returns empty string when no bibtex entries', () => {
    const publications = [{ name: 'ICML', year: 2023 }];
    expect(getBibtexEntries(publications)).toBe('');
  });

  it('returns single bibtex entry trimmed', () => {
    const publications = [
      { name: 'ICML', bibtex: '  @article{test}  ' },
    ];
    expect(getBibtexEntries(publications)).toBe('@article{test}');
  });

  it('joins multiple bibtex entries with double newline', () => {
    const publications = [
      { name: 'ICML', bibtex: '@article{first}' },
      { name: 'NeurIPS', bibtex: '@inproceedings{second}' },
    ];
    expect(getBibtexEntries(publications)).toBe(
      '@article{first}\n\n@inproceedings{second}'
    );
  });

  it('filters out publications without bibtex', () => {
    const publications = [
      { name: 'arXiv' },
      { name: 'ICML', bibtex: '@article{test}' },
    ];
    expect(getBibtexEntries(publications)).toBe('@article{test}');
  });
});
