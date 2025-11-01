---
title: 'How to Contribute'
slug: '/contribute'
---

## How to Contribute in General

The sources and data for this webpage are available on
[GitHub](https://github.com/algorithms-with-predictions/algorithms-with-predictions.github.io). It
uses modern web technologies for static site rendering and is hosted via
[GitHub Pages](https://pages.github.com/).

Everyone is very welcome to contribute:

- Maintain paper references, e.g. adding, updating and labeling references (see `papers/` directory
  and syntax below)
- Add and edit further material. This page is generated from markdown files and is
  thus easy to modify.
- Improve layout or design, add new features.

Most contributions can be done via Pull Requests directly in the repository. For more involved
suggestions or discussions, feel free to contact us
([alps-web@uni-bremen.de](mailto:alps-web@uni-bremen.de)).

## Adding and Editing Paper References

Paper entries are based on YAML files, which are located in the directory `papers/`.

As an example, this is the data file for the caching paper by Lykouris and Vassilvitskii:

```yaml
title: Competitive Caching with Machine Learned Advice
authors: Lykouris, Vassilvitskii
labels:
- caching / paging
- online
publications:
- name: ICML
  url: https://proceedings.mlr.press/v80/lykouris18a.html
  year: 2018
  dblp_key: conf/icml/LykourisV18
  bibtex: "@inproceedings{DBLP:conf/icml/LykourisV18,\\n  author = {Thodoris Lykouris and\\n  Sergei Vassilvitskii},\\n  title = {Competitive Caching with Machine Learned Advice},\\n  booktitle = {{ICML}},\\n  series = {Proceedings of Machine Learning Research},\\n  volume = {80},\\n  pages = {3302--3311},\\n  publisher = {{PMLR}},\\n  year = {2018}\\n}\\n"
- name: arXiv
  url: https://arxiv.org/abs/1802.05399
  year: 2018
  month: 2
  day: 15
```

### Required Fields

Each paper entry must contain:

- **title**: The full title of the paper
- **authors**: List of authors (can be string or array)
- **labels**: Categories/tags for the paper
- **publications**: Array of publication venues

### Publication Fields

Each publication entry should include:

- **name**: Venue name (conference, journal, or "arXiv")
- **url**: Direct link to the paper
- **year**: Publication year
- **dblp_key**: (optional) DBLP key for the entry
- **bibtex**: (optional) BibTeX citation

### Labels/Categories

Use consistent labels to help with filtering:

- `online` - Online algorithms
- `caching / paging` - Caching and paging problems
- `streaming` - Streaming algorithms
- `approximation` - Approximation algorithms
- `game theory / mechanism design` - Game theory applications
- `differential privacy` - Privacy-preserving algorithms
- `survey` - Survey papers

## File Naming Convention

Name files descriptively based on authors and topic:
- `AuthorName20keyword.yml`
- `SmithJones21caching.yml`
- `Survey23online.yml`

## Testing Your Contribution

Before submitting:

1. Validate YAML syntax
2. Check that all URLs work
3. Ensure consistent formatting
4. Test locally if possible

## Content Pages

You can also edit the content pages by modifying the markdown files in `public/content/`:

- `public/content/material.md` - Further Material page
- `public/content/contribute.md` - How to Contribute page (this page!)
- `public/content/about.md` - About page

These files use standard markdown with YAML frontmatter for metadata.
