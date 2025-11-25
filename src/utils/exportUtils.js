export const exportBibtex = (papers) => {
  if (typeof window === 'undefined') return;

  const bibtexEntries = papers
    .filter(paper => paper.publications?.some(pub => pub.bibtex))
    .map(paper => {
      const pubsWithBibtex = paper.publications.filter(pub => pub.bibtex);
      return pubsWithBibtex.map(pub => pub.bibtex).join('\n\n');
    })
    .join('\n\n');

  if (bibtexEntries) {
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
