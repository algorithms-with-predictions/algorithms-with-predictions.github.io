/**
 * Markdown content data structure
 */
export interface MarkdownData {
  frontmatter: Record<string, string>;
  content: string;
}

/**
 * Loads and parses markdown files with YAML frontmatter from /public/content/
 *
 * @param pageName - The name of the markdown file (without .md extension)
 * @returns Promise resolving to parsed frontmatter and content
 *
 * @example
 * ```ts
 * const { frontmatter, content } = await loadMarkdownFile('about');
 * console.log(frontmatter.title); // "About ALPS"
 * console.log(content); // Markdown content...
 * ```
 */
export const loadMarkdownFile = async (
  pageName: string
): Promise<MarkdownData> => {
  try {
    // Use Vite's base configuration
    const base = (import.meta.env?.BASE_URL as string | undefined) || '/';
    const filePath = `${base}content/${pageName}.md`;
    const response = await fetch(filePath);

    if (!response.ok) {
      throw new Error(`Failed to load markdown file: ${filePath}`);
    }

    const text = await response.text();

    // Parse frontmatter and content
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/;
    const match = text.match(frontmatterRegex);

    if (match && match[1] && match[2]) {
      // Parse YAML frontmatter
      const frontmatterText = match[1];
      const content = match[2];

      // Simple YAML parser for our basic needs (key: value pairs only)
      const frontmatter: Record<string, string> = {};
      frontmatterText.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          const value = line
            .substring(colonIndex + 1)
            .trim()
            .replace(/^['"]|['"]$/g, ''); // Remove quotes
          frontmatter[key] = value;
        }
      });

      return { frontmatter, content: content.trim() };
    }

    // No frontmatter, return just content
    return { frontmatter: {}, content: text.trim() };
  } catch (error) {
    // Handle error gracefully
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error loading markdown file "${pageName}":`, error);

    return {
      frontmatter: {},
      content: `Error loading content: ${errorMessage}`,
    };
  }
};
