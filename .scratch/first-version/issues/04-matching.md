# How do we recognise the same person in both systems?

Type: grilling
Status: resolved
Blocked by: 03

## Question

What rule decides that a Player in Spond Club and a Member in KlubbAdmin are the same person? Which fields (name, birth date, guardian contact, …) and how strict: name spelling variants, middle names, missing birth dates, two candidates for one Player. What happens with uncertain matches — shown to the Membership manager as "possible match"?

## Answer

Players are Spond Club rows with `Medlemstype = Medlem`; Members are all rows of the KlubbAdmin export. Only names are compared. Birth date and the unsplit group cell are shown in the result but never compared.

1. **Full name:** the first-name field plus the last-name field. How the words are split between the two fields doesn't matter. If one field is empty, the tool uses whatever is there. A row with no name at all is skipped and reported.
2. **Normalisation before comparing:** ignore case, extra spaces, hyphen vs space, accents (é → e, ü → u) and word order. æ/ø/å stay distinct letters.
3. **Exact match:** names identical after normalisation, and only when the name occurs once on each side. A name occurring more than once on either side is never matched automatically; all those people go to the Possible-match search.
4. **Possible match:** only for people without an exact match. Members who already have an exact match are not candidates. A pair is a Possible match if it meets one rule on its own (the rules are not combined):
   - **(a) Missing words:** all words of the shorter name appear in the longer one, and the shorter name has at least 2 words.
   - **(b) Typo:** the Levenshtein distance between the full names, with words sorted alphabetically, is at most 1 if the name is under 10 letters, otherwise at most 2. This also covers ø↔o, å↔aa and æ↔ae.

   A Player can have several candidate Members, and the other way round.
5. **Result:** three groups, with nobody in more than one:
   - Possible matches, each person shown with every candidate.
   - Unregistered players: Players with no exact or Possible match.
   - Absent members: Members with no exact or Possible match.

   How the result looks, including whether exact matches are shown, is decided in [06](06-report.md).

**Rejected:**
- **Levenshtein (or Jaro-Winkler) alone:** a missing middle name is a large distance ("ola nordmann" ↔ "ola johan nordmann" = 6). A threshold loose enough to catch it also flags different people who share a first name ("kari hansen" ↔ "kari olsen" = 3). About 30% of Players have more than one word in the first-name field, so this would flood the Possible-match list.
- **Word-by-word fuzzy comparison:** it adds little beyond the combined missing-word-plus-typo case, which was deliberately left out.

## Comments

- 2026-10-25, user: compare on full name only. Birth date is shown in the result next to each name, but is not compared. Other fields are not important for the comparison. Then: fuzzy matching. Normalised-identical names match; close names are shown as "possible match". Players are only Spond Club rows with member type `Medlem`. Birth date and group are shown when available; no registration fields. Still open: how a full name is normalised (case, whitespace, hyphens, middle names, special Norwegian letters), and what happens when two people share a name.
