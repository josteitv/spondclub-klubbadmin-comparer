# Tick off Unregistered members as registered

Type: task
Status: resolved
Blocked by: 18

## What to build

Asked by the user on 2026-10-28. This brings in part of what [06](06-report.md) and the spec had left out of the first version ("ticking off Spond Club members as registered"). The Membership manager ticks off each Unregistered member once they are registered in KlubbAdmin, to keep track while working through the list.

- **Layout:** variant A of the prototype, with the Registrert column last (user's choice). Branch `prototype/registered-tracking`, commit `0f39ed5`, has four variants: A a checkbox column, B moving the member to a "registered" list, C a remaining/registered filter, D one member at a time.
- **Behaviour:** a large checkbox last in each row of "Ikke registrert i KlubbAdmin". A ticked row stays in place but greys out, with the name crossed out. Ticking can be undone. A line above the table counts the ticks: "1 av 2 registrert i KlubbAdmin", with a progress bar.
- **Not stored:** the ticks live in memory only, as long as the report. They are lost on reload, on "Start på nytt" and when the tab closes; ADR 0001 (nothing stored) is unchanged. Keeping them between sessions belongs to [saved-session](../../saved-session/issues/01-saved-session.md).

## Acceptance criteria

- [x] Component tests: a checkbox last in each row, the count going up and down when ticking and unticking, ticks forgotten after Start på nytt, and nothing written to browser storage while ticking.
- [x] Works in the built page: checked in Chromium and Firefox.

## Comments

- 2026-10-28, agent: done in `src/report.tsx` (`UnregisteredTable` keeps the ticks in its own state, so they go when the report goes). Each checkbox is labelled "<name> er registrert i KlubbAdmin" for screen readers. The summary card count at the top is unchanged: it still counts all Unregistered members.
