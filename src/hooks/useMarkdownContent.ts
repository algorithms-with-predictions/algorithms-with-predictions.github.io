import { useQuery } from '@tanstack/react-query';
import { loadMarkdownFile, type MarkdownData } from '@/utils/markdownLoader';

// Re-export for convenience
export type { MarkdownData };

/**
 * Custom hook to fetch and cache markdown content using React Query
 *
 * @param pageName - The name of the markdown file (without .md extension)
 * @returns Query result with markdown data, loading state, and error
 *
 * Features:
 * - Automatic caching (15 minutes stale time, 30 minutes garbage collection)
 * - No refetch on window focus (markdown content is static)
 * - No refetch on mount (use cached data)
 * - Cached content persists across page navigation
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useMarkdownContent('about');
 * if (isLoading) return <Loading />;
 * if (error) return <Error />;
 * return <Markdown>{data.content}</Markdown>;
 * ```
 */
export const useMarkdownContent = (pageName: string) => {
  return useQuery({
    queryKey: ['markdown', pageName],
    queryFn: () => loadMarkdownFile(pageName),
    staleTime: 15 * 60 * 1000, // 15 minutes - markdown content is very static
    gcTime: 30 * 60 * 1000, // 30 minutes in memory
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
