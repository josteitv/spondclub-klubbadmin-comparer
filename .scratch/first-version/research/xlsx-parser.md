# .xlsx parser: what the web page bundles to read the two exports

Researched 2026-10-25 against official docs, source repos, the npm registry, the SheetJS CDN and the GitHub Advisory Database, plus measurements in a scratch directory (bundle sizes, parse and write tests on a hand-built `.xlsx` with invented data). Resolves issue `../issues/08-xlsx-parser.md`. Context: [ADR 0001](../../../docs/adr/0001-browser-only-static-web-page.md) (static page, no network at runtime, CSP allowlist, SRI) and the Input section of `../spec.md`.

## Answer

- **Recommendation: `read-excel-file` 9.x** (MIT) for the page, with **`write-excel-file`** (MIT, same author) plus a small **`fflate`-zipped hand-written XML** helper for test fixtures. It is the smallest real library (16.7 kB min+gz under Vite 8 [S29]). It has TypeScript types per entry point [S1] and no advisories [S23]. It was released 9 days ago (9.3.12, 2026-10-07) [S1][S19]. In our test it returned every case the exports need correctly: shared strings, inline strings, a `dd\.mm\.yyyy` date serial as a `Date`, a `@`-formatted text cell `"00123"` kept as a string, and the trailing empty row dropped [S30]. The README documents date detection from the number format and says "only empty rows at the end of a sheet are ignored" [S18]. Two caveats. It has one maintainer and has shipped four majors in 13 months (6.0 2025-09, 7.0 2026-02, 8.0 2026-03, 9.0 2026-04) [S1], so pin the major. And the `/browser` entry runs the parser in a Web Worker created from a `Blob` URL [S18][S31], which needs `worker-src blob:` in the CSP. The `/universal` entry avoids that. See Open item 1.
- **Runner-up: hand-rolled, with `fflate` `unzipSync` + `DOMParser`.** It adds about 3 kB min+gz [S29]. It is MIT, has no transitive dependencies, and creates no workers. fflate is actively maintained: 0.8.3 on 2026-05-16 fixed GHSA-px8p-9vwx-vf98 [S21][S22]. We would own about 150–250 lines covering workbook → sheet lookup, shared strings (including rich-text runs), `cellXfs` → `numFmtId` date detection, inline strings and serial → date conversion. It is the fallback if `read-excel-file`'s churn or bus factor becomes a problem. It is also what tests already use to build edge-case files [S30].
- **Viable but not chosen: SheetJS CE 0.20.3** (`xlsx`, Apache-2.0). It handles everything, exposes the number format (`cellNF`) and `SSF.is_date`, and the same library writes test files [S7][S30]. Against it: it is 120 kB min+gz tree-shaken (86 kB for the "mini" build), 7× the recommendation [S29]. It is not on npm, so you install it from a `cdn.sheetjs.com` tarball or vendor it [S2][S3]. There has been no release since 2024-07-18, although commits continued until 2026-02-09 [S5]. Its Vite demo is only tested up to Vite 7.3.1 [S9]. Apache-2.0 also requires shipping its licence text with the bundle [S24].
- **Ruled out:**
  - **`xlsx` from the npm registry (0.18.5, 2022-03-24).** SheetJS calls the registry copy "out of date" [S3]. `npm audit` flags it high, with "No fix available", for prototype pollution (CVE-2023-30533, fixed in 0.19.3) and ReDoS (CVE-2024-22363, fixed in 0.20.2) [S11][S12][S28].
  - **ExcelJS 4.4.0.** It is 255 kB min+gz [S29]. The last release was 2023-10-19, the last commit on the default branch 2024-01-12, and 819 issues are open [S1][S15]. It pulls in deprecated `uuid@8`, which has moderate advisory GHSA-w5hq-g745-h8pq [S16][S28].
  - **Third-party republishes of SheetJS** (`@e965/xlsx`; `node-xlsx`, which depends on the 0.20.2 CDN tarball and targets Node). They add a supply-chain hop for no gain [S1].
  - **`xlsx-populate`** (last release 1.21.0, 2020-03-01) [S1].
  - **HyperFormula** (GPL-3.0, a formula engine, not a file parser) [S1].
