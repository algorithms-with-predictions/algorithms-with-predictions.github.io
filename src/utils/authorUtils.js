const decodeHtmlEntities = value => {
  if (typeof value !== 'string') return '';

  // Minimal decode for entities we actually see in the dataset.
  const replacements = {
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

const normalizeWhitespace = value => String(value).replace(/\s+/g, ' ').trim();

const stripDiacritics = value =>
  value
    .normalize('NFKD')
    // Remove combining marks
    .replace(/[\u0300-\u036f]/g, '');

const normalizeNameToken = token => {
  const decoded = decodeHtmlEntities(token);
  const ascii = stripDiacritics(decoded);
  return ascii
    .toLowerCase()
    .replace(/[’'`´]/g, '')
    .replace(/[.,]/g, ' ')
    .replace(/[-‐‑‒–—]/g, ' ')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const reorderLastFirst = maybeLastFirst => {
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
 * - Supports string or array inputs
 * - Supports semicolon-separated lists (often used with "Last, First" formatting)
 * - Converts individual "Last, First" author segments to "First Last"
 */
export const parseAuthors = authors => {
  if (!authors) return [];

  const parseOne = value => {
    const decoded = decodeHtmlEntities(String(value));
    const trimmed = normalizeWhitespace(decoded);
    if (!trimmed) return [];

    // If authors are encoded as `Last, First; Last, First`, prefer `;` as list separator.
    let parts;
    if (trimmed.includes(';')) {
      parts = trimmed.split(/\s*;\s*/g);
    } else if (!trimmed.includes(',') && /\sand\s/i.test(trimmed)) {
      // Only split on "and" when there are no commas; avoids breaking "A, B, C".
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
 * Stable, merge-oriented key for an author name.
 * Merges diacritics, HTML entity differences, punctuation and whitespace variants.
 */
export const normalizeAuthorKey = authorName => {
  const display = reorderLastFirst(authorName);
  return normalizeNameToken(display);
};

const getNameMeta = authorDisplayName => {
  const display = normalizeWhitespace(decodeHtmlEntities(authorDisplayName));

  // Remove dots for initial detection, but keep original display for UI.
  const noDots = display.replace(/\./g, '');
  const tokens = noDots.split(' ').filter(Boolean);

  const firstToken = tokens[0] || '';
  const lastToken = tokens.length > 0 ? tokens[tokens.length - 1] : '';
  const firstInitial = firstToken ? firstToken[0].toLowerCase() : '';

  const isInitialOnly =
    tokens.length >= 2 && firstToken.length === 1 && /[a-z]/i.test(firstToken);

  return {
    display,
    firstInitial,
    lastNameKey: normalizeNameToken(lastToken),
    isInitialOnly,
  };
};

const namePreferenceScore = name => {
  const s = String(name);
  let score = 0;
  if (/[A-Z]/.test(s)) score += 1;
  if (/[’']/.test(s)) score += 1;
  // Prefer names that preserve diacritics/Unicode characters when available.
  // (Avoid regex ranges that trigger editor diagnostics.)
  for (let i = 0; i < s.length; i++) {
    if (s.charCodeAt(i) > 127) {
      score += 2;
      break;
    }
  }
  score += Math.min(2, s.length / 40);
  return score;
};

const pickPreferredDisplayName = (current, candidate) => {
  if (!current) return candidate;
  return namePreferenceScore(candidate) > namePreferenceScore(current)
    ? candidate
    : current;
};

/**
 * Build a canonicalizer for author names.
 * - Always merges exact `normalizeAuthorKey` matches.
 * - Additionally merges initial-only forms (e.g. "C. Durr") into a unique full-name
 *   within the same (lastName, firstInitial) bucket (only if unambiguous).
 */
export const buildAuthorCanonicalizer = papers => {
  const preferredNameByKey = new Map();

  // lastNameKey -> firstInitial -> Set(fullNameKeys)
  const fullNameBuckets = new Map();

  // initialOnlyKey -> { lastNameKey, firstInitial }
  const initialOnlyMetaByKey = new Map();

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
      if (!meta.lastNameKey || !meta.firstInitial) continue;

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
      const byInitial = fullNameBuckets.get(meta.lastNameKey);
      if (!byInitial.has(meta.firstInitial)) {
        byInitial.set(meta.firstInitial, new Set());
      }
      byInitial.get(meta.firstInitial).add(key);
    }
  }

  const initialOnlyToFullKey = new Map();
  for (const [initialKey, meta] of initialOnlyMetaByKey.entries()) {
    const candidates =
      fullNameBuckets.get(meta.lastNameKey)?.get(meta.firstInitial) || null;
    if (candidates && candidates.size === 1) {
      initialOnlyToFullKey.set(initialKey, Array.from(candidates)[0]);
    }
  }

  const canonicalKey = authorDisplayName => {
    const key = normalizeAuthorKey(authorDisplayName);
    return initialOnlyToFullKey.get(key) || key;
  };

  const displayNameForKey = key => preferredNameByKey.get(key) || key;

  return {
    canonicalKey,
    displayNameForKey,
  };
};
