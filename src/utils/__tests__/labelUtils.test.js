import { describe, it, expect } from 'vitest';
import { getLabelColor, sortLabels } from '../labelUtils';

describe('getLabelColor', () => {
  it('returns "typeLabels" for type labels', () => {
    expect(getLabelColor('online')).toBe('typeLabels');
    expect(getLabelColor('streaming')).toBe('typeLabels');
    expect(getLabelColor('approximation')).toBe('typeLabels');
    expect(getLabelColor('survey')).toBe('typeLabels');
  });

  it('returns "default" for prior label', () => {
    expect(getLabelColor('prior / related work')).toBe('default');
  });

  it('returns "labels" for regular labels', () => {
    expect(getLabelColor('rent-or-buy')).toBe('labels');
    expect(getLabelColor('scheduling')).toBe('labels');
    expect(getLabelColor('caching')).toBe('labels');
  });
});

describe('sortLabels', () => {
  it('returns empty array for null or undefined', () => {
    expect(sortLabels(null)).toEqual([]);
    expect(sortLabels(undefined)).toEqual([]);
  });

  it('returns empty array for empty input', () => {
    expect(sortLabels([])).toEqual([]);
  });

  it('places type labels first', () => {
    const labels = ['rent-or-buy', 'online', 'scheduling'];
    const sorted = sortLabels(labels);
    expect(sorted[0]).toBe('online');
  });

  it('places prior label last', () => {
    const labels = ['rent-or-buy', 'prior / related work', 'scheduling'];
    const sorted = sortLabels(labels);
    expect(sorted[sorted.length - 1]).toBe('prior / related work');
  });

  it('orders: type labels > regular labels > prior label', () => {
    const labels = [
      'prior / related work',
      'rent-or-buy',
      'online',
      'streaming',
      'scheduling',
    ];
    const sorted = sortLabels(labels);

    // Type labels should be first
    expect(sorted[0]).toBe('online');
    expect(sorted[1]).toBe('streaming');

    // Prior label should be last
    expect(sorted[sorted.length - 1]).toBe('prior / related work');

    // Regular labels in between
    expect(sorted.slice(2, -1)).toContain('rent-or-buy');
    expect(sorted.slice(2, -1)).toContain('scheduling');
  });

  it('does not mutate original array', () => {
    const labels = ['rent-or-buy', 'online'];
    const original = [...labels];
    sortLabels(labels);
    expect(labels).toEqual(original);
  });

  it('maintains relative order within same category', () => {
    const labels = ['caching', 'rent-or-buy', 'scheduling'];
    const sorted = sortLabels(labels);
    // All regular labels should maintain original relative order
    expect(sorted).toEqual(['caching', 'rent-or-buy', 'scheduling']);
  });
});