- **Offline / SRI:** every candidate is bundled into our own Vite chunk. No candidate makes network requests at runtime, so SRI applies only to our own emitted assets, as described in the build-tool research. The only install-time network dependency that differs is SheetJS's `cdn.sheetjs.com` tarball. npm records its `sha512` integrity in `package-lock.json` (observed for a `file:` install) [S28], and SheetJS itself recommends committing the tarball under `vendor/` [S3].

## Comparison

| | read-excel-file (+ write-excel-file) | hand-rolled: fflate + DOMParser | SheetJS CE (`xlsx`) | ExcelJS |
|---|---|---|---|---|
| Latest (date) | 9.3.12 (2026-10-07); writer 4.1.1 (2026-06-08) [S1] | fflate 0.8.3 (2026-05-16) [S1] | 0.20.3 (2024-07-18) on CDN; npm stuck at 0.18.5 (2022-03-24) [S1][S2][S5] | 4.4.0 (2023-10-19); 4.4.1-prerelease.0 (2024-12-20) [S1] |
| Licence | MIT [S1] | MIT (fflate) + our MIT code [S1] | Apache-2.0, attribution required [S2][S24] | MIT [S1] |
| Maintainers / activity | 1 (catamphetamine); last commit 2026-10-07; 4 majors since 2025-09 [S1][S19] | 1 (101arrowz); last commit 2026-05-16 [S21]; rest is ours | SheetJS LLC; last commit 2026-02-09, no release in 15 months [S5] | 2 listed; last commit 2024-01-12, 819 open issues [S1][S15] |
| Distribution | npm registry | npm registry | CDN tarball or vendored `.tgz`; "registry is out of date" [S3] | npm registry |
| Vite 8 build | builds (measured) [S29] | builds (measured) [S29] | builds (measured) [S29]; demo tested to Vite 7.3.1 [S9] | builds via `browser` field → UMD `dist/exceljs.min.js` [S1][S29] |
| Min+gz in Vite 8 bundle | 16.7 kB (`/browser`); 17.7 kB (`/universal`, esbuild) [S29] | 3.3 kB [S29] | 120 kB tree-shaken ESM; mini build 86 kB [S29] | 255 kB [S29] |
| Runtime network | none; `/browser` spawns a `Blob`-URL worker [S18][S31] | none, no workers with `unzipSync` | none | none |
| TypeScript | bundled `.d.ts` per entry [S1] | fflate `.d.ts`; our code is TS | bundled `types/index.d.ts` [S2] | bundled `index.d.ts` [S1] |
| Advisories | none (GitHub DB, incl. deps `saxen`, `unzipper-esm`) [S23] | fflate < 0.8.3 infinite loop on bad ZIP64, fixed [S22] | 0.18.5: 2 high, unfixed on npm; 0.20.3: none known [S10][S11][S12] | `uuid@8` dep: moderate [S16]; old XSS < 1.6.0 [S17] |
| Shared strings / inline strings | yes / yes [S30] | we implement both | yes / yes [S30] | yes / yes [S30] |
| `dd\.mm\.yyyy` serial → date | `Date` (UTC midnight), auto-detected [S18][S30] | we map `s` → `cellXfs` → `numFmt` and test it | number + `z` with `cellNF`; `SSF.is_date`; or `cellDates` [S7][S8][S30] | `Date` + `numFmt` [S30] |
| `@` text cell holding digits | string `"00123"` kept; numeric `<v>` under `@` → number [S30] | as we decide | same as left [S30] | same as left [S30] |
| Trailing empty row | dropped [S18][S30] | we skip rows with no values | `!ref` includes it; `sheet_to_json(..., {blankrows:false})` drops it [S30] | `rowCount` 3 vs `actualRowCount` 2 [S30] |
| Strings trimmed | yes by default; `trim: false` to disable [S18] | as we decide | no | no |
| Writes `.xlsx` for tests | `write-excel-file/node` `.toBuffer()` (shared strings, custom formats) [S20][S30] | `fflate.zipSync` of hand-written XML (only way to get `inlineStr`) [S30] | `XLSX.write` (`bookSST:true` → shared strings, `false` → `t="str"`) [S30] | `xlsx.writeBuffer()` [S30] |

