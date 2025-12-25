/**
 * Type labels - main categories for papers
 * These labels are displayed with special styling
 */
export const TYPE_LABELS = [
  'dynamic / data structure',
  'online',
  'running time',
  'approximation',
  'streaming',
  'game theory / mechanism design',
  'differential privacy',
  'survey',
] as const;

/**
 * Special label for prior/related work papers
 */
export const PRIOR_LABEL = 'prior / related work' as const;

/**
 * All special labels (type labels + prior label)
 * These labels are treated differently in filtering and display
 */
export const SPECIAL_LABELS = [...TYPE_LABELS, PRIOR_LABEL] as const;

/**
 * Configuration for author collaboration graph visualization
 */
export const GRAPH_CONFIG = {
  /** Force simulation charge strength (negative = repulsion) */
  CHARGE_STRENGTH: -150,
  /** Base distance for links between nodes */
  LINK_DISTANCE_BASE: 50,
  /** Factor for calculating link distance based on collaboration count */
  LINK_DISTANCE_FACTOR: 20,
  /** Minimum edge width for visualization */
  EDGE_MIN_WIDTH: 1,
  /** Maximum edge width for visualization */
  EDGE_MAX_WIDTH: 8,
} as const;

// Type exports for better type inference
export type TypeLabel = (typeof TYPE_LABELS)[number];
export type SpecialLabel = (typeof SPECIAL_LABELS)[number];
