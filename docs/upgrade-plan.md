# Major dependency upgrade plan

Status as of 2026-10-21. In-range/security updates are already applied (react-router 7.18.4, vite
6.4.5, vitest 4.1.12, js-yaml 4.3.2, React 19.3.1, …). The only remaining `npm audit` finding is
`braces` via `gh-pages` (deploy-time only, no patched release).

## Blockers

- **ESLint 10**: `eslint-plugin-react` 7.37.5 is the latest release and its peer range stops at
  `eslint ^9.7`; it crashes under ESLint 10 (`contextOrFilename.getFilename is not a function`).
  Tracking: jsx-eslint/eslint-plugin-react#3977 (fix PR #3979, unmerged). Wait, or replace it with
  `@eslint-react/eslint-plugin`.
- **TypeScript 7**: ships no programmatic JS API; `typescript-eslint` 8.72 requires
  `typescript >=4.8.4 <6.1.0`. Use the official alias setup:
  `"typescript": "npm:@typescript/typescript6@^6.0.2"` + `"@typescript/native": "npm:typescript@^7.0.2"`
  (`tsc` = 7, typed linting = 6).

## PR sequence

Each step is a separate PR; run `lint`, `format:check`, `test`, `build`, and a smoke test of
`/`, `/authors`, `/about`, `/workshop2026` in light and dark mode.

### 1. Housekeeping (S, low)

- CI: `.github/workflows/ci-cd.yml:22` `node-version: "24"` → `"26"` (or ≥ 24.15; jsdom 30 needs
  `^22.22.2 || ^24.15.0 || >=26`).
- `package.json` `engines.node`: `>=18.0.0` → `^22.22.2 || ^24.15.0 || >=26`.
- Add `@testing-library/dom` as a direct devDependency (required peer of jest-dom 7).
- Remove unused deps: `eslint-plugin-react-refresh`, `eslint-config-prettier` (neither is in
  `eslint.config.js`), `prop-types` (unused in `src`). Or wire the first two up.

### 2. js-yaml 4 → 5 (S, low)

- `scripts/composeData.js:2` `import yaml from 'js-yaml'` → `import { load } from 'js-yaml'`
  (v5 has no default export); `:42` → `load(fileContents)`.
- v5 defaults to `CORE_SCHEMA` (no timestamps/merge keys); papers use neither. Verify by diffing
  the generated `papers.json` before/after.

### 3. Vitest 5, coverage-v8 5, jsdom 30, jest-dom 7 (S–M, low–medium)

Works on Vite 6.4, so it does not depend on step 5.

- `src/components/paper/__tests__/PaperCard.bench.ts:6`: top-level `bench` import removed in
  Vitest 5 — rewrite or delete (otherwise `tsc --noEmit` and therefore `build` fail).
- Import `@testing-library/jest-dom/vitest` instead of `@testing-library/jest-dom` in
  `src/test/setup.js:1`, `LabelChip.test.tsx:3`, `PaperCard.test.tsx:3` (Vitest 5 no longer reads
  `jest.Matchers`).
- Guide: https://vitest.dev/guide/migration

### 4. MUI 7 → 9 (M, medium)

There is no v8. Guide: https://mui.com/material-ui/migration/upgrade-to-v9/

1. Codemods: `npx @mui/codemod@latest v9.0.0/system-props src` (≈30 Box/Stack/Typography uses),
   `deprecations/text-field-props` (`SearchAndFilter.tsx:77,81`), list-item-text props
   (`EnhancedMarkdownContent.tsx:107` `primaryTypographyProps` → `slotProps.primary`).
2. Removed icons: `MailOutline` → `MailOutlined` (`WorkshopPage.tsx:18`), `ErrorOutline` →
   `ErrorOutlined` (`ErrorBoundary.tsx:3`).
3. `Typography paragraph` removed → `sx={{ mb: 2 }}` in MarkdownContent, CookieConsent,
   EnhancedMarkdownContent, ErrorBoundary, WorkshopPage, PrivacyPage (10 places).
4. Check `Button component={RouterLink}` in `header.tsx:79,147` (may need `nativeButton={false}`).
5. Visual QA in both themes; check Typography `color="text.secondary"` after the codemod.

### 5. Vite 8 + @vitejs/plugin-react 6 (S–M, medium)

Rolldown/Oxc replace Rollup/esbuild. Guides: https://v7.vite.dev/guide/migration,
https://vite.dev/guide/migration

- `vite.config.js:25-33` object-form `manualChunks` is removed → Rolldown `codeSplitting` groups
  (or function form).
- `build.rollupOptions` → `build.rolldownOptions`; drop the redundant `input`; prefer
  `import.meta.dirname` over `__dirname`.
- Compare bundle sizes against the current build (mui ≈ 305 kB, main ≈ 254 kB).

### 6. TypeScript 6.0, then 7.0 (M, medium)

- On 6.0 (stepping stone, works with typescript-eslint): remove `tsconfig.json:13` `baseUrl`
  (error in 7); `types` now defaults to `[]` → add `"types": ["node"]` or replace
  `process.env.NODE_ENV` (`ErrorBoundary.tsx:35,91`) with `import.meta.env.DEV` and
  `NodeJS.Timeout` (`PaperCard.tsx:32`) with `ReturnType<typeof setTimeout>`.
- Then 7.0 via the alias setup above; bump `@types/node` to 26.
- Source: https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/

### 7. Lint tooling (M, high)

- Now, on ESLint 9: `eslint-plugin-react-hooks` 7 (enables React Compiler rules via
  `configs.recommended` — expect new reports to fix), `globals` 17.
- Later: ESLint 10 + `@eslint/js` 10 once the `eslint-plugin-react` blocker clears. ESLint 10 adds
  `no-unassigned-vars`, `no-useless-assignment`, `preserve-caught-error` to recommended.
  Guide: https://eslint.org/docs/latest/use/migrate-to-10.0.0

## Open questions to verify during implementation

- Typography `color` handling in the v9 system-props codemod.
- Whether `nativeButton` is required on router-link Buttons.
- Number of new react-hooks 7 lint errors.
- MUI type compatibility with TS 7.