## Details

### What the exports need, and how it was tested

From the spec: the Spond Club file has an Excel date serial shown as `dd.mm.yyyy` and other text columns. The KlubbAdmin file has "every cell" as text, including `dd.mm.yyyy` dates and trailing empty rows. To test without touching real data, a script in the scratch directory built `t.xlsx` from hand-written SpreadsheetML zipped with `fflate.zipSync`, using invented values. It contains a shared-string header row and a shared string (`Ola`). It also has an inline string (`Nordmann`), serial `36892` with custom `numFmt` 164 `dd\.mm\.yyyy`, an inline string `"00123"` with style `@` (`numFmtId` 49), a numeric `4567` with style `@`, and a trailing row 3 holding only styled empty cells. Each library parsed it in Node 24 [S30]:

- **read-excel-file** `/node` and `/universal`: `[["Fornavn","Etternavn","Fødselsdato","Kode","Tall"],["Ola","Nordmann",2001-01-01T00:00:00.000Z,"00123",4567]]`. Row 3 is gone.
- **SheetJS 0.20.3** (default options): C2 `{t:"n", v:36892, w:"01.01.2001"}`. With `cellNF:true`, `z:"dd\.mm\.yyyy"` and `SSF.is_date(z) === true`. With `cellDates:true`, a `d` cell. D2 is the string `"00123"`. `!ref` is `A1:E3`, but row 3 has no cell objects.
- **ExcelJS 4.4.0**: C2 is a `Date` with `numFmt "dd.mm.yyyy"`, D2 `"00123"` and E2 `4567`. `rowCount` is 3 and `actualRowCount` is 2.

All three treat a numeric `<v>` under an `@` style as a number. In the real KlubbAdmin export the "text" cells are presumably stored as strings (`t="s"`), which every library returns as strings. Confirming that against the real file is out of scope here (see Open item 3).

### read-excel-file 9.x (+ write-excel-file 4.x)

- **What it is:** "Read `.xlsx` files in a browser or Node.js", with optional schema parsing [S18]. Its entry points are `/browser` (uses Web Workers), `/web-worker` (no worker spawning, for use inside your own worker), `/universal` (Blob/ArrayBuffer, "can't use workers … single-threaded") and `/node` [S18]. Its dependencies are `fflate ^0.8.3`, `saxen`, `unzipper-esm` (Node stream path) and `worker-f`, all MIT [S1].
- **Worker mechanism:** `worker-f`'s browser code does `URL.createObjectURL(new Blob([...]))` and then `new Worker(url)` [S31]. Under our CSP that needs `worker-src blob:`. A missing `worker-src` falls back to `child-src`, then `script-src`. For the page, use `/universal` (no worker) for files this small, or keep `/browser` and allow `blob:` workers. fflate's async `unzip()` is also used, and its README says it goes asynchronous only for files over 512 kB [S18]. That may also use a blob worker. Not verified for `/universal`.
- **Dates:** "By looking at the template, one could guess if it's a number or a date. This package seems to guess correctly" [S18]. Since 9.0, schema `type: Date` requires a `Date` from the reader [S18]. The cell parser also handles `t="str"`, `inlineStr`, `b`, `e` and the 1904 epoch [S31].
- **Empty rows / trimming:** "only empty rows at the end of a sheet are ignored". Empty rows in the middle are kept [S18]. Strings are trimmed by default [S18], which suits name matching but should be a conscious choice.
- **Churn:** majors 6.0.0 (2025-09-12), 7.0.0 (2026-02-23), 8.0.0 (2026-03-29), 9.0.0 (2026-04-18) [S1]. The README carries migration notes for each, for example the renamed default export and the changed return shape [S18]. Pin `~9`.
- **Tests:** `write-excel-file/node` returns `{toBuffer, toStream, toFile}` [S20]. It wrote shared strings, a `dd.mm.yyyy` date cell and an `@` string cell, and `read-excel-file` read them back [S30]. It cannot emit `inlineStr`, and neither can SheetJS or ExcelJS. For that case, zip the XML with fflate in a test helper, as above.

