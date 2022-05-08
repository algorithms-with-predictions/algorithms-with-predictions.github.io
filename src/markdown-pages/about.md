---
title: "About"
slug: "/about"
---

# About

The idea of this project is to create a better overview over the current state of research on Algorithms with Predictions as well as to collect links to further relevant material. This should especially help new researchers in this field to orient faster, but we also try to keep track over and cluster the large amount of results and publications in this field.

This is an [open source project](https://github.com/algorithms-with-predictions/algorithms-with-predictions.github.io) and everybody is very welcome to contribute. Further details can be found below.

List of contributors:

- Alexander Lindermayr, University of Bremen
- Nicole Megow, University of Bremen


## How to Contribute in General

The sources and data for this webpage are available on [GitHub](https://github.com/algorithms-with-predictions/algorithms-with-predictions.github.io).

We appreciate contributions of any kind:

- adding, updating and labeling references (see `papers/`)
- adding/editing further material (the markdown file is located add `src/markdown-pages/material.md`)
- improvements to functionality and design

Most contributions can be done via Pull Requests directly in the repository (e.g. edit/add the data source for a paper entry, see more details in the next section). For more involved suggestions or discussions, feel free to contact us ([alps-web@uni-bremen.de](mailto:alps-web@uni-bremen.de)).

## Adding and Editing Paper References

Paper entries are based on a YAML files, which are located in the directory `papers/`.

As an example, this is the data file for the caching paper by Lykouris and Vassilvitskii (`LykourisV18competitive.yml`):

```yml
title: Competitive Caching with Machine Learned Advice
authors: Lykouris, Vassilvitskii
publications:
  - name: ICML
    year: 2018
    url: http://proceedings.mlr.press/v80/lykouris18a/lykouris18a.pdf
  - name: arXiv
    year: 2018
    url: https://arxiv.org/pdf/1802.05399.pdf
  - name: J. ACM
    year: 2021
    url: https://dl.acm.org/doi/10.1145/3447579
labels:
  - caching
```

If you want to add or change the entry of a paper, you can either add/edit the file via a Pull Request or send us the file via [e-mail](mailto:alps-web@uni-bremen.de). In case you want to add a paper, please try to find a unique filename (as in the example above; but there are no strict conventions).
