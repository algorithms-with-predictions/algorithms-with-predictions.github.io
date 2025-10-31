---
title: 'How to Contribute'
slug: '/contribute'
---

## How to Contribute in General

The sources and data for this webpage are available on
[GitHub](https://github.com/algorithms-with-predictions/algorithms-with-predictions.github.io). It
uses [Gatsby](https://www.gatsbyjs.com/) for static site rendering and is hosted via
[GitHub Pages](https://pages.github.com/).

Everyone is very welcome to contribute:

- Maintain paper references, e.g. adding, updating and labeling references (see `papers/` directory
  and syntax below)
- Add and edit further material. This page is generated from the
  [Markdown](https://en.wikipedia.org/wiki/Markdown) file `src/markdown-pages/material.md` and is
  thus easy to modify.
- Improve layout or design, add new features.

Most contributions can be done via Pull Requests directly in the repository. For more involved
suggestions or discussions, feel free to contact us
([alps-web@uni-bremen.de](mailto:alps-web@uni-bremen.de)).

## Adding and Editing Paper References

Paper entries are based on YAML files, which are located in the directory `papers/`.

As an example, this is the data file for the caching paper by Lykouris and Vassilvitskii
(`LykourisV18competitive.yml`):

```yml
title: Competitive Caching with Machine Learned Advice
authors: Lykouris, Vassilvitskii
publications:
  - name: ICML
    year: 2018
    url: http://proceedings.mlr.press/v80/lykouris18a/lykouris18a.pdf
  - name: arXiv
    year: 2018
    month: 1 # optional
    day: 4 # optional
    url: https://arxiv.org/pdf/1802.05399.pdf
  - name: J. ACM
    year: 2021
    url: https://dl.acm.org/doi/10.1145/3447579
labels:
  - online
  - caching/paging
```

If you want to add or change the entry of a paper, you can either add/edit the file via a Pull
Request or send us the file via [e-mail](mailto:alps-web@uni-bremen.de). In case you want to add a
paper, please try to find a unique filename (as in the example above; but there are no strict
conventions).

## Automated Publication Fetching

It is also possible to only add the title and labels of a paper:

```yml
title: Competitive Caching with Machine Learned Advice
labels:
  - online
  - caching/paging
```

We use an
[automated procedure](https://github.com/algorithms-with-predictions/algorithms-with-predictions.github.io/blob/main/scripts/updateData.mjs)
to fetch the authors last names and all publications which have an (almost) matching title from
[DBLP](https://dblp.org) and [arXiv](https://arxiv.org). In this example, all three publications of
this paper can be added automatically.

## Local Development

You can start a local development instance of this webpage as follows:

First, clone
[this repository](https://github.com/algorithms-with-predictions/algorithms-with-predictions.github.io)
and install dependencies via a node package manager, e.g. [yarn](https://yarnpkg.com/):

```bash
yarn
```

Then, install the gatsby command line interface

```bash
yarn global add gatsby-cli
```

and finally run

```bash
yarn develop
```
