# What does the report look like?

Type: prototype
Status: resolved
Blocked by: 04, 05

## Question

How should the result be presented to the Membership manager: Unregistered players grouped by Spond group with registration fields and missing fields flagged, possible matches, and the simple list of Absent members? Build a rough prototype on invented data to react to.

## Answer

Chosen layout: **one report page, read top to bottom** (variant A of the prototype). It has no decisions, checkboxes or other input; it only shows the result.

- **Summary at the top:** one count per section, each linking to its section.
- **Sections, in this order:**
  1. **Unregistered players:** name, birth date and the Spond Club group cell.
  2. **Possible matches:** a table with the Spond Club person or people next to the KlubbAdmin candidate or candidates, and the reason (missing middle name, typo, same name more than once, …). Birth date and groups are shown on both sides.
  3. **Absent members:** name, birth date and the KlubbAdmin grupper/grener.
  4. **Found in both:** every Player with an exact match is listed, with name, birth date from each system and the Spond Club group cell.
- **Bottom of the report:** how many `Ikke medlem` rows were left out and how many rows without a name were skipped.
- **Missing values** show as "mangler" (birth date) or "ingen gruppe" (group).
- **Reminder:** a footer reminds the Membership manager to delete the downloaded exports.

**Rejected:**
- **Work list with tabs and checkboxes (B).**
- **Side-by-side diff with filters (C).** It was first chosen, then dropped in favour of A.
- **Deciding Possible matches in the tool** ("same person" / "not the same"). It was prototyped in C, but left out of the first version; it may be added later.

Prototype (throwaway, not on main): branch `prototype/report`, file `prototypes/report/report-prototype.html`, commit `15642ac`.

