# Major dependency upgrade plan

Status as of 2026-10-21: all steps done except ESLint 10 (blocked, see below).

| Step | Status |
| --- | --- |
| In-range/security updates | Done |
| Housekeeping (CI Node 26, `engines`, unused deps) | Done |
| js-yaml 5 | Done |
| Vitest 5, coverage-v8 5, jsdom 30, jest-dom 7 | Done |
| MUI 9 | Done |
| Vite 8, @vitejs/plugin-react 6 | Done |
| TypeScript 6 → 7, @types/node 26 | Done |
| eslint-plugin-react-hooks 7, globals 17, typescript-eslint 8.72 | Done |
| ESLint 10, @eslint/js 10 | **Blocked** |

The only remaining `npm audit` finding is `braces` via `gh-pages` (deploy-time only, no patched
release).

## Remaining: ESLint 10

`eslint-plugin-react` 7.37.5 is the latest release and its peer range stops at `eslint ^9.7`; it
crashes under ESLint 10 (`contextOrFilename.getFilename is not a function`). Tracking:
jsx-eslint/eslint-plugin-react#3977 (fix PR #3979). Once a compatible release ships (or after
switching to `@eslint-react/eslint-plugin`), upgrade `eslint` and `@eslint/js` together. ESLint 10
adds `no-unassigned-vars`, `no-useless-assignment` and `preserve-caught-error` to recommended.
Guide: https://eslint.org/docs/latest/use/migrate-to-10.0.0

## Notes for maintainers

- **TypeScript 7** ships no programmatic JS API, and typescript-eslint requires
  `typescript <6.1.0`. So `typescript` is aliased to `@typescript/typescript6` (used by typed
  linting) and `@typescript/native` is TypeScript 7 (provides `tsc`, used by `type-check` and
  `build`). Drop the alias once typescript-eslint supports TypeScript 7.
- **js-yaml 5** is stricter: continuation lines of multi-line quoted strings must be indented
  deeper than their mapping key. `composeData.js` reports such files as parse errors.
- **MUI 9**: system props (`alignItems`, `fontWeight`, `color`, … on `Box`/`Stack`/`Typography`)
  and `Typography paragraph` are gone; use `sx`. The `*Outline` icon aliases were removed in favor
  of `*Outlined`. `npx @mui/codemod` 9.5.0 crashes on startup (yargs); run its transforms directly
  with the bundled jscodeshift if needed.
- **Vite 8** uses Rolldown: chunking is configured via `build.rolldownOptions.output.codeSplitting`.
- **Vitest 5**: benchmarks use the `bench` test-context fixture and run with
  `npx vitest bench --run`.
