export const TYPE_LABELS = [
  'dynamic / data structure',
  'online',
  'running time',
  'approximation',
  'streaming',
  'game theory / mechanism design',
  'differential privacy',
  'survey',
];

export const PRIOR_LABEL = 'prior / related work';

export const SPECIAL_LABELS = [...TYPE_LABELS, PRIOR_LABEL];

export const GRAPH_CONFIG = {
  CHARGE_STRENGTH: -150,
  LINK_DISTANCE_BASE: 50,
  LINK_DISTANCE_FACTOR: 20,
  EDGE_MIN_WIDTH: 1,
  EDGE_MAX_WIDTH: 8,
};
