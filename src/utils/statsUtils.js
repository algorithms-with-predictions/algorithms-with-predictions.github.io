export const calculateStats = data => {
  // Calculate total papers
  const totalPapers = data.length;

  // Calculate unique authors
  const allAuthors = new Set();
  data.forEach(paper => {
    if (paper.authors) {
      // Handle both string and array formats
      const authorList =
        typeof paper.authors === 'string'
          ? paper.authors.split(', ').map(a => a.trim())
          : paper.authors;
      authorList.forEach(author => allAuthors.add(author));
    }
  });
  const totalAuthors = allAuthors.size;

  // Calculate unique venues
  const uniqueVenues = new Set();
  data.forEach(paper => {
    if (paper.publications) {
      paper.publications.forEach(pub => {
        if (pub.name && pub.name !== 'arXiv') {
          uniqueVenues.add(pub.name);
        }
      });
    }
  });
  const totalVenues = uniqueVenues.size;

  // Calculate year distribution
  const yearDistribution = data.reduce((acc, paper) => {
    // Get the earliest publication year for each paper
    if (paper.publications && paper.publications.length > 0) {
      const years = paper.publications
        .map(pub => pub.year)
        .filter(
          year =>
            year !== null &&
            year !== undefined &&
            !isNaN(year) &&
            isFinite(year)
        );
      if (years.length > 0) {
        const earliestYear = Math.min(...years);
        acc[earliestYear] = (acc[earliestYear] || 0) + 1;
      }
    }
    return acc;
  }, {});

  // Calculate venue stats
  const allVenues = data.flatMap(p =>
    (p.publications || []).map(pub => pub.name).filter(name => name !== 'arXiv')
  );

  const venueStats = Object.entries(
    allVenues.reduce((acc, venue) => {
      acc[venue] = (acc[venue] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7);

  return {
    totalPapers,
    totalAuthors,
    totalVenues,
    yearDistribution,
    venueStats,
  };
};
