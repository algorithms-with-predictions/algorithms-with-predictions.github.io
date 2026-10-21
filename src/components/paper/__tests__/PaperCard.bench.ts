/**
 * Benchmark comparing JSON.stringify vs optimized array comparison
 * Run with: npx vitest bench --run PaperCard
 */

import { describe, test } from 'vitest';

// Simulate paper data
const labels = [
  'online',
  'caching/paging',
  'randomized',
  'competitive-analysis',
];
const publications = [
  {
    name: 'ICML',
    year: 2024,
    url: 'https://example.com',
    bibtex: '@article{test1}',
  },
  {
    name: 'NeurIPS',
    year: 2023,
    url: 'https://example2.com',
    bibtex: '@article{test2}',
  },
  {
    name: 'AAAI',
    year: 2024,
    url: 'https://example3.com',
    bibtex: '@article{test3}',
  },
];

// Old approach using JSON.stringify
const compareWithJsonStringify = (a: string[], b: string[]) => {
  return JSON.stringify(a) === JSON.stringify(b);
};

const comparePublicationsWithJsonStringify = (
  a: typeof publications,
  b: typeof publications
) => {
  return JSON.stringify(a) === JSON.stringify(b);
};

// Optimized approach
const compareArraysOptimized = (a: string[], b: string[]) => {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  return a.every((val, idx) => val === b[idx]);
};

const comparePublicationsOptimized = (
  a: typeof publications,
  b: typeof publications
) => {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  return a.every((pubA, idx) => {
    const pubB = b[idx];
    if (!pubB) return false;
    return (
      pubA.name === pubB.name &&
      pubA.year === pubB.year &&
      pubA.url === pubB.url &&
      pubA.bibtex === pubB.bibtex
    );
  });
};

describe('PaperCard comparison performance', () => {
  test('String array comparison', async ({ bench }) => {
    await bench.compare(
      bench('JSON.stringify approach', () => {
        compareWithJsonStringify(labels, [...labels]);
      }),
      bench('Optimized approach', () => {
        compareArraysOptimized(labels, [...labels]);
      })
    );
  });

  test('Publication array comparison', async ({ bench }) => {
    await bench.compare(
      bench('JSON.stringify approach', () => {
        comparePublicationsWithJsonStringify(publications, [...publications]);
      }),
      bench('Optimized approach', () => {
        comparePublicationsOptimized(publications, [...publications]);
      })
    );
  });
});
