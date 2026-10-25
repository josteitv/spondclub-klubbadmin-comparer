# Get sample exports from Spond Club and KlubbAdmin

Type: task
Status: resolved
Blocked by: 01, 02

## Question

The user (HITL) exports the member lists from both systems into `.private/`: from Spond Club (Members → Active members → select all → Export), and from KlubbAdmin (member search → export to Excel, including foresatte and gruppe/gren). Check whether the Spond Club export carries each Player's groups; if not, raise it as a decision rather than adding another export. The agent then confirms the actual structure (column names, formats, encodings, how Players/Guardians appear) against the research in 01 and 02 — reading structure only, never copying real values out. Record the confirmed structure (columns, types, quirks) in the answer.

## Answer

Read from the exports in `.private/` on 2026-10-25. Only structure, formats and rough proportions are recorded here, never values.

### Spond Club (Active members → Export)

- One sheet, one header row, then one row per member. No merged cells and no title or footer rows. All cells are text except the two date columns.
- Guardians are not rows of their own. Each member row has nested columns for up to 4 Guardians and one payment contact.
- Columns, in order:
  - `Medlemstype`: either `Medlem` or `Ikke medlem` (about 1 row in 7 is `Ikke medlem`).
  - `Grupper`: the member's groups in one cell, joined by `", "`. A member can be in up to about 25 groups. About 1 `Medlem` in 15 has no group.
  - `Undergruppe`: subgroups as `"<group> - <subgroup>"`, joined by `", "`. Filled for under half the rows.
  - `Medlem fornavn`, `Medlem etternavn`.
  - `Medlems-e-post`, `Medlem mobil`. The phone is text in `+47…` format.
  - `Betalingskontakts fornavn` / `etternavn` / `epost` / `telefonnummer`.
  - `Foresatt N fornavn` / `etternavn` / `e-post` / `telefonnummer` for N = 1–4.
  - `Innmeldingsdato`: a date, but almost always empty.
  - `Fødselsdato`: an Excel date serial with format `dd.mm.yyyy`. Missing on about 2% of rows.
  - `Kjønn`: `Mann`, `Kvinne` or empty. Missing on almost half the rows.
  - `Nasjonalitet`: a 3-letter code.
  - `Adresse`, `Postnummer`, `Poststed`: filled for only about half the rows.
  - `Draktnummer`, `Draktstørrelse`, `Klubbtilhørighet`: club-defined custom fields.
- The groups are in the export, so no further export is needed.
- **Not present:** the Spond Member ID the research expected, and any marking of group admins.
- **Quirk:** some group names contain `", "`, so splitting `Grupper` on `", "` breaks those names apart. `Undergruppe` has the same problem. The parser cannot split naively.
- **Data quality:**
  - No duplicate name + birth date pairs. Only one duplicate name.
  - Many `Medlem` rows are adults (born before 2000), and over 100 member rows share a name with some Guardian. Guardians and coaches are evidently also members in their own right.

### KlubbAdmin (member search → export to Excel)

- File name: `Medlemmer_Eksport_<club number>_Medlemsregister_<club name>_<ddmmyyyy>_<hhmmss>.xlsx`.
- One sheet, one header row, then one row per Member. There is a trailing empty row.
- Every cell is formatted as text (`@`), including the dates.
- Columns, in order:
  - `PersonId`: a 7-digit number stored as a number in a text-formatted cell. So PersonId *can* be exported.
  - `Fornavn`, `Etternavn`.
  - `Fødselsdato`: text `dd.mm.yyyy`, not an Excel date.
  - `Kjønn`: e.g. `Mann`.
  - `Adresse`, `Postnr` (text), `Postadresse` (in upper case).
  - `E-post`: can hold several addresses joined by `;`.
  - `Tlf. privat`, `Tlf. mobil`, `Tlf. arbeid`. Phones are digits only, without `+47`.
  - `Medlem fra dato`: text `dd.mm.yyyy`.
  - `Grupper/grener`: several entries joined by `|`.
  - `Medlemsdetaljer`.
- **Basis for the first version:** the sample has only 3 Members and the default field selection. By decision (2026-10-25) no larger export is made; this file defines the KlubbAdmin format the first version accepts. Data quality at scale is unconfirmed.

### Differences that matter for matching (04)

- **Dates:** an Excel serial in Spond Club, `dd.mm.yyyy` text in KlubbAdmin.
- **Phones:** `+47…` in Spond Club, bare digits in KlubbAdmin.
- **Postal place:** mixed case in Spond Club, upper case in KlubbAdmin.
- **Email:** KlubbAdmin may list several addresses in one cell.
- **Gender:** Spond Club uses `Mann`/`Kvinne` but often leaves it empty. KlubbAdmin used `Mann` in the sample; `Kvinne` is assumed but not yet seen.

### Open decisions

Decided 2026-10-25: Players are rows with `Medlemstype = Medlem` only. Matching uses full name only (see 04), so the adults/Guardians question no longer affects matching.


1. ~~**Who is a Player?**~~ Decided above.
2. ~~**Group names containing `", "`:**~~ Decided 2026-10-25: show the `Grupper` cell unsplit; the result is not grouped by Spond group. how should the tool split `Grupper`? One option is to take the known group names from the `Undergruppe` parents and the single-group cells. Another is to show the cell unsplit.
3. ~~**KlubbAdmin export:**~~ Decided 2026-10-25: no larger export; the 3-Member sample is the basis for the first version. a full export (all Members) is still needed to confirm the structure at scale. Since matching uses full name only and shows birth date (see 04), the default fields (name, birth date) are enough; foresatte, kontingent and statsborgerskap are not needed.
