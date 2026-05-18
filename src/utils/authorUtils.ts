/**
 * Author name normalization and canonicalization utilities
 *
 * This module handles complex author name variations found in real research paper datasets:
 *
 * ## Problems Solved:
 *
 * 1. **HTML Entity Encoding**: Some sources encode names with entities
 *    - Example: "O&apos;Brien" vs "O'Brien"
 *
 * 2. **Diacritics and Unicode**: Same author with/without diacritics
 *    - Example: "José García" vs "Jose Garcia" (same person)
 *    - Example: "François Dürr" vs "Francois Durr"
 *
 * 3. **Format Variations**: "Last, First" vs "First Last"
 *    - Example: "Smith, John" vs "John Smith"
 *    - Particularly common in semicolon-separated lists: "Dürr, C.; Smith, J."
 *
 * 4. **Initial-only vs Full Names**: Merging abbreviated forms
 *    - Example: "C. Dürr" + "Christoph Dürr" → same person
 *    - Only merges when unambiguous (one full name match per initial+lastName)
 *
 * 5. **Whitespace and Punctuation**: Inconsistent spacing and punctuation
 *    - Example: "John   Smith" vs "John Smith"
 *    - Example: "O'Brien" vs "O'Brien" vs "O`Brien" (different apostrophe styles)
 *
 * ## Real Dataset Examples:
 * From the ALPS papers.json (359 papers analyzed):
 * - "Christoph Dürr" appears as: "C. Dürr", "Christoph Durr", "Dürr, C."
 * - Various apostrophe encodings: &apos;, &#39;, ', '
 * - Mixed formats in same file due to different publication sources
 */

import type { Paper } from '@/types';

/**
 * Decode common HTML entities found in author names
 */
const decodeHtmlEntities = (value: string): string => {
  if (typeof value !== 'string') return '';

  // Minimal decode for entities we actually see in the dataset
  const replacements: Record<string, string> = {
    '&apos;': "'",
    '&#39;': "'",
    '&quot;': '"',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
  };

  let out = value;
  for (const [entity, decoded] of Object.entries(replacements)) {
    out = out.split(entity).join(decoded);
  }
  return out;
};

/**
 * Normalize whitespace to single spaces
 */
const normalizeWhitespace = (value: string): string =>
  String(value).replace(/\s+/g, ' ').trim();

/**
 * Strip diacritics from characters (e.g., é → e)
 */
const stripDiacritics = (value: string): string =>
  value
    .normalize('NFKD')
    // Remove combining marks
    .replace(/[\u0300-\u036f]/g, '');

/**
 * Normalize a name token for comparison/merging
 * Removes diacritics, punctuation, and normalizes case
 */