### Hand-rolled: fflate + DOMParser

- fflate is "High performance (de)compression in an 8kB package", MIT, ESM with types [S21]. `unzipSync` plus `strFromU8`, with `DOMParser` over `xl/worksheets/sheetN.xml`, measured 3.3 kB min+gz in a Vite 8 bundle [S29].
- What we would write: resolve the first sheet via `xl/workbook.xml` + `xl/_rels/workbook.xml.rels`; load `xl/sharedStrings.xml` (concatenate `<t>` inside `<r>` runs); load `xl/styles.xml` `cellXfs` → `numFmtId`, treating built-in IDs 14–22 and custom `numFmt` codes with `d`/`m`/`y` tokens outside quotes as dates; read cells by `r` reference (cells can be sparse); handle `t` = `s` / `inlineStr` / `str` / `b` / `e` / `n`; convert serials as `Date.UTC(1899, 11, 30) + serial × 86 400 000`, which is valid for serials ≥ 61 because of the 1900 leap-year bug [S8].
- `DOMParser` exists in browsers and in Vitest's `jsdom`/`happy-dom` environments, but not in plain Node, so parser tests need one of those environments.
- Pros: no worker, no CSP change, no third-party parsing logic, tiny. Cons: correctness and edge cases are ours, and so is the risk of the formats drifting.
- Alternative unzip libraries: `@zip.js/zip.js` 2.24.0 (BSD-3-Clause, much larger package) and `jszip` 3.10.2 ("MIT OR GPL-3.0", older advisories fixed in 3.8.0) [S1][S27]. Neither beats fflate here.

### SheetJS CE (`xlsx`)

- **Distribution:** "Older releases are technically available on the public npm registry as `xlsx`, but the registry is out of date. The latest version on that registry is 0.18.5 … The SheetJS CDN https://cdn.sheetjs.com/ is the authoritative source" [S3]. Install with `npm i --save https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`, or vendor the `.tgz` and install `file:vendor/xlsx-0.20.3.tgz` [S3]. The CDN version list ends at 0.20.3 [S2].
- **Licence:** "Apache 2.0 License … a permissive license with certain attribution requirements" [S2]. It is compatible with distributing inside an MIT project. §4 requires giving recipients a copy of the licence [S24]. The `/*! xlsx.js (C) 2013-present SheetJS */` banner was not kept in our Vite 8 output [S29], so enable Vite's `build.license` (emits `.vite/license.md`) or ship a third-party licence file [S25].
- **Maintenance:** the GitHub repo's last commit is "exit stage left" (2024-02-01), and development moved to git.sheetjs.com [S6]. There, tags run to v0.20.3 (2024-07-18) and commits to 2026-02-09 ("sheet_to_html sanitize links option") [S5]. Unreleased fixes sit on `master` [S5].
- **Advisories:** SheetJS lists CVE-2023-30533 and CVE-2024-22363 [S10]. GHSA marks `xlsx < 0.19.3` and `< 0.20.2` with no npm patched version, because the fixes were never published to npm [S11][S12]. The 2021 "SheetJS Pro" DoS advisories cover `< 0.17.0` [S13]. The docs call Snyk's continued prototype-pollution warnings on fixed versions "false positives" [S3]. `npm audit` did not flag the CDN-tarball install in our scratch project [S28].
- **Features:** `cellNF` "Save number format to the `z` field", `cellDates` "Generate proper date (type `d`) cells", `dateNF`, `dense`, `sheetRows` [S7]. "Date and time handling was overhauled in version 0.20.0" [S8].
- **Vite:** "SheetJS library version 0.18.10 added the required metadata" for Vite. The demo table lists Vite 7.3.1 … 3.2.11, tested 2026-01-28, using `--no-rolldown` [S9]. A plain Vite 8.3.5 build of `import { read, utils } from 'xlsx'` succeeded [S29].

