import React, {
  useMemo,
  useRef,
  useState,
  useCallback,
  useEffect,
} from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  useTheme,
  Paper,
} from '@mui/material';
import ForceGraph2D from 'react-force-graph-2d';
import { usePapersData } from '../hooks/usePapersData';
import { buildAuthorGraph } from '../utils/graphUtils';
import { useThemeMode } from '../contexts/ThemeContext';

const AuthorGraphPage = () => {
  const { data, loading, error } = usePapersData();
  const theme = useTheme();
  const { isDark } = useThemeMode();
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 800,
    height: typeof window !== 'undefined' ? window.innerHeight : 600,
  });
  const fgRef = useRef();

  // Build graph data from papers
  const graphData = useMemo(() => {
    if (!data) return null;
    return buildAuthorGraph(data);
  }, [data]);

  // Configure d3 forces to minimize edge crossings
  useEffect(() => {
    if (!graphData || !fgRef.current) return;

    const fg = fgRef.current;

    // Increase repulsion (charge) to spread nodes apart and reduce crossings
    // Default strength is usually around -30
    fg.d3Force('charge').strength(-200);

    // Increase link distance to give edges more room
    // Default distance is usually around 30
    fg.d3Force('link').distance(link => 50 + (link.value || 1) * 5);

    fg.d3ReheatSimulation();
  }, [graphData]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
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
    link => {
      if (!graphData || graphData.maxCollaboration === 0) return 1;
      // Normalize thickness: min 1px, max 8px
      const minWidth = 1;
      const maxWidth = 8;
      const normalized =
        (link.value / graphData.maxCollaboration) * (maxWidth - minWidth) +
        minWidth;
      return normalized;
    },
    [graphData]
  );

  // Handle node click to highlight connections
  const handleNodeClick = useCallback(node => {
    setSelectedNode(node);
  }, []);

  // Handle background click to deselect
  const handleBackgroundClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
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
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeLabel={node => `${node.name} (${node.paperCount} papers)`}
        nodeRelSize={8}
        nodeColor={node => {
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
                typeof link.source === 'object' ? link.source.id : link.source;
              const targetId =
                typeof link.target === 'object' ? link.target.id : link.target;
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
        nodeVal={node => Math.sqrt(node.paperCount) * 3} // Node size proportional to paper count
        nodeCanvasObjectMode={() => 'after'} // Render labels after nodes
        nodeCanvasObject={(node, ctx, globalScale) => {
          // Only draw the label for the selected node.
          if (!selectedNode || node.id !== selectedNode.id) return;

          const label = node.name;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = theme.palette.text.primary;
          const yOffset = (10 + fontSize) / globalScale;
          ctx.fillText(label, node.x, node.y + yOffset);
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
        cooldownTicks={120}
        onEngineStop={() => {
          if (fgRef.current) {
            if (typeof fgRef.current.zoomToFit === 'function') {
              fgRef.current.zoomToFit(400);
            }
          }
        }}
        // Responsive sizing
        width={dimensions.width}
        height={dimensions.height}
      />
    </Box>
  );
};

export default AuthorGraphPage;
