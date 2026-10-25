# Norwegian/English and export instructions

Type: task
Status: ready-for-agent
Blocked by: 15

## What to build

See [spec](../spec.md) "Interface language" and "Input", and [05](05-how-to-run.md).

- All UI text in Norwegian bokmål and English, from one message catalogue (no i18n library needed unless it stays small and bundled). The language is picked from `navigator.languages`, Norwegian by default, with a visible switch. The choice isn't stored.
- Error messages from 13–14 use the same catalogue.
- Step-by-step export instructions for both systems, shown in the page near the drop zone, and linked from every "unrecognised file" error:
  - Spond Club: Members → Active members → select all → Export.
  - KlubbAdmin: member search → all members → export to Excel with the default fields (at least name, birth date, grupper/grener).

  The user checks the wording against the real systems.

## Acceptance criteria

- [ ] Every visible string comes from the catalogue; a test fails if a key is missing in either language.
- [ ] The language follows the browser; the switch changes all text, including the report and errors, without reloading or losing the loaded files.
- [ ] The instructions are reviewed by the user against both systems.