const normalizeNameToken = (token: string): string => {
  const decoded = decodeHtmlEntities(token);
  const ascii = stripDiacritics(decoded);
  return ascii
    .toLowerCase()
    .replace(/[''`´]/g, '')
    .replace(/[.,]/g, ' ')
    .replace(/[-‐‑‒–—]/g, ' ')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Reorder "Last, First" format to "First Last"
 */
const reorderLastFirst = (maybeLastFirst: string): string => {
  const s = normalizeWhitespace(decodeHtmlEntities(maybeLastFirst));
  if (!s.includes(',')) return s;

  const [last, ...rest] = s.split(',');
  const first = rest.join(',').trim();
  const lastTrimmed = (last || '').trim();
  if (!first || !lastTrimmed) return s;

  return normalizeWhitespace(`${first} ${lastTrimmed}`);
};

/**
 * Parse authors from paper data
 *
 * Supports:
 * - String or array inputs
 * - Semicolon-separated lists (often used with "Last, First" formatting)
 * - Converts individual "Last, First" author segments to "First Last"
 *
 * @param authors - Authors as string, array, or undefined
 * @returns Array of normalized author names
 */
export const parseAuthors = (
  authors: string | string[] | undefined
): string[] => {
  if (!authors) return [];

  const parseOne = (value: string): string[] => {
    const decoded = decodeHtmlEntities(String(value));
    const trimmed = normalizeWhitespace(decoded);
    if (!trimmed) return [];

    // If authors are encoded as `Last, First; Last, First`, prefer `;` as list separator
    let parts: string[];
    if (trimmed.includes(';')) {
      parts = trimmed.split(/\s*;\s*/g);
    } else if (!trimmed.includes(',') && /\sand\s/i.test(trimmed)) {
      // Only split on "and" when there are no commas; avoids breaking "A, B, C"
      parts = trimmed.split(/\s+and\s+/i);
    } else {
      parts = trimmed.split(/\s*,\s*/g);
    }

    return parts.map(reorderLastFirst).map(normalizeWhitespace).filter(Boolean);
  };

  if (typeof authors === 'string') return parseOne(authors);
  if (Array.isArray(authors)) return authors.flatMap(parseOne);
  return [];
};

/**
 * Stable, merge-oriented key for an author name
 * Merges diacritics, HTML entity differences, punctuation and whitespace variants
 *
 * @param authorName - Display name of author
 * @returns Normalized key for comparison
 */
export const normalizeAuthorKey = (authorName: string): string => {
  const display = reorderLastFirst(authorName);
  return normalizeNameToken(display);
};

/**
 * Metadata extracted from an author name
 */
interface NameMeta {
  display: string;
  firstInitial: string;
  lastNameKey: string;
  isInitialOnly: boolean;
}

/**
 * Extract metadata from an author display name
 */
const getNameMeta = (authorDisplayName: string): NameMeta => {
  const display = normalizeWhitespace(decodeHtmlEntities(authorDisplayName));

  // Remove dots for initial detection, but keep original display for UI
  const noDots = display.replace(/\./g, '');
  const tokens = noDots.split(' ').filter(Boolean);

  const firstToken = tokens[0] || '';
  const lastToken = tokens.length > 0 ? tokens[tokens.length - 1] || '' : '';
  const firstInitial = firstToken ? firstToken[0]!.toLowerCase() : '';

  const isInitialOnly =
    tokens.length >= 2 && firstToken.length === 1 && /[a-z]/i.test(firstToken);

  return {
    display,
    firstInitial,
    lastNameKey: normalizeNameToken(lastToken),
    isInitialOnly,
  };
};

/**
 * Calculate preference score for a name variant
 * Higher score = more detailed/preferred variant
 */
const namePreferenceScore = (name: string): number => {
  const s = String(name);
  let score = 0;
  if (/[A-Z]/.test(s)) score += 1;
  if (/['']/.test(s)) score += 1;
  // Prefer names that preserve diacritics/Unicode characters when available
  for (let i = 0; i < s.length; i++) {
    if (s.charCodeAt(i) > 127) {
      score += 2;
      break;
    }
  }
  score += Math.min(2, s.length / 40);
  return score;
};

/**
 * Pick the preferred display name between two variants
 */
const pickPreferredDisplayName = (
  current: string | undefined,
  candidate: string
): string => {
  if (!current) return candidate;
  return namePreferenceScore(candidate) > namePreferenceScore(current)
    ? candidate
    : current;
};

/**
 * Author canonicalizer result
 */
export interface AuthorCanonicalizer {
  /** Get canonical key for an author name */
  canonicalKey: (authorDisplayName: string) => string;
  /** Get preferred display name for a canonical key */
  displayNameForKey: (key: string) => string;
}

/**
 * Build a canonicalizer for author names
 *
 * ## Algorithm Overview:
 *
 * This function creates a mapping system that merges author name variations into
 * canonical forms, enabling accurate author statistics and graph visualization.
 *
 * ## Two-Phase Merging Strategy:
 *
 * ### Phase 1: Exact Normalization Match
 * All names that normalize to the same key (ignoring case, diacritics, punctuation)
 * are merged automatically.
 *
 * Examples:
 * - "John Smith", "john smith", "JOHN SMITH" → all map to "john smith" key
 * - "José García", "Jose Garcia" → both map to "jose garcia" key
 *
 * ### Phase 2: Initial-Only to Full Name Merging
 * Initial-only forms (e.g., "C. Dürr") are merged with full names when:
 * 1. They share the same last name (normalized)
 * 2. They share the same first initial
 * 3. There is EXACTLY ONE full name match (unambiguous)
 *
 * Examples (unambiguous - merges):
 * - "C. Dürr" + "Christoph Dürr" → merged (only one "C" last name "Dürr")
 * - "J. Smith" + "John Smith" → merged (only one "J" last name "Smith")
 *
 * Examples (ambiguous - NOT merged):
 * - "C. Smith" + "Chris Smith" + "Catherine Smith" → NOT merged (2 matches)
 * - "J. Doe" with no full name → stays as "J. Doe" (no match)
 *
 * ## Display Name Preference:
 * When multiple variants exist, prefers names with:
 * 1. Unicode/diacritics (highest priority)
 * 2. Proper capitalization
 * 3. Apostrophes preserved
 * 4. Longer, more detailed forms
 *
 * Example preference order:
 * "Christoph Dürr" > "Christoph Durr" > "christoph dürr" > "c durr"
 *
 * ## Real-World Example:
 * Input papers with these author strings:
 * - Paper 1: "Dürr, Christoph; Koutsoupias, E."
 * - Paper 2: "C. Dürr"
 * - Paper 3: "Christoph Durr"
 * - Paper 4: "E. Koutsoupias; C. Durr"
 *
 * Output mappings:
 * - All "Christoph Dürr" variants → canonical key "christoph durr"
 *   Display: "Christoph Dürr" (has diacritics)
 * - "E. Koutsoupias" → merges if "Elias Koutsoupias" exists elsewhere
 *
 * @param papers - Array of papers to analyze
 * @returns Canonicalizer with methods to normalize and display author names
 */
export const buildAuthorCanonicalizer = (
  papers: Paper[] | undefined
): AuthorCanonicalizer => {
  const preferredNameByKey = new Map<string, string>();

  // lastNameKey -> firstInitial -> Set(fullNameKeys)
  const fullNameBuckets = new Map<string, Map<string, Set<string>>>();

  // initialOnlyKey -> { lastNameKey, firstInitial }
  const initialOnlyMetaByKey = new Map<
    string,
    { lastNameKey: string; firstInitial: string }
  >();

  for (const paper of papers || []) {
    const authors = parseAuthors(paper?.authors);
    for (const author of authors) {
      const display = reorderLastFirst(author);
      const key = normalizeAuthorKey(display);
      preferredNameByKey.set(
        key,
        pickPreferredDisplayName(preferredNameByKey.get(key), display)
      );

      const meta = getNameMeta(display);
      if (!meta.lastNameKey || !meta.firstInitial || !meta.display) continue;

      if (meta.isInitialOnly) {
        if (!initialOnlyMetaByKey.has(key)) {
          initialOnlyMetaByKey.set(key, {
            lastNameKey: meta.lastNameKey,
            firstInitial: meta.firstInitial,
          });
        }
        continue;
      }

      if (!fullNameBuckets.has(meta.lastNameKey)) {
        fullNameBuckets.set(meta.lastNameKey, new Map());
      }
      const byInitial = fullNameBuckets.get(meta.lastNameKey)!;
      if (!byInitial.has(meta.firstInitial)) {
        byInitial.set(meta.firstInitial, new Set());
      }
      byInitial.get(meta.firstInitial)!.add(key);
    }
  }

  const initialOnlyToFullKey = new Map<string, string>();
  for (const [initialKey, meta] of initialOnlyMetaByKey.entries()) {
    const candidates =
      fullNameBuckets.get(meta.lastNameKey)?.get(meta.firstInitial) || null;
    if (candidates && candidates.size === 1) {
      initialOnlyToFullKey.set(initialKey, Array.from(candidates)[0]!);
    }
  }

  const canonicalKey = (authorDisplayName: string): string => {
    const key = normalizeAuthorKey(authorDisplayName);
    return initialOnlyToFullKey.get(key) || key;
  };

  const displayNameForKey = (key: string): string =>
    preferredNameByKey.get(key) || key;

  return {
    canonicalKey,
    displayNameForKey,
  };
};
