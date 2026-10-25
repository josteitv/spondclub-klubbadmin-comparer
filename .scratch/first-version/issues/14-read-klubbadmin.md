# Read the KlubbAdmin export

Type: task
Status: ready-for-agent
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

- [ ] Tests on generated files that mirror the confirmed KlubbAdmin structure: text dates (including an invalid one → shown as missing, not a crash); `|`-joined grupper/grener; a numeric value in an `@`-formatted cell; a trailing empty row; extra columns (e.g. `PersonId`, `Tlf. mobil`) ignored; each required column missing → its error.
- [ ] `identifyExport` tells the two exports apart and rejects a file that is neither, naming what is missing.
