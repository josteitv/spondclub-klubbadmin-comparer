# Drop zone and report

Type: task
Status: ready-for-human
Blocked by: 12, 14

## What to build

The working tool: drop the two exports, see the report. See [spec](../spec.md) "Input" and "Report", and the layout chosen in [06](06-report.md) (variant A of the [prototype](https://github.com/josteitv/spondclub-klubbadmin-comparer/tree/prototype/report), with the section order changed after it).

- One drop zone plus a file picker that accepts both files in any order. Each file is identified with `identifyExport`. Shows which file was recognised as which. If both are the same kind, it says which one is missing. Errors are shown as clear messages.
- When both are loaded: run the matching from 12 and render the report as one read-only page:
  1. Summary: a count per section, each linking to it, plus the number of Spond Club members and KlubbAdmin members read.
  2. "Ikke registrert i KlubbAdmin" (Unregistered members): name, birth date, Spond Club group cell. Hint: "Hvis personen ikke skal være medlem av klubben, endre medlemstypen til «Ikke medlem» i Spond Club."
  3. "Mulige treff" (Possible matches): Spond Club side next to the KlubbAdmin side, birth date and groups on both, and the reason.
  4. "Funnet i begge" (Found in both): name, birth date from each system, Spond Club group cell.
  5. "Medlemmer i KlubbAdmin som ikke er i Spond Club" (KlubbAdmin-only members): name, birth date, grupper/grener.
  6. Bottom of the report: the number of `Ikke medlem` rows left out and of rows skipped without a name, and the reminder to delete the exports.
- Each section sorted by full name with Norwegian collation (`Intl.Collator('nb')`). Missing values shown as "mangler" / "ingen gruppe".
- A "Start på nytt" (start over) button clears everything. Nothing is stored: no localStorage, sessionStorage, IndexedDB or cookies.
- Norwegian text only in this ticket; 16 adds English.

## Acceptance criteria

- [x] Component tests with invented data: both drop orders; the same kind of file twice; an unrecognised file; all four sections rendered with the right people; sorting with æ/ø/å.
- [x] A test asserts nothing is written to any browser storage.
- [x] The "Under utvikling" notice is removed from the page (`src/app.tsx`, its test and CSS), and the work-in-progress note is removed from `README.md`.
- [ ] Works in the built page under the strict CSP, at desktop widths in Edge, Chrome, Firefox and Safari.
- [ ] The user checks the report manually with the real exports. Agents never load the files in `.private/` into the tool; see CLAUDE.md.

## Comments

- 2026-10-28, agent: done in `src/app.tsx` (drop zone, file picker, messages, Start på nytt) and `src/report.tsx` (summary, the four sections sorted with `Intl.Collator('nb')`, bottom counts, reminder). Tested at the seams confirmed by the user: 14 component tests on `<App>` with generated files (picker and drop, both orders, same kind twice, unrecognised and non-.xlsx files, all four sections, æ/ø/å sorting, start over, no storage) and a browser test (`src/app.browser.test.ts`) that mounts the App in the CSP frame in Chromium and Firefox, drops both files and checks for no violations. The browser-test frame helper moved to `src/csp-frame-client.ts`. A second file of a kind already loaded replaces the first; while the other kind is still missing, the page says so. When every pair in a Possible match set has the same reason, it is shown once; otherwise each pair is listed with its reason. An empty section shows "Ingen.".
  The built page (`npm run build && npm run preview`) was checked at 1280 px in Chromium and Firefox via Playwright with invented exports: report renders, no CSP violations or errors. Not done by the agent: WebKit (Safari) could not start here because system libraries are missing (`sudo npx playwright install-deps webkit`), Edge was not run (Chromium-based), and the manual check with the real exports is the user's.
