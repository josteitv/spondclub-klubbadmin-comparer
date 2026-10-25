# Map: Spond Club–KlubbAdmin comparison, first version

## Destination

A finished spec for the first version: a tool the Membership manager runs to list Unregistered members (Spond Club → KlubbAdmin), Possible matches, and a simple list of KlubbAdmin-only members. The spec is [spec.md](spec.md).

## Notes

- Vocabulary: read `GLOSSARY.md` (renamed 2026-10-25: Player → Spond Club member, Member → KlubbAdmin member, Unregistered player → Unregistered member, Absent member → KlubbAdmin-only member; resolved tickets keep the old words); call the Skill tool for "domain-modeling" whenever a term is challenged or resolved.
- The user of the tool is the Membership manager: not tech-savvy. The tool is a static web page that processes the exports in the browser (see "How will the Membership manager run the tool?" and ADR 0001).
- GDPR: exports contain personal data. Export data, and anything derived from it, never leaves the browser. The first version has no third-party origins and a strict CSP that blocks the page's own network requests (amended ADR 0001, [10](issues/10-analytics.md)). Real exports live only in `.private/` (gitignored); agents read their structure (columns, formats), never copy real values into code, tests, docs or tickets. Tests use invented data.
- Input is manual exports from both systems (preferred over APIs).
- The club uses Spond Club, but not its NIF integration: Spond Club is not the club's membership system for NIF, so the tool doesn't duplicate an existing sync. Spond Club offers a club-wide .xlsx export of active members.
- Only Spond Club members count from Spond Club: people with member type `Medlem` (not `Ikke medlem`), not Guardians. Their groups come from the `Grupper` column of the Spond Club export (confirmed in 03).
- One run covers the whole club; each Spond Club member appears once. Their groups are shown as the Spond Club `Grupper` cell, unsplit (some group names contain the `", "` separator), so the result is not grouped by Spond group.
- No exception list in the first version.
- Every `Medlem` row is a Spond Club member, whatever the person's age or role (adult athletes, coaches, parents). Someone who shouldn't be a club member is changed to `Ikke medlem` in Spond Club; the report says so in the Unregistered members section. (Grilled 2026-10-25.)
- All KlubbAdmin-only members are listed, with no filter on gruppe/gren, as the last section of the report: "Medlemmer i KlubbAdmin som ikke er i Spond Club". (Grilled 2026-10-25.)
- No separate data-quality checks: duplicate names go to Possible matches, missing birth dates show as "mangler", rows without a name are skipped and counted, and Guardians who are also `Medlem` rows are Spond Club members. (Grilled 2026-10-25.)
- Matching compares full name only (Spond Club member vs KlubbAdmin member). Identical names after normalisation are a match; close names (e.g. missing middle name, typo) are shown as Possible matches for the Membership manager to judge. Birth date and group are shown in the result when available, for viewing only, never compared. No registration fields are shown. The name rule is in [04](issues/04-matching.md).
- A future offline version for Windows packages the same app in an installer. No technical choice for the web version may conflict with it: the app works fully offline once loaded (code, parser and fonts bundled, no CDN at runtime; analytics and error reporting optional and fail silently), with relative asset paths. See [offline-version](../offline-version/issues/01-offline-version.md).

## Decisions so far

<!-- one line per closed ticket -->

