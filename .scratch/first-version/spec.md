# Spec: Spond Club–KlubbAdmin comparison, first version

Status: ready-for-agent

Built from the [map](map.md) and its resolved tickets 01–07. Vocabulary follows [GLOSSARY.md](../../GLOSSARY.md). Resolved tickets 03–06 say "Player", "Member" and "Absent member"; they mean Spond Club member, KlubbAdmin member and KlubbAdmin-only member.

## Goal

The Membership manager drops the club's Spond Club export and KlubbAdmin export into a web page. The page shows which Spond Club members are not registered in KlubbAdmin (Unregistered members), which pairs might be the same person (Possible matches), who is found in both, and which KlubbAdmin members are not in Spond Club (KlubbAdmin-only members).

## Users and context

- **User:** the club's Membership manager. Not tech-savvy. Uses a Windows 11 PC, a few times a year.
- **Browsers:** current desktop Edge, Chrome, Firefox and Safari. Phones and tablets are not targeted. Safari is checked with Playwright's WebKit build, since no Mac is available (decided 2026-10-25).
- **Other clubs:** the tool should work for other clubs too; nothing is specific to one club.

## Form and privacy

See [ADR 0001](../../docs/adr/0001-browser-only-static-web-page.md) and [05](issues/05-how-to-run.md).

- **Static web page with no backend**, hosted on GitHub Pages, with our own domain later. Every push to `main` deploys, and the page shows its version.
- **Export data never leaves the browser.** That covers the exports and anything derived from them. Enforced by:
  - **No third-party origins at all.** There is no CDN, no external fonts, no analytics and no error reporting ([10](issues/10-analytics.md)).
  - **A strict CSP:** `default-src 'self'`, `connect-src 'none'`, no inline scripts. The page can't make any network request of its own, so the browser enforces the guarantee. A CI test checks the CSP and that the built page references no external origin.
- **Nothing is stored.** No local storage and no cookies holding export data. Closing the tab wipes everything. The page reminds the Membership manager to delete the downloaded exports.
- **Offline-compatible.** A later Windows offline version will package this same page ([offline-version](../offline-version/issues/01-offline-version.md)). So:
  - The page works fully without network once loaded.
  - Code, the `.xlsx` parser and fonts are bundled, never loaded from a CDN at runtime.
  - Asset paths are relative.

## Input

The page has one drop zone (plus a file picker) that accepts both files, in any order. It identifies each file from its header row. Step-by-step export instructions for both systems are shown in the page.

### Spond Club export

Spond Club → Members → Active members → select all → Export. Structure confirmed in [03](issues/03-sample-exports.md):

- **Layout:** one sheet, one header row, then one row per person.
- **Required columns:**
  - `Medlemstype`
  - `Medlem fornavn`
  - `Medlem etternavn`
  - `Fødselsdato`: an Excel date serial, shown as `dd.mm.yyyy`.
  - `Grupper`: shown as-is, never split.
- **Optional columns** ([18](issues/18-contact-details.md)): `Medlems-e-post`, `Medlem mobil`, and `Foresatt N fornavn` / `etternavn` / `e-post` / `telefonnummer` for N = 1–4. When missing, the details show as missing.
- **Other columns** are ignored.
- **Spond Club members** are rows with `Medlemstype = Medlem`. Rows with `Ikke medlem` are left out and counted.

### KlubbAdmin export

Member search → export to Excel, with the default fields. Structure confirmed in [03](issues/03-sample-exports.md):

- **Layout:** one sheet, one header row, then one row per KlubbAdmin member. Every cell is text.
- **Required columns:**
  - `Fornavn`
  - `Etternavn`
  - `Fødselsdato`: text `dd.mm.yyyy`.
  - `Grupper/grener`: entries joined by `|`, shown joined by `, `.
- **Other columns** are ignored.
- **KlubbAdmin members:** every non-empty row is a KlubbAdmin member. Trailing empty rows are ignored.

### Validation

- **Unrecognised file:** if it isn't an `.xlsx`, or a required column is missing, it is rejected. The clear error message names the missing column and points to the export instructions. The tool never guesses.
- **Same kind twice:** if both files turn out to be the same kind of export, the user is told which one is missing.
- **Rows without a name:** rows where both name fields are empty are skipped and counted.

## Matching

See [04](issues/04-matching.md). Only names are compared. Birth date and groups are shown, never compared.

1. **Full name:** first-name field + last-name field. How the words are split between the two fields doesn't matter. If one field is empty, whatever is there is used.
2. **Normalisation:**
   - ignore case, extra spaces, hyphen vs space, and word order;
   - strip accents (é → e, ü → u), but keep æ/ø/å as distinct letters.
