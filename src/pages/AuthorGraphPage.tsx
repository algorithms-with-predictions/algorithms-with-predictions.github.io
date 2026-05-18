import {
  useMemo,
  useRef,
  useState,
  useCallback,
  useEffect,
  lazy,
  Suspense,
} from 'react';
import {
  Box,
  Typography,
  Skeleton,
  useTheme,
  CircularProgress,
} from '@mui/material';
import type { ForceGraphMethods } from 'react-force-graph-2d';
import { usePapersData } from '../hooks/usePapersData';
import { buildAuthorGraph } from '../utils/graphUtils';
import { useThemeMode } from '../contexts/ThemeContext';
import { GRAPH_CONFIG } from '../constants';
import type { AuthorNode, CollaborationLink } from '../utils/graphUtils';
import type { ForceLink, ForceManyBody } from 'd3-force';
import * as d3Force from 'd3-force';

// Code-split react-force-graph-2d (only loaded when AuthorGraphPage is visited)
// This library is large (~200KB) and only used on this page
const ForceGraph2D = lazy(() => import('../components/ForceGraphWrapper'));

/**
 * Author collaboration network visualization page
 */
const AuthorGraphPage: React.FC = () => {
  const { data, loading, error } = usePapersData();
  const theme = useTheme();
  const { isDark } = useThemeMode();
  const [selectedNode, setSelectedNode] = useState<AuthorNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<AuthorNode | null>(null);
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 800,
    height: typeof window !== 'undefined' ? window.innerHeight : 600,
  });
  const fgRef = useRef<
    ForceGraphMethods<AuthorNode, CollaborationLink> | undefined
  >(undefined);

  // Build graph data from papers
  const graphData = useMemo(() => {
    if (!data || data.length === 0) return null;
    return buildAuthorGraph(data);
  }, [data]);

  // Track if forces have been configured for this render cycle
  const forcesConfiguredRef = useRef(false);
  // Track if initial zoom has been done
  const initialZoomDoneRef = useRef(false);

  // Configure forces - called on first tick after mount/update
  const configureForces = useCallback(() => {
    const fg = fgRef.current;
    if (!fg || forcesConfiguredRef.current) return;

    forcesConfiguredRef.current = true;

    // Configure charge (repulsion) - stronger to spread nodes apart
    const chargeForce = fg.d3Force('charge') as
      | ForceManyBody<AuthorNode>
      | undefined;
    chargeForce?.strength(GRAPH_CONFIG.CHARGE_STRENGTH);

    // Configure link distance
    const linkForce = fg.d3Force('link') as
      | ForceLink<AuthorNode, CollaborationLink>
      | undefined;
    linkForce?.distance(
      (link: CollaborationLink) =>
        GRAPH_CONFIG.LINK_DISTANCE_BASE +
        (link.value || 1) * GRAPH_CONFIG.LINK_DISTANCE_FACTOR
    );

    // Add collision force to prevent node overlap
    // Radius based on node size (which is based on paper count)
    const getNodeRadius = (node: AuthorNode) =>
      Math.sqrt(Math.sqrt(node.paperCount)) *
        3 *
        GRAPH_CONFIG.COLLISION_RADIUS_MULTIPLIER +
      5;

    fg.d3Force(
      'collision',
      d3Force
        .forceCollide<AuthorNode>()
        .radius(getNodeRadius)
        .strength(GRAPH_CONFIG.COLLISION_STRENGTH)
        .iterations(3)
    );

    // Restart simulation with properly configured forces
    fg.d3ReheatSimulation();
  }, [
    // Include config values so callback updates on HMR
    GRAPH_CONFIG.CHARGE_STRENGTH,
    GRAPH_CONFIG.LINK_DISTANCE_BASE,
    GRAPH_CONFIG.LINK_DISTANCE_FACTOR,
    GRAPH_CONFIG.COLLISION_RADIUS_MULTIPLIER,
    GRAPH_CONFIG.COLLISION_STRENGTH,
  ]);

  // Enforce boundaries on every tick - only prevents nodes from flying to infinity
  const enforceBoundaries = useCallback(() => {
    if (!graphData) return;

    // Use a large boundary - just prevent infinite escape, not tight containment
    const maxDistance = 2000;
    const strength = GRAPH_CONFIG.BOUNDARY_STRENGTH;

    for (const node of graphData.nodes) {
      if (node.x !== undefined && node.y !== undefined) {
        const dist = Math.sqrt(node.x * node.x + node.y * node.y);

        // Only apply force when nodes go beyond maxDistance
        if (dist > maxDistance) {
          const factor = ((dist - maxDistance) / dist) * strength * 0.1;
          node.vx = (node.vx || 0) - node.x * factor;
          node.vy = (node.vy || 0) - node.y * factor;

          // Hard clamp at 3000 to absolutely prevent escape
          if (dist > 3000) {
            const scale = 3000 / dist;
            node.x *= scale;
            node.y *= scale;
          }
        }
      }
    }
  }, [graphData, GRAPH_CONFIG.BOUNDARY_STRENGTH]);

  // Combined tick handler - configure forces on first tick, enforce boundaries on all ticks
  const handleEngineTick = useCallback(() => {
    configureForces();
    enforceBoundaries();
  }, [configureForces, enforceBoundaries]);

  // Reset forces configured flag when constants change (for HMR support)
  useEffect(() => {
    forcesConfiguredRef.current = false;
    initialZoomDoneRef.current = false;
    if (fgRef.current) {
      configureForces();
    }
  }, [
    configureForces,
    // Include all config values to trigger reconfiguration on HMR
    GRAPH_CONFIG.CHARGE_STRENGTH,
    GRAPH_CONFIG.LINK_DISTANCE_BASE,
    GRAPH_CONFIG.LINK_DISTANCE_FACTOR,
    GRAPH_CONFIG.COLLISION_RADIUS_MULTIPLIER,
    GRAPH_CONFIG.COLLISION_STRENGTH,
    GRAPH_CONFIG.BOUNDARY_STRENGTH,
  ]);

  // Handle window resize
  useEffect(() => {
    const handleResize = (): void => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate edge thickness based on collaboration count
  const getEdgeWidth = useCallback(
    (link: CollaborationLink): number => {
      if (!graphData || graphData.maxCollaboration === 0) return 1;
      // Normalize thickness: min 1px, max 8px
      const minWidth = GRAPH_CONFIG.EDGE_MIN_WIDTH;
      const maxWidth = GRAPH_CONFIG.EDGE_MAX_WIDTH;
      const normalized =
        (link.value / graphData.maxCollaboration) * (maxWidth - minWidth) +
        minWidth;
      return normalized;
    },
    [graphData]
  );

  // Handle node click to highlight connections
  const handleNodeClick = useCallback((node: AuthorNode): void => {
    setSelectedNode(node);
  }, []);

  // Handle background click to deselect
  const handleBackgroundClick = useCallback((): void => {
    setSelectedNode(null);
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        gap={2}
      >
        <Skeleton variant="circular" width={60} height={60} />
        <Skeleton variant="text" width={200} height={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Typography color="error">
          Failed to load papers. Please try again later.
        </Typography>
      </Box>
    );
  }

  if (!graphData || graphData.nodes.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Typography color="text.secondary">
          No author data available.
        </Typography>
      </Box>
    );
  }

  // Theme-aware colors
  const nodeColor = isDark
    ? theme.palette.primary.light
    : theme.palette.primary.main;
  const selectedNodeColor = isDark
    ? theme.palette.secondary.light
    : theme.palette.secondary.main;
  const edgeColor = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)';
  const highlightEdgeColor = isDark
    ? theme.palette.secondary.light
    : theme.palette.secondary.main;
  const backgroundColor = theme.palette.background.default;

  return (
    <Box
      sx={{
        width: '100%',
        height: 'calc(100vh - 64px)',
        position: 'relative',
        mx: -3, // Offset layout padding
        mt: -3, // Offset layout padding
        mb: -3, // Offset layout padding
      }}
    >
      <Suspense
        fallback={
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="60vh"
          >
            <CircularProgress aria-label="Loading graph visualization" />
          </Box>
        }
      >
        <ForceGraph2D
          key={graphData ? 'loaded' : 'empty'}
          ref={fgRef}
          graphData={graphData}
          nodeLabel={(node: AuthorNode) => `${node.name}`}
          nodeRelSize={8}
          nodeColor={(node: AuthorNode) => {
            if (selectedNode && node.id === selectedNode.id) {
              return selectedNodeColor;
            }
            if (hoveredNode && node.id === hoveredNode.id) {
              return selectedNodeColor;
            }
            if (selectedNode) {
              // Check if node is connected to selected node
              const isConnected = graphData.links.some(link => {
                const sourceId =
                  typeof link.source === 'object'
                    ? link.source.id
                    : link.source;
                const targetId =
                  typeof link.target === 'object'
                    ? link.target.id
                    : link.target;
                return (
                  (sourceId === selectedNode.id && targetId === node.id) ||
                  (targetId === selectedNode.id && sourceId === node.id)
                );
              });
              if (isConnected) {
                // Highlight connected nodes
                return isDark
                  ? theme.palette.secondary.light
                  : theme.palette.secondary.main;
              }
            }
            return nodeColor;
          }}
          nodeVal={(node: AuthorNode) =>
            Math.sqrt(Math.sqrt(node.paperCount)) * 3
          } // Node size proportional to paper count
          nodeCanvasObjectMode={() => 'after'} // Render labels after nodes
          nodeCanvasObject={(node, ctx, globalScale) => {
            // Only draw the label for the selected node
            if (!selectedNode || node.id !== selectedNode.id) return;

            const label = node.name;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = theme.palette.text.primary;
            const yOffset = (10 + fontSize) / globalScale;
            ctx.fillText(label, node.x!, node.y! + yOffset);
          }}
          linkColor={link => {
            if (selectedNode) {
              const sourceId =
                typeof link.source === 'object' ? link.source.id : link.source;
              const targetId =
                typeof link.target === 'object' ? link.target.id : link.target;
              const isConnected =
                sourceId === selectedNode.id || targetId === selectedNode.id;
              return isConnected ? highlightEdgeColor : edgeColor;
            }
            return edgeColor;
          }}
          linkWidth={getEdgeWidth}
          linkDirectionalArrowLength={0}
          onNodeHover={node => setHoveredNode(node || null)}
          onNodeClick={handleNodeClick}
          onBackgroundClick={handleBackgroundClick}
          backgroundColor={backgroundColor}
          warmupTicks={0}
          cooldownTicks={GRAPH_CONFIG.WARMUP_TICKS}
          d3AlphaDecay={GRAPH_CONFIG.ALPHA_DECAY}
          d3VelocityDecay={GRAPH_CONFIG.VELOCITY_DECAY}
          onEngineTick={handleEngineTick}
          onEngineStop={() => {
            // Only zoom to fit once on initial load
            if (!initialZoomDoneRef.current && fgRef.current) {
              initialZoomDoneRef.current = true;
              if (typeof fgRef.current.zoomToFit === 'function') {
                fgRef.current.zoomToFit(400);
              }
            }
          }}
          // Responsive sizing
          width={dimensions.width}
          height={dimensions.height}
        />
      </Suspense>
    </Box>
  );
};

export default AuthorGraphPage;