- [What does Spond's member export contain?](issues/01-spond-export.md): Excel member list per main group (subgroups as sheets), or one club-wide .xlsx in Spond Club; birth date, address and guardians are standard fields, gender only in Spond Club; children usually have no email/phone of their own; removed members leave no trace in plain groups. Column layout must be confirmed against a real file.
- [What does KlubbAdmin's member export contain?](issues/02-klubbadmin-export.md): Excel export from member search with selectable fields (incl. foresatte, gruppe/gren, kontingent); no membership-type field, only member vs active-in-gren; no club import or API, so manual export is right; manual registration needs name, birth date, gender, citizenship, address and email. Column layout and PersonId export must be confirmed against a real file.
- [How will the Membership manager run the tool?](issues/05-how-to-run.md): a static web page on GitHub Pages (own domain later) that reads and compares the exports in the browser; export data never leaves the browser, enforced by a CSP allowlist, SRI and a single scrubbed choke point for analytics/error reports ([ADR 0001](../../docs/adr/0001-browser-only-static-web-page.md)); stores nothing; NO/EN interface; rejects unknown export formats; TypeScript, build tool decided in [07](issues/07-build-tool.md); public repo, MIT.
- [Get sample exports from Spond Club and KlubbAdmin](issues/03-sample-exports.md): both exports are one sheet with one header row. Spond Club has one row per member, with Guardians as nested columns, dates as Excel serials and groups in one unsplittable `Grupper` cell. KlubbAdmin has all-text cells with `dd.mm.yyyy` dates, PersonId, and `|`-joined grupper/grener. Spond Club members are `Medlemstype = Medlem` rows. The 3-person KlubbAdmin sample is the accepted basis for the first version.
- [How do we recognise the same person in both systems?](issues/04-matching.md): full name only (first + last, word order, case, spaces, hyphens and accents ignored; æ/ø/å kept). Exact match only when the name is unique on both sides. Otherwise Possible match by missing words (shorter name ≥ 2 words) or Levenshtein ≤ 1 (< 10 letters) / ≤ 2, one rule at a time. Levenshtein alone was rejected because missing middle names are common.
- [What does the report look like?](issues/06-report.md): one read-only page, read top to bottom. A summary of counts comes first, then Unregistered members, Possible matches (side by side with reason), everyone Found in both and, last, KlubbAdmin-only members, each with name, birth date and group. No decisions or checkboxes. The prototype is on branch `prototype/report`.
- [Which .xlsx parser does the web page bundle?](issues/08-xlsx-parser.md): `read-excel-file` 9.x via `/universal` (MIT, about 17 kB, no workers, so no CSP change), pinned to `~9` and wrapped in our own module so it can be swapped for a hand-rolled `fflate` parser (the runner-up). SheetJS, ExcelJS and npm's `xlsx` 0.18.5 were ruled out.
- [Svelte or Preact?](issues/09-framework.md): Preact. Components are plain TypeScript checked by `tsc`, and the patterns are the ones models and developers know best. Svelte's build-time compiler was not a decisive advantage for AI-driven development.
- [Analytics and error reporting in the first version?](issues/10-analytics.md): neither. No analytics, no automatic error reporting, no report link (a later feature: [error-reporting](../error-reporting/issues/01-error-reporting.md)). With no third-party origins, the CSP is strict (`default-src 'self'`, `connect-src 'none'`), so the browser itself blocks any upload; ADR 0001 amended.
- [Which build tool produces the static web page?](issues/07-build-tool.md): Vite 8 with Vitest (the default for Svelte and Preact, with a GitHub Pages guide); SRI through a third-party plugin until Vite has it built in; CI type-checks separately; the CSP allowlist is kept by hand and checked by a CI test. Runner-up Rsbuild (built-in SRI).

## Implementation tickets

The spec is ready (2026-10-25) and broken into slices; each one is runnable and tested on its own:

- [11 Project skeleton](issues/11-skeleton.md): Vite + Preact + CI + strict CSP + GitHub Pages. Its deploy step needs [17 Enable GitHub Pages](issues/17-enable-github-pages.md) (human).
- [12 Matching engine](issues/12-matching.md), blocked by 11.
- [13 Read the Spond Club export](issues/13-read-spond-club.md), blocked by 11. 12 and 13 can run in parallel.
- [14 Read the KlubbAdmin export](issues/14-read-klubbadmin.md), blocked by 13.
- [15 Drop zone and report](issues/15-drop-zone-and-report.md), blocked by 12 and 14.
- [16 Norwegian/English and export instructions](issues/16-language-and-instructions.md), blocked by 15.

## Not yet specified

Nothing. The last three points (data quality, which KlubbAdmin members are expected in Spond Club, coaches) were settled by grilling on 2026-10-25; see Notes.

## Out of scope

- Saving a session between runs: the first version leaves no data behind; see [saved-session](../saved-session/issues/01-saved-session.md).
- Analytics and error reporting: see [error-reporting](../error-reporting/issues/01-error-reporting.md).
- The offline version for Windows: see [offline-version](../offline-version/issues/01-offline-version.md).
- Exception lists ("not expected in Spond Club").
- Deciding Possible matches in the tool ("same person" / "not the same") or ticking off Spond Club members as registered; may be added later (see [06](issues/06-report.md)).
- Field-level differences between the two systems (e.g. mismatching phone numbers).
- Distinguishing "removed from Spond Club" from "never in Spond Club" — both are KlubbAdmin-only members.
