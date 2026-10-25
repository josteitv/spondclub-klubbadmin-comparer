# How do we recognise the same person in both systems?

Type: grilling
Status: open
Blocked by: 03

## Question

What rule decides that a Player in Spond Club and a Member in KlubbAdmin are the same person? Which fields (name, birth date, guardian contact, …) and how strict: name spelling variants, middle names, missing birth dates, two candidates for one Player. What happens with uncertain matches — shown to the Membership manager as "possible match"?

## Comments

- 2026-10-25, user: compare on full name only. Birth date is shown in the result next to each name, but is not compared. Other fields are not important for the comparison. Then: fuzzy matching. Normalised-identical names match; close names are shown as "possible match". Players are only Spond Club rows with member type `Medlem`. Birth date and group are shown when available; no registration fields. Still open: how a full name is normalised (case, whitespace, hyphens, middle names, special Norwegian letters), and what happens when two people share a name.
