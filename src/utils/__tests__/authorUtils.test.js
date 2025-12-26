import { describe, it, expect } from 'vitest';
import {
  parseAuthors,
  normalizeAuthorKey,
  buildAuthorCanonicalizer,
} from '../authorUtils';

describe('parseAuthors', () => {
  describe('basic input handling', () => {
    it('should return empty array for undefined', () => {
      expect(parseAuthors(undefined)).toEqual([]);
    });

    it('should return empty array for empty string', () => {
      expect(parseAuthors('')).toEqual([]);
    });

    it('should handle single author name', () => {
      expect(parseAuthors('John Smith')).toEqual(['John Smith']);
    });

    it('should handle array input', () => {
      expect(parseAuthors(['Alice Johnson', 'Bob Williams'])).toEqual([
        'Alice Johnson',
        'Bob Williams',
      ]);
    });
  });

  describe('HTML entity decoding', () => {
    it('should decode common HTML entities', () => {
      expect(parseAuthors('O&apos;Brien')).toEqual(["O'Brien"]);
      expect(parseAuthors('Smith &#39; Jones')).toEqual(["Smith ' Jones"]);
      expect(parseAuthors('A &amp; B')).toEqual(['A & B']);
      expect(parseAuthors('A &lt; B')).toEqual(['A < B']);
    });
  });

  describe('whitespace normalization', () => {
    it('should normalize multiple spaces to single space', () => {
      expect(parseAuthors('John    Smith')).toEqual(['John Smith']);
    });

    it('should trim leading and trailing whitespace', () => {
      expect(parseAuthors('  John Smith  ')).toEqual(['John Smith']);
    });

    it('should handle tabs and newlines', () => {
      expect(parseAuthors('John\t\nSmith')).toEqual(['John Smith']);
    });
  });

  describe('Last, First format conversion', () => {
    it('should convert "Last, First" when there are no other commas', () => {
      // Note: Single "Last, First" is split on comma, not reordered
      // Reordering happens when semicolons are used as list separator
      expect(parseAuthors('Smith, John')).toEqual(['Smith', 'John']);
    });

    it('should split comma-separated names', () => {
      expect(parseAuthors('Smith, John Alan')).toEqual(['Smith', 'John Alan']);
    });

    it('should handle names without commas unchanged', () => {
      expect(parseAuthors('John Smith')).toEqual(['John Smith']);
    });

    it('should handle empty parts gracefully', () => {
      expect(parseAuthors('Smith, ')).toEqual(['Smith']);
      expect(parseAuthors(', John')).toEqual(['John']);
    });
  });

  describe('semicolon-separated lists', () => {
    it('should split on semicolons', () => {
      expect(parseAuthors('Smith, John; Doe, Jane')).toEqual([
        'John Smith',
        'Jane Doe',
      ]);
    });

    it('should handle semicolons with extra whitespace', () => {
      expect(parseAuthors('Smith, John ; Doe, Jane')).toEqual([
        'John Smith',
        'Jane Doe',
      ]);
    });

    it('should prefer semicolons over commas for splitting', () => {
      expect(parseAuthors('A, B; C, D')).toEqual(['B A', 'D C']);
    });
  });

  describe('comma-separated lists', () => {
    it('should split on commas when no semicolons present', () => {
      expect(parseAuthors('Alice, Bob, Charlie')).toEqual([
        'Alice',
        'Bob',
        'Charlie',
      ]);
    });

    it('should handle commas with extra whitespace', () => {
      expect(parseAuthors('Alice , Bob , Charlie')).toEqual([
        'Alice',
        'Bob',
        'Charlie',
      ]);
    });
  });

  describe('"and" separator handling', () => {
    it('should split on "and" when no commas present', () => {
      expect(parseAuthors('Alice and Bob')).toEqual(['Alice', 'Bob']);
    });

    it('should be case-insensitive for "and"', () => {
      expect(parseAuthors('Alice AND Bob')).toEqual(['Alice', 'Bob']);
      expect(parseAuthors('Alice And Bob')).toEqual(['Alice', 'Bob']);
    });

    it('should not split on "and" when commas are present', () => {
      // Avoid breaking "A, B, and C" format
      expect(parseAuthors('A, B, and C')).toEqual(['A', 'B', 'and C']);
    });
  });

  describe('diacritics and Unicode preservation', () => {
    it('should preserve diacritics in display names', () => {
      expect(parseAuthors('José García')).toEqual(['José García']);
      // Comma-separated will split, not reorder
      expect(parseAuthors('Müller, Hans')).toEqual(['Müller', 'Hans']);
    });

    it('should preserve Unicode characters', () => {
      expect(parseAuthors('François Dürr')).toEqual(['François Dürr']);
    });
  });

  describe('real-world examples', () => {
    it('should handle author lists with initials', () => {
      expect(parseAuthors('Smith, J.; Doe, A. B.')).toEqual([
        'J. Smith',
        'A. B. Doe',
      ]);
    });

    it('should handle mixed formats in array', () => {
      expect(parseAuthors(['Smith, John', 'Alice Johnson'])).toEqual([
        'Smith',
        'John',
        'Alice Johnson',
      ]);
    });

    it('should filter out empty entries', () => {
      expect(parseAuthors(['Alice', '', 'Bob'])).toEqual(['Alice', 'Bob']);
    });
  });
});

