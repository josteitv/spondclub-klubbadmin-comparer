# What does Spond's member export contain?

Type: research
Status: resolved

## Question

What member export can a Spond group/club admin download (web or app), and what does it contain? Format (xlsx/csv), columns, whether it covers all groups or one at a time, how Players, Guardians and group admins are distinguished, and whether birth date, gender, address, email and phone are present for Players and Guardians. Also: does Spond expose removed members anywhere? Cite primary sources (Spond help centre/docs).

## Answer

- Plain Spond groups: a group admin can export an Excel member list (app: Members → Excel icon; web: ⋯ → "Last ned medlemsliste (Excel)"). It is one export per main group, with subgroups on separate sheets. The overview sheet holds the members, their guardians and all member fields.
- Default group fields are date of birth, address and guardians, plus any custom fields. Gender is not a default group field. Children's own email/phone are normally empty, and contact details sit on the guardians, who are nested under the member. Admins are a separate list, and the docs don't say whether they appear in the export.
- Spond Club: Active members → Export gives one club-wide .xlsx. Its default fields include date of birth, gender, address, guardians and Member ID. Deactivated members are kept in a Deactivated list. The NIF integration ("Members from NIF") partly overlaps with this tool.
- Plain groups keep no history of removed members. Column names and layout are undocumented and must be confirmed against a real export file.

Details: [../research/spond-export.md](../research/spond-export.md)
