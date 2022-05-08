---
title: "About"
slug: "/about"
---

# About

Hi! This page is work in progress.

## How to Contribute in General

The sources and data for this webpage are available on [GitHub](https://github.com/algorithms-with-predictions/algorithms-with-predictions.github.io).

We appreciate contributions of any kind:

- adding and updating references
- labeling references
- adding materials / links
- improvements to functionality and design

Most contributions can be done via Pull Requests directly in the repository. 
For more detailed suggestions or discussions, feel free to contact us ([alps-web@uni-bremen.de](mailto:alps-web@uni-bremen.de)). 

## Adding and Editing Paper References

The entries are based on a YAML files, which are located in the directory `papers/`.

Example (`LykourisV18competitive.yml`):

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

If you want to add or change the entry of a paper, you can either add/edit the file via a Pull Request or send us the file via [e-mail](mailto:alps-web@uni-bremen.de). Please use a unique filename (as in the example above; but there are no strict conventions).
