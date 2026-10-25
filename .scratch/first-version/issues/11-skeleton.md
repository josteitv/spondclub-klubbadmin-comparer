# Project skeleton: Vite + Preact + CI + strict CSP + GitHub Pages

Type: task
Status: resolved
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

- [x] `npm ci && npm run build` produces a static `dist/` that opens from a local static server and from GitHub Pages.
- [x] `npm test` runs Vitest; `npm run typecheck` runs `tsc --noEmit`; both pass in CI.
- [x] The CSP check passes, and fails if an external `<script src="https://…">` is added (verified by a test).
- [x] The built page has no console CSP violations in Chrome and Firefox.
- [x] The page shows the version.
- [x] A push to `main` deploys to GitHub Pages (once 17 is done).

## Comments

- 2026-10-25, agent: built. Versions: Vite 8.3.5, Preact 11.0.2, TypeScript 7.0.2, Vitest 5.0.5, jsdom 30, vite-plugin-sri-gen 1.7.5. The CSP lives in `build/csp.ts`; it is injected at build time only, because the dev server's inline styles would break under it. The SRI plugin's inline import map and dynamic-tag runtime are turned off, since they would need `'unsafe-inline'`. Verified locally: typecheck, 8 tests, build and `check:dist` pass. In headless Chromium and Firefox (Playwright), the built page loads with no console errors and a probe `fetch` to another origin is blocked. Not yet verified: CI on GitHub, the GitHub Pages deploy (needs 17), and WebKit (needs `sudo npx playwright install-deps webkit` in WSL).
- 2026-10-25, agent: done. CI run 40205407675 (re-run after Pages was enabled) passed both jobs. https://josteitv.github.io/spondclub-klubbadmin-comparer/ serves version `0.1.0+1e8b8a2` with the CSP from `build/csp.ts`. Headless Chromium and Firefox load it with no console errors, and a probe `fetch` to another origin is blocked. The GitHub actions were bumped to current majors (`deploy-pages@v4` ran on deprecated Node 20). WebKit is still unchecked, pending `sudo npx playwright install-deps webkit`; it's tracked for 15, where the spec's browser check applies.
