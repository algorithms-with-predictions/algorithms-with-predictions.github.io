# Algorithms with Predictions (ALPS)

[![Build Status](https://github.com/algorithms-with-predictions/algorithms-with-predictions.github.io/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/algorithms-with-predictions/algorithms-with-predictions.github.io/actions)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Falgorithms-with-predictions.github.io)](https://algorithms-with-predictions.github.io)
[![License](https://img.shields.io/github/license/algorithms-with-predictions/algorithms-with-predictions.github.io)](LICENSE)

A comprehensive, community-driven resource for research on **Algorithms with Predictions** -
maintaining an overview of the current state of research and collecting links to relevant materials
to help researchers navigate this rapidly growing field.

## Mission

The idea of this project is to maintain an overview over the current state of research on Algorithms
with Predictions and collect links to further relevant material. This should especially help new
researchers in this field to orient faster, but we also try to keep track over and cluster the large
amount of results and publications in this field.

## How to Contribute in General

The sources and data for this webpage are available on
[GitHub](https://github.com/algorithms-with-predictions/algorithms-with-predictions.github.io). It
uses [Vite](https://vitejs.dev/) + [React 18](https://react.dev/) to build a static site and is
hosted via [GitHub Pages](https://pages.github.com/).

Everyone is very welcome to contribute:

- Maintain paper references, e.g. adding, updating and labeling references (see `papers/` directory
  and syntax below)
- Add and edit further material. Key Markdown sources live in `public/content/`:
  - `public/content/material.md` (Material page)
  - `public/content/about.md` (About page)
  - `public/content/contribute.md` (Contribute page)
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

Prerequisites: Node.js >= 18 and npm >= 8.

First, clone
[this repository](https://github.com/algorithms-with-predictions/algorithms-with-predictions.github.io)
and install dependencies via npm:

```bash
npm install
```

Then start the development server:

```bash
npm run dev
```

The site will be available at `http://localhost:3000`.

## 🛠️ Technology Stack

- **Build Tool**: [Vite 5](https://vitejs.dev/)
- **Framework**: [React 18](https://react.dev/)
- **UI Library**: [Material-UI (MUI) v5](https://mui.com/)
- **Styling**: [Emotion](https://emotion.sh/)
- **Content**: Markdown files in `public/content/*.md`
- **Data Processing**: Node.js scripts for YAML and JSON generation (`scripts/`)
- **Code Quality**: ESLint, Prettier, Husky for git hooks
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Hosting**: GitHub Pages with automated deployments

## 📊 Project Scripts

```bash
npm run dev             # Compose data and start Vite dev server
npm run start           # Alias for dev
npm run build           # Compose data and build production site
npm run preview         # Preview the built site locally
npm run format          # Format code with Prettier
npm run format:check    # Check formatting without writing
npm run lint            # Run ESLint checks
npm run lint:fix        # Fix lint issues automatically
npm run type-check      # Run TypeScript type checks
npm run clean           # Clean build cache (dist and Vite cache)
npm run clean:all       # Remove dist, node_modules, and lockfile
npm run update-data     # Update paper metadata from external sources
npm run deploy          # Deploy to GitHub Pages (branch: deploy)
```

## 🤝 Contributing

We welcome contributions from the community! See our
[How to Contribute](https://algorithms-with-predictions.github.io/contribute) page for detailed
guidelines.
