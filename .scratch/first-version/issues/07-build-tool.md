# Which build tool produces the static web page?

Type: research
Status: open

## Question

Which build tool should turn the TypeScript source (with Svelte or Preact) into the static files for the web page? Compare Vite with alternatives such as esbuild on its own, Rspack/Rsbuild, Parcel, Bun's bundler and plain `tsc`. Criteria: static output for GitHub Pages (and later our own domain), TypeScript, Svelte/Preact support, generating Subresource Integrity hashes and a CSP allowlist (see [ADR 0001](../../../docs/adr/0001-browser-only-static-web-page.md)), a fast test setup, maintenance health and simplicity. Cite primary sources (official docs, release notes).