### ExcelJS

- "Excel Workbook Manager", MIT, 15.5k stars. The repo was last pushed 2025-01-21, the last default-branch commit is 2024-01-12, and 819 issues are open [S15]. The npm `latest` tag is 4.4.0 (2023-10-19) [S1].
- Its browser support is a browserified bundle in `dist/` ("A portion of this library has been isolated and tested for use within a browser environment") [S14]. Vite picks it up via the `browser` field, at 255 kB min+gz [S29]. Its Node dependencies (`archiver`, `unzipper`, `tmp`, `uuid@8`) still install, and `npm audit` reports GHSA-w5hq-g745-h8pq via `uuid` [S16][S28].
- Functionally fine for our cases [S30], but the weight and stalled maintenance rule it out.

### Other candidates considered

- **`@e965/xlsx`**: an npm republish of SheetJS 0.20.3 by a third party (`e965/sheetjs-npm-publisher`) [S1]. It solves the npm-registry gap but adds an unofficial publisher to the supply chain. Prefer vendoring the official tarball.
- **`node-xlsx`**: Apache-2.0, depends on the SheetJS 0.20.2 CDN tarball, last published 2024-04-15 [S1]. A Node convenience wrapper, no gain.
- **`xlsx-populate`**: MIT, last release 2020-03-01, depends on `jszip` and `lodash` [S1]. Stale.
- **HyperFormula**: GPL-3.0-only, a formula engine [S1]. Wrong tool and wrong licence.
- **SheetJS Pro**: commercial. Not evaluated.

## Recommendation and reasoning

**Use `read-excel-file` (pin `~9`, `/universal` entry in the page, `/node` or `/universal` in Vitest).** For fixtures, use `write-excel-file/node` with invented data, plus a ~30-line `fflate.zipSync` helper for the cases no writer emits (inline strings, styled empty trailing rows).

- It returns what the comparer needs: strings, `Date` for the Spond date, strings for KlubbAdmin's text dates, and trailing empty rows dropped. Our own column/required-field logic sits on top of `rows[0]` as the header row. Its schema feature is optional and not needed.
- It is about 17 kB on the page, MIT, typed, has no advisories, and is on the npm registry, so it needs no special install or vendoring path.
- It is actively maintained today, with a commit and release 2026-10-07.

**Main trade-off:** one maintainer and frequent breaking majors. The library is small and our use of it is one function call, so moving to the hand-rolled fflate parser later (the runner-up, about 3 kB) is a contained change. A fixture suite built from hand-written XML would catch any behavioural drift on upgrade. SheetJS stays the "it handles anything" fallback, at 7× the size and with CDN/vendoring friction.

## Open / unverified

1. ~~Whether `read-excel-file/universal` can still spawn fflate's blob worker on larger inputs.~~ Checked in the 9.3.12 source on 2026-10-25: `modules/export/readXlsxFileUniversal.js` sets `createWorkerFunction = undefined` ("there seems to be no way to use `Worker` in a 'universal' export"), and unzipping goes through `modules/zip/unzipFromArrayBufferSync.js`, which uses fflate's synchronous `unzipSync`. So `/universal` creates no workers at any file size and works under `worker-src 'none'`. A large file parses on the main thread.
2. Whether the `/universal` export behaves the same as `/browser` in a real browser (only Node was tested [S30]). Also how fast either is on the real file sizes.
3. ~~How the real KlubbAdmin "text" cells are encoded.~~ Answered by the structure profile in ticket 03 (2026-10-25): KlubbAdmin's name and date cells are shared strings (`t="s"`) with the `@` format, and `PersonId` is stored as a number under `@` (the tool doesn't use it). Spond Club's `Fødselsdato` is a number with a `dd.mm.yyyy` format. All of these are cases the test above covered.
4. Whether npm records `integrity` in `package-lock.json` for a `https://cdn.sheetjs.com/...tgz` dependency the same way it does for a `file:` tarball. Observed only for `file:` [S28]. Moot unless SheetJS is chosen.
5. read-excel-file's bus factor: one maintainer [S1]. Its GitHub repo is a mirror of the GitLab home [S18][S19]. Who reviews releases was not checked.
6. Bundle sizes are our own measurements (Vite 8.3.5 / esbuild, minified, `gzip -9`) of a minimal import per library [S29]. They are not published figures. Real app usage may pull in slightly more.

