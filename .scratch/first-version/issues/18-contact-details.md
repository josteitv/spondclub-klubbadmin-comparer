# Contact details for Unregistered members

Type: task
Status: resolved
Blocked by: 15

## What to build

Decided with the user on 2026-10-28. This changes the earlier "no registration fields are shown" (map, 04). The Membership manager needs an email address and a phone number to register someone in KlubbAdmin. For a child, that is usually a Guardian's.

- **Reading:** the Spond Club reader also reads the member's `Medlems-e-post` and `Medlem mobil`, and up to 4 Guardians from `Foresatt N fornavn` / `Foresatt N etternavn` / `Foresatt N e-post` / `Foresatt N telefonnummer` (N = 1–4; header names confirmed against the real export). These columns are **optional**: a file without them is still accepted, and the details show as missing. A Guardian with every field empty is left out. Values are shown as they are; phones are text in `+47…` format.
- **Report:** only the "Ikke registrert i KlubbAdmin" section shows contact details: the member's email and mobile, and each Guardian's name, email and phone. Missing values show as "mangler", and a member with no Guardians shows "ingen foresatte". The other sections are unchanged.
- **Not included:** the payment contact (`Betalingskontakts …`), since it is usually one of the Guardians; KlubbAdmin contact details; and any comparison of contact details between the systems.

## Acceptance criteria

- [x] Reader tests on generated files: member email and mobile; Guardians 1–4, with an empty Guardian left out; a file without the contact and Guardian columns is still read.
- [x] Component test: an Unregistered member's email, mobile and Guardians are shown, with "mangler" and "ingen foresatte" where something is missing.

## Comments

- 2026-10-28, agent: done. `readSpondClubExport` reads `email`, `phone` and `guardians` (left out when empty, like `birthDate`), and `SpondClubMember` now extends `Person` with them (`src/matching/match.ts`); matching ignores them. The Unregistered section has the columns E-post, Mobil and Foresatte, with one line per Guardian: name · email · phone, and "navn mangler" / "e-post mangler" / "telefon mangler" for a missing part. The test fixture's Spond Club columns now have all four Guardian sets. Checked in the built page in Chromium and Firefox with invented data.
- 2026-10-28, user: the Foresatte column was cut off with the real data. Four layouts were prototyped on the real page (branch `prototype/unregistered-contacts`, commit `18e3b14`: A one Kontakt column, B a card per member, C one row per contact, D a suggested contact plus a toggle). The user chose **A**.
- 2026-10-28, agent: A is built. The E-post, Mobil and Foresatte columns are replaced by one "Kontakt" column: one line per contact, "Medlemmet" first if the member has their own email or phone, then each Guardian by name ("Foresatt" if the name is missing). Name, email and phone line up across the lines (CSS subgrid). Missing parts show as "ingen e-post" / "ingen telefon", and a member with no contacts shows "ingen kontaktinfo".
