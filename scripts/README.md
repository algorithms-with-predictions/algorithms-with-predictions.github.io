# ALPS Paper Discovery Tools

This directory contains tools to help discover missing papers in the learning-augmented algorithms
area and maintain the ALPS database.

## 🔍 Quick Start

### 1. Find Missing Papers (Recommended)

```bash
# Run the quick discovery script
python scripts/quick_paper_search.py

# Analyze the results to find truly missing papers
python scripts/compare_papers.py discovered_papers_YYYYMMDD_HHMMSS.json --generate-yaml

# Review the generated YAML files in missing_papers/ directory
# Edit them to add proper labels, BibTeX entries, etc.
# Then copy relevant ones to the papers/ directory
```

### 2. Install Dependencies

```bash
pip install -r scripts/requirements.txt
```

## 📋 Available Tools

### `quick_paper_search.py` - Primary Discovery Tool

**What it does:** Searches DBLP and ArXiv for learning-augmented algorithm papers **Usage:**
`python scripts/quick_paper_search.py` **Output:** `discovered_papers_TIMESTAMP.json`

**Features:**

- Searches multiple keywords: "learning-augmented", "algorithms with predictions", etc.
- Filters for recent papers (2018+)
- Removes duplicates and irrelevant papers
- Provides venue and temporal analysis

### `compare_papers.py` - Duplicate Detection

**What it does:** Compares discovered papers with your existing database **Usage:**
`python scripts/compare_papers.py discovered_papers.json --generate-yaml` **Output:** YAML template
files in `missing_papers/` directory

**Features:**

- Detects exact and near-duplicate titles
- Generates YAML templates for missing papers
- Suggests labels based on paper titles
- Safe filename generation

### `discover_missing_papers.py` - Advanced Discovery

**What it does:** Comprehensive search with multiple strategies **Usage:**
`python scripts/discover_missing_papers.py --method all --years 2020-2024`

**Features:**

- DBLP API integration
- ArXiv search with category filtering
- Venue-specific searches
- Citation network analysis (planned)
- Configurable year ranges and search methods

### `analyze_dataset.py` - Database Analysis

**What it does:** Analyzes your current database for gaps and patterns **Usage:**
`python scripts/analyze_dataset.py --report full`

**Features:**

- Venue coverage analysis
- Temporal trends
- Author collaboration networks
- Keyword distribution
- Gap identification and search suggestions

## 🎯 Recommended Search Strategy

### Phase 1: Quick Discovery

1. Run `quick_paper_search.py` to get an initial set of candidates
2. Use `compare_papers.py` to identify truly missing papers
3. Review and add the most relevant ones

### Phase 2: Systematic Coverage

1. Use `analyze_dataset.py` to identify coverage gaps
2. Run targeted searches with `discover_missing_papers.py`:

   ```bash
   # Search specific venues
   python scripts/discover_missing_papers.py --method venues --venue SODA --years 2020-2024

   # Focus on ArXiv for recent papers
   python scripts/discover_missing_papers.py --method arxiv --years 2023-2025
   ```

### Phase 3: Manual Curation

1. Check proceedings of major venues (SODA, FOCS, STOC, ICALP, etc.)
2. Follow citation trails from existing papers
3. Monitor recent ArXiv submissions in cs.DS category

## 🏷️ Adding Papers to Database

### 1. Review Generated Templates

The `compare_papers.py` script generates YAML templates. For each missing paper:

1. **Edit the template** to add:
   - Proper labels (see existing papers for examples)
   - Complete publication information (month, day, DBLP key)
   - BibTeX entries
   - Additional publications if available

2. **Common labels** in the ALPS database:
   - `online` - Online algorithms
   - `approximation` - Approximation algorithms
   - `streaming` - Streaming algorithms
   - `dynamic / data structure` - Dynamic algorithms and data structures
   - `caching / paging` - Caching and paging problems
   - `scheduling` - Scheduling problems
   - `game theory / mechanism design` - Game theory and mechanism design
   - `differential privacy` - Privacy-related algorithms

3. **Move to papers directory:**
   ```bash
   cp missing_papers/AuthorYearTitle.yml papers/
   ```

### 2. Validate Your Addition

```bash
# Rebuild the database
node scripts/composeData.js

# Test the website
npm run develop
```

## 🔧 Configuration and Customization

### Search Keywords

Edit the `keywords` lists in the Python scripts to add new search terms:

```python
keywords = [
    "learning-augmented",
    "algorithms with predictions",
    "competitive analysis with predictions",
    "your-custom-keyword-here"
]
```

### Venue Lists

Update the `venues` sets to include new venues or conference series:

```python
theory_venues = {
    'SODA', 'FOCS', 'STOC', 'ICALP', 'ESA',
    'YOUR-NEW-VENUE'
}
```

### Year Ranges

Adjust the default year ranges in the scripts based on your needs:

```python
years = range(2018, 2026)  # Adjust as needed
```

## 🚨 Search Tips and Best Practices

### 1. Effective Keywords

- **Core terms:** "learning-augmented", "algorithms with predictions"
- **Broader terms:** "competitive analysis", "online algorithms", "robust algorithms"
- **Domain-specific:** "caching with predictions", "scheduling with advice"

### 2. Venue Prioritization

**High priority venues for learning-augmented algorithms:**

- Theory: SODA, FOCS, STOC, ICALP, ESA, ITCS
- ML: NeurIPS, ICML, ICLR (for algorithmic papers)
- Systems: SIGMETRICS, NSDI (for systems applications)

### 3. Manual Search Strategies

1. **Google Scholar:** Use advanced search with venue constraints
2. **DBLP Browse:** Browse recent proceedings of major venues
3. **ArXiv Alerts:** Set up alerts for cs.DS category with relevant keywords
4. **Author Following:** Track prolific authors in the area

### 4. Quality Control

- Verify that papers are actually about learning-augmented algorithms
- Check for proper algorithmic content (not just ML applications)
- Ensure papers have theoretical contributions or analysis
- Prefer conference versions over arXiv when both exist

## 📊 Expected Results

Based on the current search, you should expect to find:

- **10-30 missing papers** per search iteration
- **Higher discovery rates** in recent years (2022-2025)
- **More papers in ML venues** as the field grows
- **ArXiv papers** that may later appear in conferences

## 🐛 Troubleshooting

### Common Issues

1. **Network timeouts:** Reduce search scope or add delays
2. **Rate limiting:** The scripts include delays, but you may need to increase them
3. **Encoding errors:** Ensure UTF-8 encoding for international characters
4. **YAML parsing errors:** Check syntax in generated templates

### Debug Mode

Add print statements or use the `--verbose` flag (if implemented) to see detailed search progress.

## 🔄 Regular Maintenance

### Monthly Tasks

1. Run `quick_paper_search.py` to find recent papers
2. Check ArXiv for new submissions
3. Update venue lists and keywords based on trends

### Quarterly Tasks

1. Run full analysis with `analyze_dataset.py`
2. Systematic venue-by-venue coverage check
3. Update search strategies based on gaps

### Annual Tasks

1. Comprehensive database audit
2. Update venue importance rankings
3. Review and expand keyword lists

---

## 📈 Contributing Improvements

Feel free to enhance these tools by:

1. Adding new search APIs (Google Scholar, Semantic Scholar)
2. Implementing citation network analysis
3. Adding automated BibTeX fetching
4. Creating web interfaces for easier use
5. Adding machine learning for relevance classification

The tools are designed to be extensible and can be easily modified to support additional data
sources and analysis methods.
