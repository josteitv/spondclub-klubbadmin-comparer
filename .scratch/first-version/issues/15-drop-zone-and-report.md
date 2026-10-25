# Drop zone and report

Type: task
Status: ready-for-agent
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

- [ ] Component tests with invented data: both drop orders; the same kind of file twice; an unrecognised file; all four sections rendered with the right people; sorting with æ/ø/å.
- [ ] A test asserts nothing is written to any browser storage.
- [ ] Works in the built page under the strict CSP, at desktop widths in Edge, Chrome, Firefox and Safari.
- [ ] The user checks the report manually with the real exports. Agents never load the files in `.private/` into the tool; see CLAUDE.md.
