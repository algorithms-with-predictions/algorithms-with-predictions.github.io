import type { Paper } from '@/types';

/**
 * Export papers with BibTeX entries to a .bib file
 *
 * Creates a downloadable BibTeX file containing all papers that have BibTeX entries.
 * The file is named with the current date: alps-papers-YYYY-MM-DD.bib
 *
 * @param papers - Array of papers to export
 *
 * @example
 * ```ts
 * const papers = usePapersData();
 * exportBibtex(papers.data);
 * ```
 */
export const exportBibtex = (papers: Paper[]): void => {
  if (typeof window === 'undefined') return;

  // Collect all BibTeX entries from papers
  const bibtexEntries = papers
    .filter(paper => paper.publications?.some(pub => pub.bibtex))
    .map(paper => {
      const pubsWithBibtex =
        paper.publications?.filter(pub => pub.bibtex) ?? [];
      return pubsWithBibtex.map(pub => pub.bibtex).join('\n\n');
    })
    .join('\n\n');

  if (bibtexEntries) {
    // Create and download the file
    const blob = new Blob([bibtexEntries], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alps-papers-${new Date().toISOString().split('T')[0]}.bib`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};
