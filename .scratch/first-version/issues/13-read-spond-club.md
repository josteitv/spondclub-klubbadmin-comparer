# Read the Spond Club export

Type: task
Status: ready-for-agent
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

- [ ] Tests on generated files that mirror the confirmed Spond Club structure: `Medlem` / `Ikke medlem` filtering and counting; date serial → date; missing birth date; `Grupper` with `", "` inside a group name kept whole; a row without a name skipped and counted; extra columns ignored; each required column missing → its error.
- [ ] `read-excel-file` is imported only inside this module.
- [ ] Works under the strict CSP from 11 (no worker, no network), checked in a real browser via the built page or a Vitest browser test.
