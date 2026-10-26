# Which .xlsx parser does the web page bundle?

Type: research
Status: resolved

## Question

Which library should the static, browser-only web page bundle to read the Spond Club and KlubbAdmin `.xlsx` exports? Compare candidates such as SheetJS (xlsx), ExcelJS, read-excel-file and a minimal unzip + XML approach (e.g. fflate). Criteria: licence (the repo is MIT), maintenance health and how it is distributed (SheetJS no longer publishes to npm), bundle size, runs fully in the browser with no network at runtime (offline-version constraint, [ADR 0001](../../../docs/adr/0001-browser-only-static-web-page.md)), TypeScript types, known security advisories, and whether it handles what the exports need: shared strings, Excel date serials with `dd.mm.yyyy` format, text-formatted cells, a trailing empty row. Also: can tests generate `.xlsx` files with invented data using the same or a companion library. Cite primary sources.

## Answer

- **Decision: `read-excel-file` 9.x** (MIT), imported from `read-excel-file/universal` and pinned to `~9`. It is about 17 kB gzipped and has TypeScript types and no advisories. In a test with invented data it handled every case the exports need: shared strings, inline strings, `dd.mm.yyyy` date serials returned as dates, `@`-formatted text cells, and a trailing empty row.
- **No CSP change needed.** The `/universal` entry never starts a Web Worker; it unzips with fflate's synchronous `unzipSync` (checked in the 9.3.12 source). The `/browser` entry is not used, because its `blob:` worker would need `worker-src blob:`.
- **Contained behind our own module.** Only one module that reads the exports imports the library. The reason is its bus factor (one maintainer) and churn (four major versions in 13 months). If it becomes a problem, that module can switch to our own parser on `fflate` + `DOMParser` (the runner-up) without touching the rest.
- **Test fixtures:** generated with the companion `write-excel-file`, plus a small `fflate`-zipped hand-written XML helper for cases it can't write (e.g. inline strings).
- **Still to confirm:** behaviour and speed in a real browser; only Node was tested. The first build checks it.
- **Ruled out:**
  - SheetJS CE: 120 kB, no release since 2024-07, not on npm.
  - `xlsx` 0.18.5 on npm: two high-severity advisories with no fix.
  - ExcelJS: 255 kB, unmaintained since 2023.
  - `xlsx-populate`, HyperFormula, and republished copies of SheetJS.

Details: [../research/xlsx-parser.md](../research/xlsx-parser.md)

## Comments

- 2026-10-26, agent (ticket 13): Open item 1 was wrong. In 9.3.12 `/universal` unzips with fflate's async `unzip()` (`modules/zip/unzipFromArrayBuffer.js`), not `unzipSync`; entries over 512 KiB go to a `blob:` worker, which the page CSP blocks, and the read hangs. `unzipFromArrayBufferSync.js` exists but nothing uses it, and it is broken. Worked around in 13 with a Vite plugin that gives read-excel-file a synchronous fflate `unzip()`; see [13](13-read-spond-club.md). The decision to use read-excel-file stands; the hand-rolled parser remains the fallback.