3. **Exact match:** names identical after normalisation, *and* the name occurs exactly once among the Spond Club members and exactly once among the KlubbAdmin members. A name that occurs more than once on either side is never matched automatically.
4. **Possible match:** only among people without an exact match. A pair is a Possible match if it meets one of these rules on its own:
   - **(a) Missing words:** every word of the shorter name is in the longer name, and the shorter name has at least 2 words.
   - **(b) Typo:** the Levenshtein distance between the normalised full names, with words sorted alphabetically, is ≤ 1 if the name has fewer than 10 letters, otherwise ≤ 2. The shorter name's letter count sets the limit. Before measuring, å → aa, æ → ae and ø → o (then words are re-sorted), so these spellings cost nothing: "Ole Ås" ↔ "Ola Aas" is 1 typo. (Changed 2026-10-26; previously each counted as typos, which missed short names and å at the start of a word.)

   Same-name duplicates from step 3 are Possible matches with each other. A person can have several candidates. Possible-match pairs are grouped into connected sets for display, with the reason for each pair.
5. **Groups in the result:** every Spond Club member and every KlubbAdmin member ends up in exactly one of:
   - exact match (Found in both),
   - Possible match,
   - Unregistered member (a Spond Club member with neither),
   - KlubbAdmin-only member (a KlubbAdmin member with neither).

## Report

See [06](issues/06-report.md) and the [prototype](https://github.com/josteitv/spondclub-klubbadmin-comparer/tree/prototype/report) (variant A). One read-only page, read top to bottom, with no decisions or checkboxes.

1. **Summary:** one count per section below, each linking to its section, plus the number of Spond Club members and KlubbAdmin members read.
2. **Ikke registrert i KlubbAdmin** (Unregistered members): name, birth date, and the Spond Club group cell, plus one Kontakt column listing the member's own email and mobile and each Guardian's name, email and phone, one line per contact, for registering them ([18](issues/18-contact-details.md)). One click on an email or phone number copies it, a Norwegian number without `+47` ([19](issues/19-copy-contact-details.md)). Hint: "Hvis personen ikke skal være medlem av klubben, endre medlemstypen til «Ikke medlem» i Spond Club."
3. **Mulige treff** (Possible matches): Spond Club person or people next to the KlubbAdmin candidate or candidates, with the reason (missing middle name or other name part, typo, same name more than once). Birth date and groups are shown on both sides.
4. **Funnet i begge** (Found in both): name, birth date from each system, and the Spond Club group cell.
5. **Medlemmer i KlubbAdmin som ikke er i Spond Club** (KlubbAdmin-only members): name, birth date, and KlubbAdmin grupper/grener.
6. **Bottom of the report:** the number of `Ikke medlem` rows left out and of rows skipped for having no name. Then the reminder to delete the exports.

- **Sorting:** within each section, alphabetical by full name, using Norwegian collation.
- **Missing values:** "mangler" for birth date; "ingen gruppe" for group; "ingen e-post" / "ingen telefon" for a contact's missing email or phone; "ingen kontaktinfo" for a member with no contacts.

## Interface language

Norwegian bokmål and English. The language is picked from the browser language, with Norwegian as the default, and there is a visible switch. The choice isn't stored. Code, docs and tickets are in English.

## Stack and delivery

See [05](issues/05-how-to-run.md) and [07](issues/07-build-tool.md).

- **Language and framework:** TypeScript with Preact ([09](issues/09-framework.md)).
- **Build and tests:** Vite 8 and Vitest. CI runs `tsc --noEmit` separately, since Vite doesn't type-check.
- **`.xlsx` parser:** `read-excel-file` 9.x via its `/universal` entry (no workers), pinned to `~9` and used only inside our own export-reading module ([08](issues/08-xlsx-parser.md)). Test fixtures come from `write-excel-file` plus an `fflate` helper.
- **SRI:** through a Vite plugin (e.g. `vite-plugin-sri-gen`), checked to work on Vite 8.
- **Deployment:** GitHub Actions deploys to GitHub Pages.
- **Repo:** public, MIT license.

## Testing

- All tests use invented data, never values from `.private/`.
- **Matching:** unit tests for every rule in 04, including duplicates, the length threshold, word order, accents vs æ/ø/å, empty name fields, and many-to-many Possible matches.
- **Parsing:** tests with generated `.xlsx` files that mirror the confirmed structure of both exports. These cover Excel date serials, text dates, `|`-joined grupper/grener, trailing empty rows and missing required columns.
- **Privacy:** a CI check that the built page has the strict CSP and references no external origin.

## Out of scope

- Saving a session ([saved-session](../saved-session/issues/01-saved-session.md)).
- The Windows offline version ([offline-version](../offline-version/issues/01-offline-version.md)). The first version only has to stay compatible with it.
- Deciding Possible matches in the tool, or ticking off Spond Club members as registered.
- Exception lists.
- Field-level differences (phone, address, …), and registration fields other than the contact details of Unregistered members.
- Telling "removed from Spond Club" apart from "never in Spond Club".
- Filtering KlubbAdmin-only members by gruppe/gren or membership type.
- Analytics, and error reporting of any kind (automatic or a "report a problem" link); see [error-reporting](../error-reporting/issues/01-error-reporting.md). Errors are shown to the Membership manager as clear messages only.

## Open choices for implementation

None. The last one, the `.xlsx` parser, was settled in [08](issues/08-xlsx-parser.md).
