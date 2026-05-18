/**
 * Typed wrapper for ForceGraph2D component
 * Used for code-splitting to avoid loading the library on pages that don't need it
 */
import ForceGraph2D from 'react-force-graph-2d';
import type { AuthorNode, CollaborationLink } from '../utils/graphUtils';

// Re-export with proper types for our specific node/link types
// This allows code-splitting while maintaining type safety
const ForceGraphWrapper = ForceGraph2D<AuthorNode, CollaborationLink>;

export default ForceGraphWrapper;
