# Read the KlubbAdmin export

Type: task
Status: resolved
Blocked by: 13

## What to build

The KlubbAdmin reader in the export-reading module from 13. See [spec](../spec.md) "Input" and the structure in [03](03-sample-exports.md).

- `identifyExport` also recognises a KlubbAdmin export.
- `readKlubbAdminExport(file)`:
  - required columns: `Fornavn`, `Etternavn`, `Fødselsdato`, `Grupper/grener`;
  - other columns are ignored;
  - every cell is text;
  - `Fødselsdato` is text `dd.mm.yyyy`: parse and validate it, keeping it empty if blank;
  - `Grupper/grener` entries are `|`-joined: displayed joined by `, `;
  - trailing empty rows are ignored;
  - rows with both name fields empty are skipped and counted.
- Same error model as 13.

## Acceptance criteria

- [x] Tests on generated files that mirror the confirmed KlubbAdmin structure: text dates (including an invalid one → shown as missing, not a crash); `|`-joined grupper/grener; a numeric value in an `@`-formatted cell; a trailing empty row; extra columns (e.g. `PersonId`, `Tlf. mobil`) ignored; each required column missing → its error.
- [x] `identifyExport` tells the two exports apart and rejects a file that is neither, naming what is missing.

## Comments

- 2026-10-26, agent: done in `src/exports/read-export.ts` (`readKlubbAdminExport`, and `identifyExport` now returns `'spond-club'` or `'klubbadmin'`). 13 new unit tests on generated files with every cell text-formatted (`@`), at the seams confirmed by the user. A file that is neither export gets `{ code: 'unrecognised', missing: { spondClub, klubbAdmin } }`, both lists (user's choice), so the report can word it without guessing which file was meant; `missing-columns` stays for a reader given the wrong file. Birth dates are validated as real calendar dates (`31.02.2012` → missing) and returned as a `Date` at UTC midnight, like Spond Club's. A number in a text cell is read as text (e.g. `2012` → `"2012"`). The trailing row of `@`-styled empty cells is written by the test exactly as KlubbAdmin does, and read-excel-file drops it. Not browser-tested separately: it shares the file-reading path that 13's CSP test covers.
