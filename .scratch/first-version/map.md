# Map: Spond Club–KlubbAdmin comparison, first version

## Destination

A finished spec for the first version: a tool the Membership manager runs to list Unregistered players (Spond Club → KlubbAdmin) with the details needed to register them in KlubbAdmin, plus a simple list of Absent members. Ready to hand to `/to-spec`.

## Notes

- Vocabulary: read `GLOSSARY.md`; call the Skill tool for "domain-modeling" whenever a term is challenged or resolved.
- The user of the tool is the Membership manager: not tech-savvy. A UI must be possible eventually; the technical solution is not decided yet (see "How will the Membership manager run the tool?").
- GDPR: exports contain personal data. No solution may store data with a third-party provider. Real exports live only in `.private/` (gitignored); agents read their structure (columns, formats), never copy real values into code, tests, docs or tickets. Tests use invented data.
- Input is manual exports from both systems (preferred over APIs).
- The club uses Spond Club, but not its NIF integration: Spond Club is not the club's membership system for NIF, so the tool doesn't duplicate an existing sync. Spond Club offers a club-wide .xlsx export of active members.
- Only Players count from Spond Club — active members in Spond Club, not Guardians, not group admins. Their groups come from a field in the Spond Club export (to confirm in "Get sample exports"; if absent, revisit).
- One run covers the whole club; Unregistered players are grouped by Spond group, a Player in several groups appears once with all groups listed.
- The list of Unregistered players carries every field KlubbAdmin needs for registration, flagging fields Spond Club lacks.
- No exception list in the first version.

## Decisions so far

<!-- one line per closed ticket -->

- [What does Spond's member export contain?](issues/01-spond-export.md): Excel member list per main group (subgroups as sheets), or one club-wide .xlsx in Spond Club; birth date, address and guardians are standard fields, gender only in Spond Club; children usually have no email/phone of their own; removed members leave no trace in plain groups. Column layout must be confirmed against a real file.
- [What does KlubbAdmin's member export contain?](issues/02-klubbadmin-export.md): Excel export from member search with selectable fields (incl. foresatte, gruppe/gren, kontingent); no membership-type field, only member vs active-in-gren; no club import or API, so manual export is right; manual registration needs name, birth date, gender, citizenship, address and email. Column layout and PersonId export must be confirmed against a real file.

## Not yet specified

- Spond Club data quality: duplicate Players, Guardians registered as Players, Players without birth date.
- Which Members are expected in Spond Club at all — without a rule, supporting/board/parent members flood the Absent members list. KlubbAdmin has no membership-type field, only member vs active-in-gren and free-text kontingent names; the rule likely hangs on gren registration.
- Whether coaches/team leaders must also be Members.

## Out of scope

- Exception lists ("not expected in Spond Club").
- Field-level differences between the two systems (e.g. mismatching phone numbers).
- Distinguishing "removed from Spond Club" from "never in Spond Club" — both are Absent members.
