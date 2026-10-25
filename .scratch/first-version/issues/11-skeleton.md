# Project skeleton: Vite + Preact + CI + strict CSP + GitHub Pages

Type: task
Status: ready-for-agent
Blocked by: none (the deploy step needs [17](17-enable-github-pages.md) before it can be verified)

## What to build

The empty app that every later ticket builds on, deployed end to end. See [spec](../spec.md) "Form and privacy" and "Stack and delivery".

- Vite 8 + Preact + TypeScript (strict), from the `preact-ts` template. Vitest with jsdom or happy-dom ([07](07-build-tool.md), [09](09-framework.md)).
- Relative asset paths (`base: './'`) so the same build works on GitHub Pages, our own domain later, and the future offline version ([offline-version](../../offline-version/issues/01-offline-version.md)).
- No external origins: no CDN, no Google Fonts (system font stack or a bundled font), no analytics.
- Strict CSP as a `<meta http-equiv="Content-Security-Policy">` in `index.html` (GitHub Pages can't set headers): `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; worker-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'`. Adjust only if a later ticket proves a need, and record why.
- SRI on the emitted scripts and styles via a Vite plugin (e.g. `vite-plugin-sri-gen`), checked to work on Vite 8.
- The page shows its version (package version + short git commit), injected at build time.
- A placeholder page: title "Medlemssjekk" and the line "Ingen data forlater nettleseren din."
- CI (GitHub Actions) on every push and PR: install, `tsc --noEmit`, Vitest, build, and a CSP check (below).
- Deploy workflow: every push to `main` builds and deploys to GitHub Pages.
- MIT `LICENSE` and a short `README.md` (what the tool does, the privacy guarantee, how to run it locally).

## CSP check (CI)

A Vitest or Node script that reads `dist/index.html` and fails if:

- the CSP meta tag is missing or differs from the expected policy;
- any `src`, `href` or `url(...)` in `dist/` points to an absolute `http(s)://` or protocol-relative origin;
- any inline `<script>` exists.

## Acceptance criteria

- [ ] `npm ci && npm run build` produces a static `dist/` that opens from a local static server and from GitHub Pages.
- [ ] `npm test` runs Vitest; `npm run typecheck` runs `tsc --noEmit`; both pass in CI.
- [ ] The CSP check passes, and fails if an external `<script src="https://…">` is added (verified by a test).
- [ ] The built page has no console CSP violations in Chrome and Firefox.
- [ ] The page shows the version.
- [ ] A push to `main` deploys to GitHub Pages (once 17 is done).
