/**
 * Author collaboration graph utilities for react-force-graph visualization
 */

import { buildAuthorCanonicalizer, parseAuthors } from './authorUtils';
import type { Paper } from '@/types';

/**
 * Graph node representing an author
 */
export interface AuthorNode {
  /** Unique node identifier */
  id: number;
  /** Display name of the author */
  name: string;
  /** Number of papers this author has published */
  paperCount: number;
  /** Internal canonical key (not for display) */
  _key: string;
  /** d3-force simulation properties */
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number;
  fy?: number;
  index?: number;
}

/**
 * Graph link representing collaboration between two authors
 */
export interface CollaborationLink {
  /** Source node ID or node object (d3-force transforms IDs to objects during simulation) */
  source: number | AuthorNode;
  /** Target node ID or node object (d3-force transforms IDs to objects during simulation) */
  target: number | AuthorNode;
  /** Number of papers they collaborated on */
  value: number;
}

/**
 * Author collaboration graph data
 */
export interface AuthorGraph {
  /** Array of author nodes */
  nodes: AuthorNode[];
  /** Array of collaboration edges */
  links: CollaborationLink[];
  /** Maximum collaboration count (for normalization) */
  maxCollaboration: number;
}

/**
 * Build author collaboration graph from paper data
 *
 * Creates a network graph where:
 * - Nodes represent authors
 * - Links represent co-authorship (authors who published together)
 * - Link weight represents number of collaborations
 *
 * Features:
 * - Uses author canonicalization to merge name variants
 * - Deduplicates authors within same paper
 * - Tracks collaboration frequency
 *
 * @param papers - Array of paper objects
 * @returns Graph data compatible with react-force-graph
 */
export const buildAuthorGraph = (papers: Paper[]): AuthorGraph => {
  const canonicalizer = buildAuthorCanonicalizer(papers);

  // Collect all unique authors and build author index
  const authorKeySet = new Set<string>();
  const authorKeyToPapers = new Map<string, Paper[]>(); // Track which papers each canonical author appears in

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
      authorKeyToPapers.get(authorKey)!.push(paper);
    });
  });

  // Create nodes array with id, name, and paper count
  const authorKeysArray = Array.from(authorKeySet);
  const nodes: AuthorNode[] = authorKeysArray.map((authorKey, index) => ({
    id: index,
    name: canonicalizer.displayNameForKey(authorKey),
    paperCount: authorKeyToPapers.get(authorKey)!.length,
    _key: authorKey,
  }));

  // Create author name to node id mapping
  const authorKeyToId = new Map<string, number>();
  nodes.forEach(node => {
    authorKeyToId.set(node._key, node.id);
  });

  // Build collaboration edges
  // Use a map to track collaboration counts between author pairs
  const collaborationMap = new Map<string, number>(); // key: "author1|author2" (sorted), value: count

  papers.forEach(paper => {
    const authors = parseAuthors(paper.authors);
    const canonicalKeys = Array.from(
      new Set(authors.map(a => canonicalizer.canonicalKey(a)))
    );

    // Create edges between all pairs of authors on the same paper
    for (let i = 0; i < canonicalKeys.length; i++) {
      for (let j = i + 1; j < canonicalKeys.length; j++) {
        const authorKey1 = canonicalKeys[i]!;
        const authorKey2 = canonicalKeys[j]!;

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
  const links: CollaborationLink[] = Array.from(collaborationMap.entries()).map(
    ([key, value]) => {
      const [authorKey1, authorKey2] = key.split('|');
      return {
        source: authorKeyToId.get(authorKey1!)!,
        target: authorKeyToId.get(authorKey2!)!,
        value: value, // number of papers they collaborated on
      };
    }
  );

  // Calculate max collaboration count for normalization
  const maxCollaboration =
    links.length > 0 ? Math.max(...links.map(link => link.value)) : 1;

  return {
    nodes,
    links,
    maxCollaboration,
  };
};
