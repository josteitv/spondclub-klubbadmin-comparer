# Build tool: what turns the TypeScript source into the static web page

Researched 2026-10-24 against official docs, GitHub releases and the npm registry. Resolves issue `../issues/07-build-tool.md`. Context: [ADR 0001](../../../docs/adr/0001-browser-only-static-web-page.md) (static page, CSP allowlist, SRI on CDN scripts).

## Answer

- **Recommendation: Vite 8**, with Vitest for tests and `tsc --noEmit` (or `svelte-check` if we pick Svelte) as a separate type-check step in CI. Vite is the tool both the Svelte and Preact teams point to [S20][S21]. It ships `svelte-ts` and `preact-ts` templates [S3], documents the GitHub Pages workflow and `base: '/<REPO>/'` setting [S1], and has a weekly patch cadence backed by VoidZero [S4][S5]. Vitest shares its config and provides jsdom/happy-dom environments plus a stable Browser Mode [S22][S23].
- **Gap in Vite: no built-in SRI.** The request has been open since 2021 (issue #2377, "Later" on the team board, draft PR #22311 for a `build.sri` option) [S6]. SRI comes from a third-party plugin: `vite-plugin-sri-gen` (active, 1.7.5 on 2026-10-14) [S7][S8], or `vite-plugin-csp-guard` (4.0.1, 2026-04-23, peer `vite ^8`), which also injects a CSP `<meta>` tag [S9][S10][S11].
- **Runner-up: Rsbuild 2** (Rspack-based, ByteDance Web Infra) [S12][S16]. It is the only candidate with **built-in SRI** (`security.sri`) [S13]. It also has official Svelte and Preact plugins and templates [S14][S15], a GitHub Pages deploy guide [S17], and its own test runner, Rstest, with jsdom/happy-dom [S18][S19]. It loses on ecosystem fit: neither framework team recommends it, and Rstest is still 0.x (0.12.4) [S8].
- **Ruled out:** **Parcel** (no SRI, issue open since 2018 [S27]; the Svelte transformer is community-made and stuck on Svelte 3 [S8]; no commits since 2026-02-02 [S28]). **esbuild alone** (no HTML entry, no HMR, Svelte via a community plugin, its author is "not doing active feature development" [S24][S25][S26]). **Bun's bundler** (no SRI, Svelte plugin 0.0.6 last released 2025-03 [S8][S30], Preact HMR undocumented). **Plain `tsc`** (does not bundle or resolve npm imports, cannot compile `.svelte`) [S33].
- **CSP allowlist: no tool derives it automatically.** Third-party domains (CDN, fonts, analytics, error reporting) have to be listed by hand whichever tool we pick. What a tool can do is inject the `<meta http-equiv="Content-Security-Policy">` tag from config (csp-guard for Vite [S10]; `html.meta` in Rsbuild [S34]) and hash inline scripts [S10]. Note that a `<meta>` CSP cannot carry `frame-ancestors`, `report-uri`, `sandbox` or Report-Only [S35]. A small CI test that scans `dist/index.html` for external origins and checks each one against the CSP would keep the list in sync. That is our own code, not a plugin.
- **No tool type-checks during the build.** Vite, Rsbuild, Parcel, esbuild and Bun all only strip types [S2][S12b][S29][S24]. Bun now has `bun check` [S31]. Every option needs `tsc --noEmit` (or `svelte-check`) in CI.

## Comparison

| | Vite 8 | Rsbuild 2 | Parcel 2 | esbuild alone | Bun bundler | plain `tsc` |
|---|---|---|---|---|---|---|
| Latest stable (date) | 8.3.5 (2026-10-21) [S8] | 2.2.14 (2026-10-19) [S8] | 2.16.4 (2026-02-02) [S8] | 0.28.2 (2026-08-08) [S8] | 1.4.4 (2026-10-22) [S8] | 7.0.2 (2026-08-20) [S8] |
| Backed by | VoidZero, with Bolt and NuxtLabs [S5] | ByteDance Web Infra [S16] | Open Collective; maintainer not named on repo [S28] | one author (evanw) [S25] | Oven, owned by Anthropic since 2025-12 [S32] | Microsoft |
| Static output, GH Pages base path | `base: '/<REPO>/'`; official GH Pages workflow [S1][S1b] | `output.assetPrefix: '/<REPO>/'`; GH Pages guide [S17] | `--public-url` [S29b] | hand-written HTML; `publicPath` option [S24b] | `--public-path`; HTML entry [S30b][S30] | n/a (no bundling) |
| TypeScript | strips only (Oxc); docs say run `tsc --noEmit` [S2] | strips only (SWC); `@rsbuild/plugin-type-check` or `tsc` [S12b] | strips only; experimental validator [S29] | strips only [S24] | strips only; `bun check` [S31] | type-checks, emits per-file JS [S33] |
| Svelte | official `@sveltejs/vite-plugin-svelte` 7.3.1; `svelte-ts` template [S3][S8] | `@rsbuild/plugin-svelte`; `svelte-ts` template [S14][S15] | community `parcel-transformer-svelte`, Svelte 3 only, 2021 [S8] | community `esbuild-svelte` [S8] | `bun-plugin-svelte` 0.0.6 (2025-03) [S8] | no |
| Preact | official `@preact/preset-vite` (Prefresh); `preact-ts` template [S3][S21] | `@rsbuild/plugin-preact` with Prefresh; `preact-ts` template [S14][S15] | "works out of the box" (JSX) [S21] | JSX options only [S24] | JSX via tsconfig [S30] | JSX emit, no HMR |
| SRI on emitted assets | plugin only (`vite-plugin-sri-gen`, `vite-plugin-csp-guard`) [S6][S7][S10] | **built in** `security.sri` [S13] | none; issue open since 2018 [S27] | none | none documented [S30][S30b] | n/a |
| SRI on third-party CDN tags | `vite-plugin-sri-gen` appears to fetch and hash remote URLs (inferred from options) [S7b] | only tags Rsbuild generates, not hand-written ones [S13] | no | no | no | no |
| CSP meta tag | `vite-plugin-csp-guard` injects it, hashes inline JS, works in dev [S10][S11] | manual via `html.meta` [S34] | manual | manual | manual | manual |
| Dev server | HMR | HMR | HMR [S29b] | live reload only, no JS HMR [S26] | HMR [S30] | none |
| Tests | Vitest 5.0.5: jsdom/happy-dom, stable Browser Mode [S22][S23] | Rstest 0.12.4: jsdom/happy-dom, experimental Browser Mode [S18][S19] | none of its own | none of its own | `bun test` + happy-dom [S30c] | none |
| Config burden | template + `base`, one SRI/CSP plugin | template + `assetPrefix` + `security.sri` | zero-config, but Svelte gap | write HTML + build script + reload by hand | template-less, Svelte plugin immature | import maps + CDN for every dependency |

## Details

### Vite 8 (Rolldown-based)

- **What it is now:** Vite 8.0 (2026-03-12) replaced the esbuild-for-dev / Rollup-for-build pair with **Rolldown**, and uses Oxc as the compiler. "Most existing Vite plugins work out of the box with Vite 8" [S5]. The separate "rolldown-vite" package is therefore no longer a choice: the Rolldown-based Vite *is* Vite 8. Rolldown itself is at 1.2.15 (2026-10-21) [S8]. Requires Node 20.19+ / 22.12+ [S3].
- **GitHub Pages:** the deploy guide gives a ready-made Actions workflow (`npm ci`, build, upload `./dist`, deploy) and says to set `base` to `'/<REPO>/'` for a project page [S1]. `base` also accepts `''` or `'./'` for relative paths [S1b], so moving to our own domain later is a one-line change or none.
- **TypeScript:** "Vite only performs transpilation on `.ts` files and does **NOT** perform type checking". Run `tsc --noEmit` with the build, use `vite-plugin-checker` for in-browser errors in dev, and set `isolatedModules: true` [S2].
- **Svelte/Preact:** `create-vite` has `svelte-ts` and `preact-ts` templates [S3]. The Svelte docs: "You can also use Svelte directly with Vite via vite-plugin-svelte … There are also plugins for other bundlers, but we recommend Vite" [S20]. The Preact docs: "If you're new to Preact, we recommend starting with Vite" [S21]. Plugin releases: `@sveltejs/vite-plugin-svelte` 7.3.1 (2026-09-23), `@preact/preset-vite` 2.10.6 (2026-07-18) [S8].
- **SRI:** not in core. Issue #2377 "Add native support for SRI" is open. A maintainer is "not sure about making this builtin", and draft PR #22311 (April 2026) proposes `build.sri` [S6]. Plugins:
  - `vite-plugin-sri-gen` 1.7.5: adds `integrity` to scripts, stylesheets and modulepreload links, preloads dynamic chunks, and has a CSP-safe runtime for dynamically created tags. "ESM-only, Node 18+, Vite 4+" [S7]. Its options include `fetchCache`/`fetchTimeoutMs` for "remote fetches" and URL globs in `skipResources`. That suggests it also hashes CDN URLs found in the HTML, but the docs do not say so in one sentence [S7b]. Single maintainer, first published 2025-08 [S8].
  - `vite-plugin-csp-guard` 4.0.1: declare the policy in `vite.config.ts`. It "injects a `<meta http-equiv="Content-Security-Policy">` by default", hashes top-level inline JS, runs the CSP in dev mode, and lists SRI as a feature. Svelte is supported out of the box. **Preact is not listed** among tested frameworks [S10][S11]. Default policy is `'self'` for default/img/script-src-elem/style-src-elem, and domains are added as plain strings [S11b].
- **Maintenance:** no fixed cycle, patches "usually every week", majors about yearly. 8.3 gets regular patches, and security fixes are backported to 7.3 and 6.4 [S4]. Backed by VoidZero "in partnership with Bolt and NuxtLabs" [S5].
- **Tests:** Vitest 5.0.5 (2026-10-15). Vitest 5 requires Vite 6.4+ and Node 22 [S22b]. `environment: 'jsdom' | 'happy-dom'` [S22]. Browser Mode lost its experimental tag in Vitest 4.0 (2025-10-22) [S23].

### Rsbuild 2 (on Rspack)

- Rsbuild 2.2.14 (2026-10-19) on Rspack 2.2.9 (2026-10-13), both releasing roughly weekly [S8]. Part of "Rstack", "led by ByteDance's web infra team" [S16]. Requires Node 20.19+ / 22.12+ [S15].
- **GitHub Pages:** an official guide with a full workflow and `output.assetPrefix: '/<REPO_NAME>/'` [S17].
- **TypeScript:** "When transpiling TypeScript code using tools like SWC and Babel, type checking isn't performed". Use `@rsbuild/plugin-type-check` (separate process, dev and build) or `tsc --noEmit` [S12b].
- **Svelte/Preact:** `svelte-ts` and `preact-ts` templates [S15]. `@rsbuild/plugin-svelte` 2.0.1 [S14][S8]. `@rsbuild/plugin-preact` 2.1.0 uses `@preact/prefresh` for HMR [S14b][S8].
- **SRI:** built in. `security.sri.enable: 'auto'` turns it on for production builds, and `algorithm` defaults to `sha384`. It "will only apply to the tags generated by Rspack and Rsbuild", so hand-written CDN `<script>` tags in the template still need hand-written hashes [S13].
- **CSP:** `security.nonce` exists but needs a fresh nonce per request [S36], which a static page cannot supply. A CSP `<meta>` can be emitted through `html.meta` with an object value (key/value become attributes) [S34]. No CSP generator.
- **Tests:** Rstest 0.12.4 (2026-10-19), "Jest-compatible API". It reuses the Rsbuild config [S18], supports `testEnvironment: 'jsdom' | 'happy-dom'` [S19], and has an experimental Browser Mode [S18b]. Pre-1.0.

### Parcel 2

- Latest 2.16.4 (2026-02-02). The last commit on the default branch is that release tag, so nothing has merged in about 9 months [S8][S28]. Open Collective funded, and the repo names no maintainer [S28].
- Zero-config. `--public-url` sets the path prefix. The dev server has HMR [S29b].
- TypeScript: "By default, Parcel does not perform any type checking", and `@parcel/validator-typescript` is experimental [S29].
- Svelte: no official transformer. The npm `parcel-transformer-svelte` is a community package (orlov-vo), last released 2021, peer `svelte ^3.0.0` [S8]. Current Svelte is 5. Preact: "works out of the box" per the Preact docs [S21].
- SRI: issue #2003 "Subresource Integrity" open since 2018-09-11 [S27]. The CLI docs mention neither SRI nor CSP [S29b].

### esbuild on its own

- 0.28.2 (2026-08-08), still pre-1.0. The FAQ calls it "a late-stage beta" and says "I'm not doing active feature development for esbuild at the moment". Svelte/Vue/Angular support is explicitly not planned for core [S25][S8].
- HTML is not a supported content type [S24][S25], so we would write `index.html` by hand and point it at the bundle.
- TypeScript: "esbuild _does not_ do any type checking" [S24]. Preact via `jsxImportSource`/`jsxFactory` [S24].
- Dev: `serve` + `watch` with an `EventSource('/esbuild')` snippet for **live reload**. "Hot-reloading for JavaScript is not currently implemented" [S26].
- Svelte: community `esbuild-svelte` 0.9.5 [S8]. No SRI/CSP support. We would script it ourselves.
- Tests: none bundled. Vitest would work but brings Vite in anyway.

### Bun's bundler

- Bun 1.4.4 (2026-10-22), releases every few weeks [S8]. Bun was acquired by Anthropic on 2025-12-02 and "stays open-source & MIT-licensed" [S32].
- HTML entry points: `bun ./index.html` starts a dev server, and `bun build ./index.html --outdir=dist` makes a production build [S30]. `--public-path` prefixes asset paths [S30b]. HMR is documented. React Fast Refresh is mentioned, but Preact refresh is not [S30d].
- TypeScript is transpiled only. `bun check` type-checks with "the same errors as `tsc` from TypeScript 7" [S31].
- Svelte: `bun-plugin-svelte` ("Official Svelte plugin for Bun") 0.0.6, last published 2025-03-26, peer `svelte ^5` [S8]. Preact HMR undocumented.
- SRI/CSP: neither the bundler page nor the HTML page mentions them [S30][S30b].
- Tests: `bun test` with happy-dom via a preload file [S30c]. It also means a second runtime (Bun) next to or instead of Node in CI.

### Plain `tsc`

- TypeScript 7.0.2 (2026-08-20) [S8]. `tsc` type-checks and emits one JS file per source file. It does not bundle: "the module specifier … is emitted as-written", and "TypeScript is not a host" [S33].
- So every npm import (Preact, the .xlsx parser) would need an import map pointing to a CDN, each with SRI. There would be no dev server, no HMR and no asset hashing. Svelte cannot be compiled at all. Preact would need JSX or HTM [S21].
- Only viable for Preact + HTM + CDN with no build step. That moves the .xlsx parser to a CDN, which works against the "bundled .xlsx parser" in our stack.

### Other contenders considered

- **webpack / Rspack directly:** Rsbuild is Rspack with defaults. Using Rspack or webpack raw means more configuration for the same output, so they were not evaluated separately.
- **Rolldown directly:** a bundler only (no HTML/dev server). Its practical form for us is Vite 8 [S5].

## Recommendation and reasoning

**Vite 8 + Vitest**, with `vite-plugin-sri-gen` for SRI. Use `vite-plugin-csp-guard` (if it works with the chosen framework) or a hand-written CSP `<meta>` in `index.html`, plus a CI test that every external origin in `dist/index.html` is in the CSP and every external `<script>`/`<link>` has `integrity`.

- It is the default path for both candidate frameworks [S20][S21]. Whichever of Svelte/Preact we pick, the templates, HMR plugins and docs assume Vite. That matters most for a volunteer project where whoever maintains it next will search for answers.
- One config drives build, dev server and tests (Vitest), with jsdom for unit tests and stable Browser Mode if we need real-browser tests [S22][S23].
- GitHub Pages is documented end to end, with a copy-paste workflow [S1].
- Health: weekly patches, a published support policy, a funded company behind it [S4][S5].

**Main trade-off against Rsbuild:** Rsbuild has SRI built in and maintained by the core team [S13]. With Vite it depends on a third-party plugin, which is the piece the ADR's security guarantee rests on. `vite-plugin-sri-gen` is young (2025-08) and has a single maintainer [S8]. If it stalls, it can be swapped for `vite-plugin-csp-guard`, or for a small `transformIndexHtml` hook of our own that hashes the emitted files. If native `build.sri` lands (PR #22311 [S6]), the plugin goes away. In exchange, Rsbuild costs us the framework teams' recommended path and a pre-1.0 test runner (Rstest 0.12) [S8]. On balance, Vite's ecosystem fit and simplicity outweigh one extra, replaceable plugin.

Neither tool solves the **CSP allowlist**. The third-party domains are a project decision, written once in config or `index.html`, and checked by our own test.

## Open / unverified

1. Whether `vite-plugin-sri-gen` hashes **third-party CDN** `<script>`/`<link>` tags in `index.html`. Its fetch options imply it, but the docs never state it [S7b]. Verify in a prototype. If not, hand-write the CDN hashes (CDNs publish them) and let the CI test check them.
2. Whether `vite-plugin-csp-guard` works with **Preact** (not on its tested list [S10]), and whether its built-in SRI and `vite-plugin-sri-gen` conflict if both are used. Pick one.
3. Whether `vite-plugin-sri-gen` is tested against Vite 8 / Rolldown specifically. Its README says "Vite 4+" and its peer range is `>=4.0.0` [S7][S8], but no Vite 8 test matrix was found.
4. Whether GitHub Pages lets us set response headers (which would allow `frame-ancestors` and reporting). No GitHub doc was checked. Treat as "no" and use `<meta>`, with the limits in [S35].
5. Who maintains Parcel today: the repo does not name a maintainer or sponsor [S28].
6. Whether Vitest's Browser Mode was declared stable again or changed in Vitest 5. The 5.0.0 notes do not say [S22b]. The 4.0 statement is [S23].
7. Build/dev speed figures were not compared. All candidates are fast enough for a single-page tool, and no primary benchmarks for this case were checked.

## Sources

- [S1] Vite, "Deploying a Static Site" (GitHub Pages section): https://vite.dev/guide/static-deploy
- [S1b] Vite config, `base`: https://vite.dev/config/shared-options#base
- [S2] Vite, "Features" (TypeScript transpile-only, `html.cspNonce`): https://vite.dev/guide/features
- [S3] Vite, "Getting Started" (templates, Node requirement, Rolldown): https://vite.dev/guide/
- [S4] Vite, "Releases" (support policy): https://vite.dev/releases
- [S5] Vite blog, "Vite 8.0 is out!" (2026-03-12): https://vite.dev/blog/announcing-vite8
- [S6] vitejs/vite issue #2377, "Add native support for SRI": https://github.com/vitejs/vite/issues/2377
- [S7] `vite-plugin-sri-gen` README: https://github.com/rbonestell/vite-plugin-sri-gen
- [S7b] `vite-plugin-sri-gen` configuration options: https://rbonestell.com/vite-plugin-sri-gen/configure/options
- [S8] Versions and dates from GitHub Releases (`https://github.com/<owner>/<repo>/releases`) and the npm registry (`https://registry.npmjs.org/<package>`), read 2026-10-24: vitejs/vite (v8.3.5), web-infra-dev/rsbuild (v2.2.14), web-infra-dev/rspack (v2.2.9), parcel-bundler/parcel (v2.16.4), evanw/esbuild (v0.28.2), oven-sh/bun (bun-v1.4.4), microsoft/TypeScript (v7.0.2), rolldown/rolldown (v1.2.15), vitest-dev/vitest (v5.0.5), npm: `@sveltejs/vite-plugin-svelte`, `@preact/preset-vite`, `vite-plugin-sri-gen`, `vite-plugin-csp-guard`, `@rsbuild/plugin-svelte`, `@rsbuild/plugin-preact`, `@rstest/core`, `parcel-transformer-svelte`, `esbuild-svelte`, `bun-plugin-svelte`
- [S9] `vite-plugin-csp-guard` repo: https://github.com/tsotimus/vite-plugin-csp-guard
- [S10] `vite-plugin-csp-guard` docs home (features, framework support): https://vite-csp.tsotne.co.uk
- [S11] `vite-plugin-csp-guard` SPA guide (meta injection, hashing, dev mode): https://vite-csp.tsotne.co.uk/guides/spa
- [S11b] `vite-plugin-csp-guard` policy guide: https://vite-csp.tsotne.co.uk/guides/policy
- [S12] Rsbuild repo: https://github.com/web-infra-dev/rsbuild
- [S12b] Rsbuild, "TypeScript": https://rsbuild.rs/guide/basic/typescript
- [S13] Rsbuild, `security.sri`: https://rsbuild.rs/config/security/sri
- [S14] Rsbuild, "Svelte": https://rsbuild.rs/guide/framework/svelte
- [S14b] Rsbuild, "Preact": https://rsbuild.rs/guide/framework/preact
- [S15] Rsbuild, "Quick start" (templates, Node requirement): https://rsbuild.rs/guide/start/quick-start
- [S16] Rspack, "Core team" (Rstack led by ByteDance web infra): https://rspack.rs/misc/team/core-team
- [S17] Rsbuild, "Deployment" (GitHub Pages): https://rsbuild.rs/guide/basic/deployment
- [S18] Rstest home: https://rstest.rs/
- [S18b] Rstest docs index (Browser Mode marked experimental): https://rstest.rs/llms.txt
- [S19] Rstest, `testEnvironment`: https://rstest.rs/config/test/test-environment
- [S20] Svelte docs, "Getting started": https://svelte.dev/docs/svelte/getting-started
- [S21] Preact docs, "Getting Started": https://preactjs.com/guide/v10/getting-started
- [S22] Vitest, `environment`: https://vitest.dev/config/environment
- [S22b] Vitest v5.0.0 release notes: https://github.com/vitest-dev/vitest/releases/tag/v5.0.0
- [S23] Vitest blog, "Vitest 4.0" (Browser Mode stable): https://vitest.dev/blog/vitest-4
- [S24] esbuild, "Content Types" (TypeScript, JSX): https://esbuild.github.io/content-types/
- [S24b] esbuild API (Public path option): https://esbuild.github.io/api/#public-path
- [S25] esbuild FAQ (production readiness, roadmap): https://esbuild.github.io/faq/
- [S26] esbuild API, "Live reload": https://esbuild.github.io/api/#live-reload
- [S27] parcel-bundler/parcel issue #2003, "Subresource Integrity": https://github.com/parcel-bundler/parcel/issues/2003
- [S28] parcel-bundler/parcel repo and commit history: https://github.com/parcel-bundler/parcel , https://github.com/parcel-bundler/parcel/commits
- [S29] Parcel, "TypeScript": https://parceljs.org/languages/typescript/
- [S29b] Parcel, "CLI": https://parceljs.org/features/cli/
- [S30] Bun, "HTML & static sites": https://bun.com/docs/bundler/html-static
- [S30b] Bun, "Bundler" (`publicPath`): https://bun.com/docs/bundler
- [S30c] Bun, "DOM testing": https://bun.com/docs/test/dom
- [S30d] Bun, "Hot reloading": https://bun.com/docs/bundler/hot-reloading
- [S31] Bun, "Type checking" (`bun check`): https://bun.com/docs/runtime/check
- [S32] Bun blog, "Bun is joining Anthropic" (2025-12-02): https://bun.com/blog/bun-joins-anthropic
- [S33] TypeScript handbook, "Modules - Theory": https://www.typescriptlang.org/docs/handbook/modules/theory.html
- [S34] Rsbuild, `html.meta`: https://rsbuild.rs/config/html/meta
- [S35] W3C, Content Security Policy Level 3, §3.3 "The `<meta>` element": https://www.w3.org/TR/CSP3/#meta-element
- [S36] Rsbuild, `security.nonce`: https://rsbuild.rs/config/security/nonce