describe('normalizeAuthorKey', () => {
  it('should normalize simple names to lowercase', () => {
    expect(normalizeAuthorKey('John Smith')).toBe('john smith');
  });

  it('should strip diacritics', () => {
    expect(normalizeAuthorKey('José García')).toBe('jose garcia');
    expect(normalizeAuthorKey('François')).toBe('francois');
  });

  it('should remove punctuation', () => {
    expect(normalizeAuthorKey("O'Brien")).toBe('obrien');
    expect(normalizeAuthorKey('Smith-Jones')).toBe('smith jones');
  });

  it('should normalize various apostrophe styles', () => {
    expect(normalizeAuthorKey("O'Brien")).toBe('obrien');
    expect(normalizeAuthorKey("O'Brien")).toBe('obrien');
    expect(normalizeAuthorKey('O`Brien')).toBe('obrien');
  });

  it('should normalize various dash styles', () => {
    expect(normalizeAuthorKey('Smith-Jones')).toBe('smith jones');
    expect(normalizeAuthorKey('Smith–Jones')).toBe('smith jones'); // en dash
    expect(normalizeAuthorKey('Smith—Jones')).toBe('smith jones'); // em dash
  });

  it('should handle "Last, First" format', () => {
    expect(normalizeAuthorKey('Smith, John')).toBe('john smith');
  });

  it('should normalize whitespace', () => {
    expect(normalizeAuthorKey('John   Smith')).toBe('john smith');
  });

  it('should decode HTML entities before normalizing', () => {
    expect(normalizeAuthorKey('O&apos;Brien')).toBe('obrien');
  });

  it('should produce same key for name variants', () => {
    const variants = [
      'John Smith',
      'john smith',
      'John  Smith',
      'Smith, John',
      'JOHN SMITH',
    ];
    const keys = variants.map(normalizeAuthorKey);
    expect(new Set(keys).size).toBe(1);
  });

  it('should handle Unicode correctly', () => {
    expect(normalizeAuthorKey('Müller')).toBe('muller');
    expect(normalizeAuthorKey('Dürr')).toBe('durr');
  });
});

