# Which build tool produces the static web page?

Type: research
Status: resolved

## Question

Which build tool should turn the TypeScript source (with Svelte or Preact) into the static files for the web page? Compare Vite with alternatives such as esbuild on its own, Rspack/Rsbuild, Parcel, Bun's bundler and plain `tsc`. Criteria: static output for GitHub Pages (and later our own domain), TypeScript, Svelte/Preact support, generating Subresource Integrity hashes and a CSP allowlist (see [ADR 0001](../../../docs/adr/0001-browser-only-static-web-page.md)), a fast test setup, maintenance health and simplicity. Cite primary sources (official docs, release notes).

## Answer

- **Decision: Vite (8.x) with Vitest.** Both Svelte and Preact recommend it, and Vite ships `svelte-ts` and `preact-ts` templates. Its docs include a GitHub Pages workflow and base-path setup for a project page. It is actively maintained and backed by VoidZero. Vitest covers jsdom, happy-dom and Browser Mode.
- **SRI:** Vite has no built-in SRI yet (a draft PR exists), so use a third-party plugin such as `vite-plugin-sri-gen` until it lands. Whether that plugin hashes CDN scripts and is tested on Vite 8 is unverified and must be checked when it's set up.
- **Runner-up:** Rsbuild, the only candidate with built-in SRI. Rejected because neither framework recommends it and its test runner (Rstest) is still pre-1.0.
- **Ruled out:**
  - Parcel: no SRI, Svelte 3 only, stalled.
  - esbuild alone: no HTML entry or hot reload.
  - Bun's bundler: no SRI, immature Svelte plugin.
  - Plain `tsc`: doesn't bundle or compile Svelte.
- **Applies regardless of tool:**
  - No bundler type-checks, so CI runs `tsc --noEmit` / `svelte-check`.
  - The CSP allowlist is maintained by hand, kept in sync by a CI test against the built `index.html`.

Details: [../research/build-tool.md](../research/build-tool.md)
