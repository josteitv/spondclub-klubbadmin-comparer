# Matching engine

Type: task
Status: resolved
Blocked by: 11

## What to build

The matching rules from [04](04-matching.md) and [spec](../spec.md) "Matching" as pure TypeScript functions with no UI and no file reading. Input: two lists of people (`SpondClubMember`, `KlubbAdminMember`), each with first name, last name, birth date (optional) and group text (optional). Output: the four result groups.

- `fullName`: first + last name, whitespace-joined; an empty field is skipped.
- `normalise`: lower case, collapse whitespace, hyphen → space, strip accents with NFD while keeping æ/ø/å distinct, sort words alphabetically.
- Exact match: normalised names equal, and the name occurs exactly once on each side.
- Possible match, only among people without an exact match; a pair qualifies by one rule on its own:
  - (a) missing words: every word of the shorter name is in the longer one, and the shorter name has ≥ 2 words;
  - (b) typo: Levenshtein distance between normalised names ≤ 1 if the name has < 10 letters, else ≤ 2.
- Names occurring more than once on either side are never exact matches; they go through the Possible-match rules with each other and with everyone else.
- Possible-match pairs are grouped into connected sets, each pair with its reason (`missing-words`, `typo`, `same-name`).
- Result: `{ foundInBoth, possibleMatches, unregisteredMembers, klubbAdminOnlyMembers }`. Every person ends up in exactly one group.

## Acceptance criteria

- [x] Unit tests with invented names cover: identical names; case, extra spaces and hyphen-vs-space; word order; split between first and last name; é/ü stripped but ø ≠ o; a missing middle name; a one-word name not matching by rule (a); the < 10 / ≥ 10 letter typo thresholds; ø ↔ o and å ↔ aa as typos; duplicate names on one side and on both sides; one Spond Club member with two KlubbAdmin candidates; an empty first or last name; the combined case (missing word + typo), which is *not* a Possible match.
- [x] A property-style test: for random invented inputs, every person appears in exactly one result group.
- [x] No dependency on Preact or the file readers.

## Comments

- 2026-10-26, agent: done in `src/matching/match.ts` (`matchMembers`, no imports), tested at that one seam in `src/matching/match.test.ts` (30 tests, including a seeded random test that fails if merging connected sets is broken). Two interpretations, confirmed by the user: the typo limit uses the *shorter* name's letter count (the stricter limit), and `same-name` pairs are only across systems, so two Spond Club members with the same name and no KlubbAdmin counterpart are both Unregistered members.
- 2026-10-26, agent: the typo rule now transliterates å → aa, æ → ae, ø → o before measuring (and re-sorts the words), at the user's request. Before, "Ole Ås" ↔ "Ole Aas" was 2 typos in a short name (limit 1), and å at the start of a word could also change the word order. Exact matches still keep æ/ø/å distinct. Spec updated.
