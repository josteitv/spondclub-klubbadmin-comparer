# Map: Spond Club–KlubbAdmin comparison, first version

## Destination

A finished spec for the first version: a tool the Membership manager runs to list Unregistered players (Spond Club → KlubbAdmin) with the details needed to register them in KlubbAdmin, plus a simple list of Absent members. Ready to hand to `/to-spec`.

## Notes

- Vocabulary: read `GLOSSARY.md`; call the Skill tool for "domain-modeling" whenever a term is challenged or resolved.
- The user of the tool is the Membership manager: not tech-savvy. The tool is a static web page that processes the exports in the browser (see "How will the Membership manager run the tool?" and ADR 0001).
- GDPR: exports contain personal data. Export data, and anything derived from it, never leaves the browser; third-party code, fonts, analytics and error reporting are allowed but must never carry it. Real exports live only in `.private/` (gitignored); agents read their structure (columns, formats), never copy real values into code, tests, docs or tickets. Tests use invented data.
- Input is manual exports from both systems (preferred over APIs).
- The club uses Spond Club, but not its NIF integration: Spond Club is not the club's membership system for NIF, so the tool doesn't duplicate an existing sync. Spond Club offers a club-wide .xlsx export of active members.
- Only Players count from Spond Club — active members in Spond Club, not Guardians, not group admins. Their groups come from a field in the Spond Club export (to confirm in "Get sample exports"; if absent, revisit).
- One run covers the whole club; Unregistered players are grouped by Spond group, a Player in several groups appears once with all groups listed.
- The list of Unregistered players carries every field KlubbAdmin needs for registration, flagging fields Spond Club lacks.
- No exception list in the first version.
- A future offline version for Windows packages the same app in an installer. No technical choice for the web version may conflict with it: the app works fully offline once loaded (code, parser and fonts bundled, no CDN at runtime; analytics and error reporting optional and fail silently), with relative asset paths. See [offline-version](../offline-version/issues/01-offline-version.md).

## Decisions so far

<!-- one line per closed ticket -->

- [What does Spond's member export contain?](issues/01-spond-export.md): Excel member list per main group (subgroups as sheets), or one club-wide .xlsx in Spond Club; birth date, address and guardians are standard fields, gender only in Spond Club; children usually have no email/phone of their own; removed members leave no trace in plain groups. Column layout must be confirmed against a real file.
- [What does KlubbAdmin's member export contain?](issues/02-klubbadmin-export.md): Excel export from member search with selectable fields (incl. foresatte, gruppe/gren, kontingent); no membership-type field, only member vs active-in-gren; no club import or API, so manual export is right; manual registration needs name, birth date, gender, citizenship, address and email. Column layout and PersonId export must be confirmed against a real file.
- [How will the Membership manager run the tool?](issues/05-how-to-run.md): a static web page on GitHub Pages (own domain later) that reads and compares the exports in the browser; export data never leaves the browser, enforced by a CSP allowlist, SRI and a single scrubbed choke point for analytics/error reports ([ADR 0001](../../docs/adr/0001-browser-only-static-web-page.md)); stores nothing; NO/EN interface; rejects unknown export formats; TypeScript, build tool decided in [07](issues/07-build-tool.md); public repo, MIT.
- [Which build tool produces the static web page?](issues/07-build-tool.md): Vite 8 with Vitest (the default for Svelte and Preact, with a GitHub Pages guide); SRI through a third-party plugin until Vite has it built in; CI type-checks separately; the CSP allowlist is kept by hand and checked by a CI test. Runner-up Rsbuild (built-in SRI).

## Not yet specified

- Spond Club data quality: duplicate Players, Guardians registered as Players, Players without birth date.
- Which Members are expected in Spond Club at all — without a rule, supporting/board/parent members flood the Absent members list. KlubbAdmin has no membership-type field, only member vs active-in-gren and free-text kontingent names; the rule likely hangs on gren registration.
- Whether coaches/team leaders must also be Members.

## Out of scope

- Saving a session between runs: the first version leaves no data behind; see [saved-session](../saved-session/issues/01-saved-session.md).
- The offline version for Windows: see [offline-version](../offline-version/issues/01-offline-version.md).
- Exception lists ("not expected in Spond Club").
- Field-level differences between the two systems (e.g. mismatching phone numbers).
- Distinguishing "removed from Spond Club" from "never in Spond Club" — both are Absent members.
