---
title: 'How to Contribute'
slug: '/contribute'
---

## Welcome, Contributors

This project is open source and lives on [GitHub](https://github.com/algorithms-with-predictions/algorithms-with-predictions.github.io). We welcome all contributions.

For most changes, please open a **Pull Request**. For bigger ideas or questions, you can email us at [alps-web@uni-bremen.de](mailto:alps-web@uni-bremen.de).

---

## Adding or Editing Papers

Paper data is stored as YAML files in the `papers/` directory.

### Paper File Structure

Each paper is a `.yml` file. Name files descriptively (e.g., `Author21topic.yml`). Here’s a quick example:

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
  dblp_key: conf/icml/LykourisV18 # Optional
  bibtex: "@inproceedings{...}"   # Optional
- name: arXiv
  url: https://arxiv.org/abs/1802.05399
  year: 2018
```

### Key Fields

- **`title`**: Full paper title.
- **`authors`**: Author names.
- **`labels`**: A list of relevant categories (see below for common labels).
- **`publications`**: List of venues, each with a `name`, `url`, and `year`.



---

## Editing Website Content

You can edit the site's informational pages by modifying the markdown files in `public/content/`, such as `about.md` or this very file.
