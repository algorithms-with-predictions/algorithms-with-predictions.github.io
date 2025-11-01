// Utility to load and parse markdown files with frontmatter
export const loadMarkdownFile = async pageName => {
  try {
    // Use Vite's base configuration
    const base = import.meta.env.BASE_URL || '/';
    const filePath = `${base}content/${pageName}.md`;
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load markdown file: ${filePath}`);
    }
    const text = await response.text();

    // Parse frontmatter and content
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/;
    const match = text.match(frontmatterRegex);

    if (match) {
      // Parse YAML frontmatter
      const frontmatterText = match[1];
      const content = match[2];

      // Simple YAML parser for our basic needs
      const frontmatter = {};
      frontmatterText.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          const value = line
            .substring(colonIndex + 1)
            .trim()
            .replace(/^['"]|['"]$/g, '');
          frontmatter[key] = value;
        }
      });

      return { frontmatter, content: content.trim() };
    }

    // No frontmatter, return just content
    return { frontmatter: {}, content: text.trim() };
  } catch (error) {
    // Handle error gracefully
    return {
      frontmatter: {},
      content: `Error loading content: ${error.message}`,
    };
  }
};
