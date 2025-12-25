/**
 * Represents a publication venue for a research paper
 */
export interface Publication {
  /** Publication venue name (e.g., "ICML", "NeurIPS") */
  name: string;
  /** Publication year */
  year?: number;
  /** Publication month (1-12) */
  month?: number;
  /** Publication day (1-31) */
  day?: number;
  /** URL to the publication */
  url?: string;
  /** BibTeX citation entry */
  bibtex?: string;
  /** DBLP key for the publication */
  dblp_key?: string;
}

/**
 * Represents a research paper in the ALPS database
 *
 * Note: All fields are optional to handle incomplete/malformed data gracefully.
 * Abstracts are stripped during build time to reduce bundle size.
 */
export interface Paper {
  /** Paper title */
  title?: string;
  /** Author names (can be a single string or array of author names) */
  authors?: string | string[];
  /** Category labels for filtering and organization */
  labels?: string[];
  /** List of publications/venues where this paper appeared */
  publications?: Publication[];
}

/**
 * Extended Paper interface that includes abstract field
 * (used only in source YAML files, stripped from runtime data)
 */
export interface PaperWithAbstract extends Paper {
  /** Paper abstract (only available in source YAML, not in runtime data) */
  abstract?: string;
}
