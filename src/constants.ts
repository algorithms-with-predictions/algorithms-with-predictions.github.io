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
 *
 * These constants control the D3 force-directed graph layout used to visualize
 * author collaboration networks in the AuthorGraphPage.
 *
 * ## D3 Force Simulation Parameters:
 * The graph uses D3's force simulation to position nodes and links.
 * See: https://d3js.org/d3-force
 *
 * ## Tuning Notes:
 * These values were empirically tuned for the ALPS dataset (359 papers, ~200-300 authors):
 * - Balances readability with minimal overlap
 * - Allows clusters to form naturally around frequent collaborators
 * - Provides smooth animations during interactions
 *
 * ## Parameter Explanations:
 *
 * **CHARGE_STRENGTH**: Controls node repulsion (negative = repel, positive = attract)
 * - Value: -150
 * - Higher magnitude = more spacing between nodes
 * - Lower magnitude = tighter clusters
 * - Typical range: -50 to -500
 * - Why -150: Provides good spacing for ~300 nodes without excessive spread
 *
 * **LINK_DISTANCE_BASE**: Baseline rest length for collaboration links
 * - Value: 50 pixels
 * - Represents the "natural" distance between collaborators
 * - Too high: Sparse graph, hard to see connections
 * - Too low: Nodes overlap, text unreadable
 * - Why 50: Works well with canvas size ~800-1200px wide
 *
 * **LINK_DISTANCE_FACTOR**: Multiplier for collaboration strength
 * - Value: 20
 * - Added distance per collaboration: distance = BASE + (collabCount * FACTOR)
 * - Example: 3 collaborations = 50 + (3 * 20) = 110 pixels apart
 * - Why 20: Prevents very frequent collaborators from being too close
 *
 * **EDGE_MIN_WIDTH**: Thinnest line for single collaboration
 * - Value: 1 pixel
 * - Ensures even single collaborations are visible
 *
 * **EDGE_MAX_WIDTH**: Thickest line for frequent collaborations
 * - Value: 8 pixels
 * - Caps the visual weight of edges
 * - Prevents very thick lines from dominating the visualization
 * - Width scales logarithmically based on collaboration count
 *
 * ## Example Behavior:
 * - Authors with 1 collaboration: 50px apart, 1px line
 * - Authors with 5 collaborations: 150px apart, ~3px line
 * - Authors with 10+ collaborations: 250px apart, 8px line (capped)
 *
 * ## Performance Considerations:
 * - CHARGE_STRENGTH has O(n²) performance impact (n = node count)
 * - Values below -200 may cause slow rendering with 300+ nodes
 * - Current settings maintain 30+ FPS on modern browsers
 */
export const GRAPH_CONFIG = {
  /** Node repulsion strength - more negative = more spread */
  CHARGE_STRENGTH: -300,
  /** Base distance between linked nodes */
  LINK_DISTANCE_BASE: 80,
  /** Additional distance per collaboration */
  LINK_DISTANCE_FACTOR: 15,
  /** Collision radius multiplier - prevents node overlap */
  COLLISION_RADIUS_MULTIPLIER: 2.5,
  /** Collision force strength (0-1) */
  COLLISION_STRENGTH: 0.8,
  /** Simulation warmup ticks for initial layout */
  WARMUP_TICKS: 200,
  /** Alpha decay rate - lower = longer simulation */
  ALPHA_DECAY: 0.01,
  /** Velocity decay - higher = more damping */
  VELOCITY_DECAY: 0.3,
  EDGE_MIN_WIDTH: 1,
  EDGE_MAX_WIDTH: 8,
} as const;

// Type exports for better type inference
export type TypeLabel = (typeof TYPE_LABELS)[number];
export type SpecialLabel = (typeof SPECIAL_LABELS)[number];
