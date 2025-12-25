# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this
repository.

## Project Overview

ALPS (Algorithms with Predictions) is a community-driven research resource built as a static site
using Vite + React 19. It maintains an overview of research on "Algorithms with Predictions" and
helps researchers navigate this field.

## Commands

```bash
npm run dev          # Start dev server on localhost:3000
npm run build        # Build production site to dist/
npm run lint         # ESLint check
npm run lint:fix     # Auto-fix lint issues
npm run format       # Format with Prettier
npm run format:check # Check formatting
npm run test         # Run Vitest tests
npm run test:coverage # Tests with coverage
npm run deploy       # Deploy to GitHub Pages
```

## Architecture

### Data Pipeline

Paper data flows: `papers/*.yml` → `scripts/composeData.js` → `papers.json` → `usePapersData` hook →
React components

The `composeData.js` script runs automatically before dev/build, converting YAML paper files to
JSON.

### Code Structure

- `src/components/` - Reusable UI (layout, header, paper cards, filters)
- `src/pages/` - Route pages (HomePage, AboutPage, AuthorGraphPage, etc.)
- `src/hooks/` - Custom hooks (usePapersData, usePaperFilter, useCookieConsent)
- `src/utils/` - Utilities (paperUtils, labelUtils, graphUtils)
- `src/contexts/` - React Context (ThemeContext for light/dark mode)
- `public/content/` - Markdown content (about.md, contribute.md, material.md)

### Key Technologies

- Vite 6 (bundler), React 19, Material-UI v7, Emotion (CSS-in-JS)
- React Router v7 for routing
- react-force-graph + d3-force for author network visualization
- react-markdown + remark-gfm for content rendering

### Path Alias

`@` maps to `src/` (configured in vite.config.js)

## Paper YAML Format

Papers are stored in `papers/` directory as YAML files:

```yaml
title: Paper Title
authors: Author1, Author2
publications:
  - name: Venue
    year: 2024
    url: https://...
labels:
  - online
  - caching/paging
```

## Theme System

Global theme state managed via `ThemeContext.jsx` with `useThemeMode()` hook. Theme colors defined
in `theme.js` (blue primary, orange secondary).
