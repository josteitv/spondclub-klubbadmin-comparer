# Read the Spond Club export

Type: task
Status: resolved
Blocked by: 11

## What to build

Our own export-reading module, the only place that imports `read-excel-file` ([08](08-xlsx-parser.md)): `read-excel-file/universal`, pinned to `~9`. This ticket adds the module and the Spond Club reader. See [spec](../spec.md) "Input" and the structure confirmed in [03](03-sample-exports.md).

- `identifyExport(file)`: reads the header row and says whether this is a Spond Club export, a KlubbAdmin export or neither, from the required columns. 14 adds the KlubbAdmin side.
- `readSpondClubExport(file)`:
  - required columns: `Medlemstype`, `Medlem fornavn`, `Medlem etternavn`, `Fødselsdato`, `Grupper`;
  - other columns are ignored;
  - keeps rows with `Medlemstype = Medlem` and counts the `Ikke medlem` rows;
  - skips and counts rows with both name fields empty;
  - `Fødselsdato` is an Excel date serial: return it as a date (or empty), displayed `dd.mm.yyyy`;
  - `Grupper` is kept as-is, never split.
- Errors are typed values with a clear Norwegian/English message key: not an `.xlsx`, a missing required column (named), an empty sheet. Never guess.
- Test fixtures are generated in the tests with `write-excel-file`, plus a small `fflate` helper for what it can't write. All data is invented; nothing is copied from `.private/` (see CLAUDE.md).

## Acceptance criteria

- [x] Tests on generated files that mirror the confirmed Spond Club structure: `Medlem` / `Ikke medlem` filtering and counting; date serial → date; missing birth date; `Grupper` with `", "` inside a group name kept whole; a row without a name skipped and counted; extra columns ignored; each required column missing → its error.
- [x] `read-excel-file` is imported only inside this module.
- [x] Works under the strict CSP from 11 (no worker, no network), checked in a real browser via the built page or a Vitest browser test.

## Comments

- 2026-10-26, agent: done in `src/exports/read-export.ts` (`identifyExport`, `readSpondClubExport`; errors are `{ code: 'not-xlsx' | 'empty-sheet' | 'missing-columns', columns }`, `code` doubling as the message key for 16). `birthDate` is a `Date` at UTC midnight; formatting it `dd.mm.yyyy` is left to the report (15). Any `Medlemstype` other than `Medlem` is counted as not a member. 16 unit tests at the two seams, on files generated with `write-excel-file` (`src/exports/test-files.ts`); the `fflate` helper wasn't needed.
- 2026-10-26, agent: **read-excel-file hangs under the page CSP on large files.** In 9.3.12 every entry, `/universal` included, unzips with fflate's async `unzip()`, which inflates entries over 512 KiB in a `blob:` worker; `worker-src 'none'` blocks it and the read never settles (no error). A Spond Club sheet passes 512 KiB at a few hundred members. Fix, chosen by the user over a hand-rolled parser and over loosening the CSP: `build/sync-unzip-plugin.ts` points read-excel-file's `fflate` import at `src/exports/fflate-sync.ts`, whose `unzip()` runs `unzipSync`. It relies on read-excel-file's internals (one `unzip(archive, callback)` call), so the pin is now `~9.3.12` (patches only), and read-excel-file is excluded from Vite's dep pre-bundling (which would skip the plugin). The package's own `unzipFromArrayBufferSync.js` is unused and broken (calls `.then()` on `unzipSync`'s result).
- 2026-10-26, agent: browser check is permanent: a Vitest browser project (Playwright, headless Chromium and Firefox; CI installs both) runs `*.browser.test.ts`. `read-export.browser.test.ts` loads the reader in an iframe served by `cspTestFrame()` (`build/csp-plugin.ts`) with the exact policy from `build/csp.ts` (a `srcdoc` frame won't do: Firefox doesn't treat it as `'self'`). It checks that a probe request is blocked, then that a small and a 4000-row export read with no CSP violation. With the plugin removed, the 4000-row test hangs in both browsers. A production build with the reader imported contains no `new Worker` or `createObjectURL`. WebKit is still unchecked (ticket 15).
