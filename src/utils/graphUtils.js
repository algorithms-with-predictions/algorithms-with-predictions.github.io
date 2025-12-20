import { buildAuthorCanonicalizer, parseAuthors } from './authorUtils';

/**
 * Build author collaboration graph from paper data
 * @param {Array} papers - Array of paper objects
 * @returns {Object} - Graph data with nodes and links for react-force-graph
 */
export const buildAuthorGraph = papers => {
  const canonicalizer = buildAuthorCanonicalizer(papers);

  // Collect all unique authors and build author index
  const authorKeySet = new Set();
  const authorKeyToPapers = new Map(); // Track which papers each canonical author appears in

  papers.forEach(paper => {
    const authors = parseAuthors(paper.authors);
    const canonicalKeys = Array.from(
      new Set(authors.map(a => canonicalizer.canonicalKey(a)))
    );

    canonicalKeys.forEach(authorKey => {
      authorKeySet.add(authorKey);
      if (!authorKeyToPapers.has(authorKey)) {
        authorKeyToPapers.set(authorKey, []);
      }
      authorKeyToPapers.get(authorKey).push(paper);
    });
  });

  // Create nodes array with id, name, and paper count
  const authorKeysArray = Array.from(authorKeySet);
  const nodes = authorKeysArray.map((authorKey, index) => ({
    id: index,
    name: canonicalizer.displayNameForKey(authorKey),
    paperCount: authorKeyToPapers.get(authorKey).length,
    _key: authorKey,
  }));

  // Create author name to node id mapping
  const authorKeyToId = new Map();
  nodes.forEach(node => {
    authorKeyToId.set(node._key, node.id);
  });

  // Build collaboration edges
  // Use a map to track collaboration counts between author pairs
  const collaborationMap = new Map(); // key: "author1|author2" (sorted), value: count

  papers.forEach(paper => {
    const authors = parseAuthors(paper.authors);
    const canonicalKeys = Array.from(
      new Set(authors.map(a => canonicalizer.canonicalKey(a)))
    );

    // Create edges between all pairs of authors on the same paper
    for (let i = 0; i < canonicalKeys.length; i++) {
      for (let j = i + 1; j < canonicalKeys.length; j++) {
        const authorKey1 = canonicalKeys[i];
        const authorKey2 = canonicalKeys[j];

        // Create a consistent key (sorted order to avoid duplicate edges)
        const key =
          authorKey1 < authorKey2
            ? `${authorKey1}|${authorKey2}`
            : `${authorKey2}|${authorKey1}`;

        collaborationMap.set(key, (collaborationMap.get(key) || 0) + 1);
      }
    }
  });

  // Create links array from collaboration map
  const links = Array.from(collaborationMap.entries()).map(([key, value]) => {
    const [authorKey1, authorKey2] = key.split('|');
    return {
      source: authorKeyToId.get(authorKey1),
      target: authorKeyToId.get(authorKey2),
      value: value, // number of papers they collaborated on
    };
  });

  // Calculate max collaboration count for normalization
  const maxCollaboration =
    links.length > 0 ? Math.max(...links.map(link => link.value)) : 1;

  return {
    nodes,
    links,
    maxCollaboration,
  };
};