## Sources

- [S1] npm registry metadata (`npm view <pkg>` / `https://registry.npmjs.org/<pkg>`), read 2026-10-25: `read-excel-file` (9.3.12; majors 6.0.0–9.0.0 dates; deps, exports, types), `write-excel-file` (4.1.1), `fflate` (0.8.3, 2026-05-16), `xlsx` (0.18.5, 2022-03-24), `exceljs` (4.4.0, 2023-10-19; dist-tags; deps; `browser` field), `@zip.js/zip.js` (2.24.0), `jszip` (3.10.2), `xlsx-populate` (1.21.0, 2020-03-01), `node-xlsx` (0.24.0), `@e965/xlsx` (0.20.3), `hyperformula` (3.5.0, GPL-3.0-only), `saxen`, `unzipper-esm`, `worker-f`
- [S2] SheetJS CDN index (licence statement, release list, vendoring advice): https://cdn.sheetjs.com/ and version list https://cdn.sheetjs.com/xlsx.lst
- [S3] SheetJS docs, "Frameworks and Bundlers" installation (CDN tarball, vendoring, "registry is out of date", Snyk note): https://docs.sheetjs.com/docs/getting-started/installation/frameworks
- [S5] SheetJS source repo, commits and tags (Gitea API): https://git.sheetjs.com/sheetjs/sheetjs , https://git.sheetjs.com/api/v1/repos/sheetjs/sheetjs/commits , https://git.sheetjs.com/api/v1/repos/sheetjs/sheetjs/tags ; CHANGELOG.md in the 0.20.3 tarball
- [S6] SheetJS GitHub mirror (last commit 2024-02-01, "New home" notice): https://github.com/SheetJS/sheetjs
- [S7] SheetJS docs, "Reading Files" parse options: https://docs.sheetjs.com/docs/api/parse-options
- [S8] SheetJS docs, "Dates and Times" (date codes, 1900/1904 epochs, 0.20.0 overhaul): https://docs.sheetjs.com/docs/csf/features/dates
- [S9] SheetJS docs, "Bundling Sheets with ViteJS" (tested versions, metadata note): https://docs.sheetjs.com/docs/demos/frontend/bundler/vitejs
- [S10] SheetJS Security Advisories: https://cdn.sheetjs.com/advisories/
- [S11] GHSA-4r6h-8v6p-xvw6 / CVE-2023-30533, Prototype Pollution in sheetJS (`< 0.19.3`): https://github.com/advisories/GHSA-4r6h-8v6p-xvw6
- [S12] GHSA-5pgg-2g8v-p4x9 / CVE-2024-22363, SheetJS ReDoS (`< 0.20.2`): https://github.com/advisories/GHSA-5pgg-2g8v-p4x9
- [S13] GHSA-3x9f-74h4-2fqr, GHSA-8vcr-vxm8-293m, GHSA-g973-978j-2c3p (CVE-2021-32012/13/14, `< 0.17.0`): https://github.com/advisories?query=xlsx
- [S14] ExcelJS README (Browserify, Browser sections): https://github.com/exceljs/exceljs#browser
- [S15] ExcelJS repo metadata and commits (GitHub API): https://github.com/exceljs/exceljs , https://github.com/exceljs/exceljs/commits
- [S16] GHSA-w5hq-g745-h8pq, uuid missing buffer bounds check: https://github.com/advisories/GHSA-w5hq-g745-h8pq
- [S17] GHSA-2j2j-8rrv-264g / CVE-2018-16459, XSS in exceljs `< 1.6.0`: https://github.com/advisories/GHSA-2j2j-8rrv-264g
- [S18] read-excel-file README (entry points, workers, Strings, Dates, migration notes, empty rows): https://gitlab.com/catamphetamine/read-excel-file (also in the 9.3.12 package)
- [S19] read-excel-file GitHub mirror, commits (last 2026-10-07): https://github.com/catamphetamine/read-excel-file/commits
- [S20] write-excel-file README (Node.js `toBuffer`/`toStream`/`toFile`, cell `format`): https://gitlab.com/catamphetamine/write-excel-file
- [S21] fflate README and repo: https://github.com/101arrowz/fflate
- [S22] GHSA-px8p-9vwx-vf98 / CVE-2026-45820, fflate `unzipSync` infinite loop on malformed ZIP64 (fixed 0.8.3): https://github.com/advisories/GHSA-px8p-9vwx-vf98
- [S23] GitHub Advisory Database queries for `read-excel-file`, `write-excel-file`, `saxen`, `unzipper-esm` (none found), read 2026-10-25: `https://api.github.com/advisories?ecosystem=npm&affects=<pkg>`
- [S24] Apache License 2.0, §4 Redistribution: https://www.apache.org/licenses/LICENSE-2.0
- [S25] Vite, `build.license` ("emit a `.vite/license.md` file that includes all bundled dependencies' licenses"), from Vite 8.3.5's `BuildOptions` type docs: https://vite.dev/config/build-options
- [S27] jszip advisories GHSA-36fh-84j7-cv5h, GHSA-jg8v-48h5-wgxg: https://github.com/advisories?query=jszip
- [S28] Measured 2026-10-25: `npm audit` on a lockfile with `xlsx@0.18.5` (high, both GHSAs, "No fix available"). Also `npm audit` and `package-lock.json` in a scratch project with `exceljs`, `read-excel-file`, `write-excel-file`, `fflate` and the SheetJS 0.20.3 tarball installed from `file:` (only `uuid` via `exceljs` flagged; `xlsx` entry has `sha512` integrity).
- [S29] Measured 2026-10-25: minimal import per library bundled with Vite 8.3.5 (and esbuild for the mini/universal variants), minified, `gzip -9`. read-excel-file `/browser` 54,226 B / 16,716 B gz; `/universal` 63,774 / 17,717 (esbuild); fflate `unzipSync`+`strFromU8` 6,460 / 3,311; SheetJS 0.20.3 `read`+`utils` 362,795 / 120,410; SheetJS `xlsx.mini.min.js` 271,561 / 87,038 (esbuild; shipped dist files: mini 86,140, core 159,828, full 334,038 gz); ExcelJS 931,190 / 255,461.
- [S30] Measured 2026-10-25: a hand-built `.xlsx` with invented data (shared strings, inline string, serial 36892 with `numFmt` `dd\.mm\.yyyy`, `@`-styled string `"00123"` and number `4567`, trailing row of styled empty cells), zipped with `fflate.zipSync`. Parsed in Node 24 with read-excel-file 9.3.12, SheetJS 0.20.3 and ExcelJS 4.4.0. Fixtures were also written with write-excel-file 4.1.1, SheetJS and ExcelJS, and their sheet XML inspected.
- [S31] `read-excel-file` 9.3.12 and `worker-f` 0.1.20 package source (`modules/xlsx/parseCell.js`; `worker-f/lib/environment/createWorkerInBrowser.js`: `URL.createObjectURL(new Blob(...))`, `new Worker(url)`): https://gitlab.com/catamphetamine/read-excel-file , https://www.npmjs.com/package/worker-f