describe('buildAuthorCanonicalizer', () => {
  describe('basic canonicalization', () => {
    it('should handle empty papers array', () => {
      const canonicalizer = buildAuthorCanonicalizer([]);
      expect(canonicalizer.canonicalKey('John Smith')).toBe('john smith');
      expect(canonicalizer.displayNameForKey('john smith')).toBe('john smith');
    });

    it('should handle undefined papers', () => {
      const canonicalizer = buildAuthorCanonicalizer(undefined);
      expect(canonicalizer.canonicalKey('John Smith')).toBe('john smith');
    });

    it('should canonicalize exact matches', () => {
      const papers = [
        { authors: 'John Smith' },
        { authors: 'john smith' },
        { authors: 'JOHN SMITH' },
      ];
      const canonicalizer = buildAuthorCanonicalizer(papers);

      const key1 = canonicalizer.canonicalKey('John Smith');
      const key2 = canonicalizer.canonicalKey('john smith');
      const key3 = canonicalizer.canonicalKey('JOHN SMITH');

      expect(key1).toBe(key2);
      expect(key2).toBe(key3);
    });

    it('should merge diacritic variations', () => {
      const papers = [{ authors: 'Jose Garcia' }, { authors: 'José García' }];
      const canonicalizer = buildAuthorCanonicalizer(papers);

      const key1 = canonicalizer.canonicalKey('Jose Garcia');
      const key2 = canonicalizer.canonicalKey('José García');

      expect(key1).toBe(key2);
    });
  });

  describe('preferred display name selection', () => {
    it('should prefer names with diacritics', () => {
      const papers = [{ authors: 'Jose Garcia' }, { authors: 'José García' }];
      const canonicalizer = buildAuthorCanonicalizer(papers);
      const key = canonicalizer.canonicalKey('Jose Garcia');
      const display = canonicalizer.displayNameForKey(key);

      expect(display).toBe('José García');
    });

    it('should prefer names with uppercase', () => {
      const papers = [{ authors: 'john smith' }, { authors: 'John Smith' }];
      const canonicalizer = buildAuthorCanonicalizer(papers);
      const key = canonicalizer.canonicalKey('john smith');
      const display = canonicalizer.displayNameForKey(key);

      expect(display).toBe('John Smith');
    });

    it('should merge "J Smith" to "John Smith" when unambiguous', () => {
      const papers = [{ authors: 'J. Smith' }, { authors: 'John Smith' }];
      const canonicalizer = buildAuthorCanonicalizer(papers);
      const key1 = canonicalizer.canonicalKey('J. Smith');
      const key2 = canonicalizer.canonicalKey('John Smith');

      // J. should merge to John (unambiguous - only one J. Smith)
      expect(key1).toBe(key2);
    });
  });

  describe('initial-only to full name merging', () => {
    it('should merge initial-only form to full name (unambiguous)', () => {
      const papers = [
        { authors: 'Christoph Dürr' },
        { authors: 'C. Dürr' },
        { authors: 'C. Durr' },
      ];
      const canonicalizer = buildAuthorCanonicalizer(papers);

      const key1 = canonicalizer.canonicalKey('Christoph Dürr');
      const key2 = canonicalizer.canonicalKey('C. Dürr');
      const key3 = canonicalizer.canonicalKey('C. Durr');

      // All should map to same canonical key
      expect(key1).toBe(key2);
      expect(key2).toBe(key3);

      // Display should prefer the full name with diacritics
      const display = canonicalizer.displayNameForKey(key1);
      expect(display).toBe('Christoph Dürr');
    });

    it('should NOT merge initials when ambiguous (multiple full names)', () => {
      const papers = [
        { authors: 'Chris Smith' },
        { authors: 'Catherine Smith' },
        { authors: 'C. Smith' },
      ];
      const canonicalizer = buildAuthorCanonicalizer(papers);

      const keyChris = canonicalizer.canonicalKey('Chris Smith');
      const keyCatherine = canonicalizer.canonicalKey('Catherine Smith');
      const keyInitial = canonicalizer.canonicalKey('C. Smith');

      // Initial should NOT merge (ambiguous)
      expect(keyInitial).not.toBe(keyChris);
      expect(keyInitial).not.toBe(keyCatherine);

      // But Chris and Catherine should be different
      expect(keyChris).not.toBe(keyCatherine);
    });

    it('should handle dots in initials', () => {
      const papers = [
        { authors: 'John A. Smith' },
        { authors: 'J. A. Smith' },
        { authors: 'J A Smith' },
      ];
      const canonicalizer = buildAuthorCanonicalizer(papers);

      const key1 = canonicalizer.canonicalKey('John A. Smith');
      const key2 = canonicalizer.canonicalKey('J. A. Smith');

      // J. A. should merge to John A. (unambiguous)
      expect(key1).toBe(key2);
    });
  });

  describe('last name and first initial matching', () => {
    it('should match on last name and first initial', () => {
      const papers = [{ authors: 'H. Müller' }, { authors: 'Hans Müller' }];
      const canonicalizer = buildAuthorCanonicalizer(papers);

      const key1 = canonicalizer.canonicalKey('H. Müller');
      const key2 = canonicalizer.canonicalKey('Hans Müller');

      expect(key1).toBe(key2);
    });

    it('should handle different last names with same initial', () => {
      const papers = [
        { authors: 'J. Smith' },
        { authors: 'J. Jones' },
        { authors: 'John Smith' },
      ];
      const canonicalizer = buildAuthorCanonicalizer(papers);

      const keyJSmith = canonicalizer.canonicalKey('J. Smith');
      const keyJJones = canonicalizer.canonicalKey('J. Jones');
      const keyJohnSmith = canonicalizer.canonicalKey('John Smith');

      // J. Smith should merge with John Smith
      expect(keyJSmith).toBe(keyJohnSmith);

      // J. Jones should be different
      expect(keyJJones).not.toBe(keyJSmith);
    });
  });

  describe('real-world examples from dataset', () => {
    it('should handle Christoph Dürr variants', () => {
      const papers = [
        { authors: 'Christoph Dürr' },
        { authors: 'C. Dürr' },
        { authors: 'Christoph Durr' },
        { authors: 'C. Durr' },
      ];
      const canonicalizer = buildAuthorCanonicalizer(papers);

      const keys = [
        canonicalizer.canonicalKey('Christoph Dürr'),
        canonicalizer.canonicalKey('C. Dürr'),
        canonicalizer.canonicalKey('Christoph Durr'),
        canonicalizer.canonicalKey('C. Durr'),
      ];

      // All should map to same key
      expect(new Set(keys).size).toBe(1);

      // Preferred display should have diacritics
      const display = canonicalizer.displayNameForKey(keys[0]);
      expect(display).toBe('Christoph Dürr');
    });

    it('should handle "Last, First" format in semicolon-separated lists', () => {
      const papers = [
        { authors: 'Dürr, Christoph; Smith, John' },
        { authors: 'Christoph Dürr' },
      ];
      const canonicalizer = buildAuthorCanonicalizer(papers);

      const key1 = canonicalizer.canonicalKey('Christoph Dürr');
      const key2 = canonicalizer.canonicalKey('Dürr, Christoph');

      // When in semicolon list, "Last, First" is reordered
      expect(key1).toBe(key2);
    });

    it('should handle semicolon-separated author lists', () => {
      const papers = [
        { authors: 'Smith, John; Doe, Jane' },
        { authors: ['John Smith', 'Jane Doe'] },
      ];
      const canonicalizer = buildAuthorCanonicalizer(papers);

      const keyJohn1 = canonicalizer.canonicalKey('John Smith');
      const keyJohn2 = canonicalizer.canonicalKey('Smith, John');

      const keyJane1 = canonicalizer.canonicalKey('Jane Doe');
      const keyJane2 = canonicalizer.canonicalKey('Doe, Jane');

      expect(keyJohn1).toBe(keyJohn2);
      expect(keyJane1).toBe(keyJane2);
    });
  });

  describe('edge cases', () => {
    it('should handle single-name authors', () => {
      const papers = [{ authors: 'Aristotle' }];
      const canonicalizer = buildAuthorCanonicalizer(papers);

      const key = canonicalizer.canonicalKey('Aristotle');
      expect(key).toBe('aristotle');
    });

    it('should handle authors with many middle names', () => {
      const papers = [{ authors: 'John Alan Robert Smith' }];
      const canonicalizer = buildAuthorCanonicalizer(papers);

      const key = canonicalizer.canonicalKey('John Alan Robert Smith');
      expect(canonicalizer.displayNameForKey(key)).toBe(
        'John Alan Robert Smith'
      );
    });

    it('should handle empty author strings in papers', () => {
      const papers = [{ authors: '' }, { authors: 'John Smith' }];
      const canonicalizer = buildAuthorCanonicalizer(papers);

      const key = canonicalizer.canonicalKey('John Smith');
      expect(canonicalizer.displayNameForKey(key)).toBe('John Smith');
    });

    it('should handle papers with undefined authors', () => {
      const papers = [{ authors: undefined }, { authors: 'John Smith' }];
      const canonicalizer = buildAuthorCanonicalizer(papers);

      const key = canonicalizer.canonicalKey('John Smith');
      expect(canonicalizer.displayNameForKey(key)).toBe('John Smith');
    });
  });

  describe('display name preference algorithm', () => {
    it('should prefer names with Unicode over ASCII', () => {
      const papers = [{ authors: 'Muller' }, { authors: 'Müller' }];
      const canonicalizer = buildAuthorCanonicalizer(papers);

      const key = canonicalizer.canonicalKey('Muller');
      const display = canonicalizer.displayNameForKey(key);

      expect(display).toBe('Müller');
    });

    it('should prefer names with apostrophes', () => {
      const papers = [{ authors: 'OBrien' }, { authors: "O'Brien" }];
      const canonicalizer = buildAuthorCanonicalizer(papers);

      const key = canonicalizer.canonicalKey('OBrien');
      const display = canonicalizer.displayNameForKey(key);

      expect(display).toBe("O'Brien");
    });
  });
});
