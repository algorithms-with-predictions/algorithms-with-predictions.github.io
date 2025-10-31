import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Typography, Stack } from '@mui/material';

const ITEM_HEIGHT = 70; // Estimated height of each PaperCard
const OVERSCAN = 3; // Extra items to render outside viewport

const VirtualizedPaperList = ({
  papers,
  renderItem,
  containerHeight = 600,
  emptyMessage = 'No papers found matching your criteria.',
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerRef, setContainerRef] = useState(null);

  // Calculate visible range
  const { startIndex, endIndex, totalHeight } = useMemo(() => {
    const itemCount = papers.length;
    const visibleStart = Math.floor(scrollTop / ITEM_HEIGHT);
    const visibleEnd = Math.min(
      itemCount - 1,
      Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT)
    );

    return {
      startIndex: Math.max(0, visibleStart - OVERSCAN),
      endIndex: Math.min(itemCount - 1, visibleEnd + OVERSCAN),
      totalHeight: itemCount * ITEM_HEIGHT,
    };
  }, [papers.length, scrollTop, containerHeight]);

  // Handle scroll events
  const handleScroll = useCallback(e => {
    setScrollTop(e.target.scrollTop);
  }, []);

  // Visible items
  const visibleItems = useMemo(() => {
    const items = [];
    for (let i = startIndex; i <= endIndex; i++) {
      items.push({
        index: i,
        paper: papers[i],
        style: {
          position: 'absolute',
          top: i * ITEM_HEIGHT,
          left: 0,
          right: 0,
          height: ITEM_HEIGHT,
          margin: 0,
          padding: 0,
        },
      });
    }
    return items;
  }, [papers, startIndex, endIndex]);

  // Reset scroll when papers change
  useEffect(() => {
    if (containerRef) {
      containerRef.scrollTop = 0;
      setScrollTop(0);
    }
  }, [papers.length, containerRef]);

  if (papers.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: containerHeight,
          textAlign: 'center',
          color: 'text.secondary',
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Typography variant="h6" color="text.secondary">
            {emptyMessage}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or filter criteria
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      ref={setContainerRef}
      onScroll={handleScroll}
      sx={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: theme => theme.palette.divider,
          borderRadius: '4px',
          '&:hover': {
            background: theme => theme.palette.action.hover,
          },
        },
      }}
    >
      {/* Virtual container */}
      <Box sx={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ index, paper, style }) => (
          <Box key={`${paper.id}-${index}`} sx={style}>
            {renderItem(paper, index)}
          </Box>
        ))}
      </Box>

      {/* Scroll indicators */}
      {papers.length > 10 && (
        <>
          {/* Top indicator */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: theme =>
                startIndex > 0
                  ? `linear-gradient(to bottom, ${theme.palette.primary.light}, transparent)`
                  : 'transparent',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          {/* Bottom indicator */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 4,
              background: theme =>
                endIndex < papers.length - 1
                  ? `linear-gradient(to top, ${theme.palette.primary.light}, transparent)`
                  : 'transparent',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        </>
      )}
    </Box>
  );
};

// Hook for dynamic item heights (advanced feature)
export const useDynamicHeight = () => {
  const [heights, setHeights] = useState(new Map());

  const setItemHeight = useCallback((index, height) => {
    setHeights(prev => {
      const next = new Map(prev);
      next.set(index, height);
      return next;
    });
  }, []);

  const getItemHeight = useCallback(
    index => {
      return heights.get(index) || ITEM_HEIGHT;
    },
    [heights]
  );

  return { setItemHeight, getItemHeight };
};

export default VirtualizedPaperList;
