# KlubbAdmin member export: what it contains

Research for issue [02-klubbadmin-export](../issues/02-klubbadmin-export.md). Researched 2026-10-24. Sources are NIF's own pages on idrettsforbundet.no unless stated otherwise.

## Answer

- **Export exists, format is "Excel", columns are user-selectable.** From the member search (Medlem → Medlemmer) the Membership manager clicks an export button. A pop-up then lets them pick which fields to export to Excel. They can export all search hits or only ticked rows. Export also works from utvalg and from group/gren level. The club name and date are in the **file name**, not in a header row. [H2016]
- **NIF publishes no column list.** What the release notes do say: there are columns for "verified with fødselsnummer", group/gren (several values in one cell, with a separator), medlemsdetaljer and utvalg. Guardians (foresatte) can optionally be included with email and mobile. Kontingent status and unntak can be included. [H2016] [H2021] The exact headers, the file extension (.xlsx or .xls) and how each column is encoded have to be confirmed against a real export.
- **Membership "types" are not a fixed field.** The structural split is *member* (club level only) versus *active* (also in one or more **gren**). Labels such as "aktiv", "støttemedlem" or "familie" are free-text **kontingent names** with no effect on rights. Utvalg are club-defined groupings, for example a team or honorary members. [Aktive] [Riktig] [Kontingent] [Utvalg]
- **Organisation links:** Klubb → Gruppe (særidrett) → Gren (the activity), plus club-defined Utvalg, which can stand for a lag or team. [KGG] [Utvalg] KlubbAdmin has no Spond-style team model. A team exists in KlubbAdmin only if the club has created it as an utvalg. A newer "Idrettsgrupper" feature in Min idrett (lag/treningsgrupper) was announced in January 2026. [Innmelding2026]
- **Manual registration (allowed "for now"):** required fields are first name, last name, date of birth, gender, citizenship, address, postcode/place and email. After that the admin picks a gren. [RegNy] Since December 2023 only certain roles may do this, and NIF prefers self-signup at medlemskap.nif.no. Every member under 15 must have at least one foresatt. [Endr2023]
- **Import / API:** KlubbAdmin's own help pages describe no import function for clubs. NIF has a Third-Party Member API, but it is for registered vendors of NIF-approved member systems, not for clubs' ad-hoc use. [API-search] So the input to our tool is a manual Excel export.

## Details with citations

### Export function

- MedlemsAdministrasjon 2.1 (14 June 2016): "Nå kan du selv velge hvilke felter du ønsker å eksportere til Excel." The export is available for persons, utvalg and fakturahistorikk. You can tick individual people in the person search and export only those. Clicking the export button opens a pop-up with more choices. [H2016]
- 5 July 2016: the Excel export was fixed (medlemsdetaljer, sorting). The separator character in the **gruppe og gren** column was changed. Too many memberships under gruppe/gren were fixed. This tells us gruppe/gren is a single multi-valued column. [H2016]
- 14 December 2016 [H2016]:
  - A column was added showing whether the member has verified themselves with fødselsnummer in Min idrett.
  - More information was added on gruppe/gren, medlemsdetaljer and utvalg when exporting from utvalg. Gruppe/gren info was added when exporting from gruppe and gren.
  - "Eksport - mer informasjon om foresatte": when you choose to export foresatte, their email and mobile are included.
  - The first row (club and date) was removed and moved into the file name.
- 2019: the Excel export was fixed for utvalg of other organisations and for export of members at gren/utvalg level. Exporting data on utmeldte (resigned) members was fixed. [H2019]
- 20 April 2021: "Eksport medlemssøk kan man nå velge kontingent status og unntak." Display and export of more than 1000 members was fixed. [H2021]
- 23 February 2021: new columns in the **member overview** (on screen; not stated to be in the export): Utmeldt-dato, Verifisert bruker, **PersonId**. [H2021]
- 2022: a warning message was added when exporting search results. [H2022]
- Useful search filters: "Medlemmer uten grenmedlemskap" [Riktig], "medlemmer som ikke er med i noe utvalg", and members without email. [H2016]
- No NIF help article describes the current export step by step. The KlubbAdmin FAQ and the Medlem guide list have no article on export or lists. [FAQ] [MedlemGuide]

### Member data held / fields

- Forskrift om medlemsregister (Idrettsstyret, 14 February 2013), § 3: clubs must register full name, address, gender, birth date, email, phone, tillitsverv, date of membership payment, dates of joining and leaving, active affiliation to særidretter, and payment date of activity fees. Fødselsnummer is used for checks against Folkeregisteret but must not be stored in the registers. [Forskrift2013] A newer revision exists (Idrettsstyret sak 42, 11 November 2025). Its text could not be extracted (image PDF). [Sak42]
- Profile card tabs include Personalia, Medlemsdetaljer and Relasjoner. Name, gender and birth date cannot be edited for members validated with fødselsnummer. Address is overwritten by the Folkeregister check. [Endre]
- Medlemsdetaljer are custom club-defined fields: free text, date, yes/no, integer, decimal or dropdown. [Detaljer]
- Everyone in KlubbAdmin has an Idrettens ID, i.e. is verified. [Verif2026]
- Duplicates are found manually and merged with "Merk duplikat". [Duplikat]

### Membership categories

- Members are everyone registered at club level. Membership is valid only once the kontingent is paid (minimum NOK 50). Active members are also registered at **gren** level and take part regularly. [Aktive]
- Two kinds of registration: club level only (for example støttemedlem, parent, coach, referee, board), or club level plus active in one or more idrettsgrener. Members are placed in a gren via Verktøy → "Plasser i utvalg" or the profile tab "Gruppe/Gren/Utvalg". [Riktig]
- Kontingent names are free, for example active, passive, support, family or honorary. The name does not change membership rights. Fee models: flat, aldersmatrise, exceptions, familiekontingent. [Kontingent]

### Organisation structure (grener, grupper, lag)

- Klubb is the legal entity. Gruppe for særidrett sits under the klubb. Gren is the activity itself, for example langrenn under ski. [KGG]
- Utvalg is a grouping of members within the club, for example a team under a sport, honorary members or support members. [Utvalg]
- In January 2026 NIF announced "Idrettsgrupper – organiser medlemmer i egne treningsgrupper, lag, partier" in Min idrett. Non-members can join a group with a code. [Innmelding2026]

### Guardians (foresatte) / family

- Family relations link existing persons in the register (Verktøy → "Lag familierelasjon", or the Relasjoner tab). They are used for family kontingent. [Familie]
- Every member under 15 must have at least one foresatt. [Endr2023]
- Foresatte can be included in exports (email and mobile) [H2016] and in email/SMS sendings [FAQ]. In 2016 foresatte were left out of the member list by default. [H2016]

### Registering a new member manually

- KlubbAdmin "tillater inntil videre manuell registrering av personer". The admin searches for the person. If they have an Idrettens ID, they are linked. Otherwise "Opprett ny person". Required: Fornavn, Etternavn, Fødselsdato, Kjønn, Statsborgerskap, Adresse, Postnummer/sted, E-postadresse. Then the admin selects the idrettsgren and checks the Klubb/Gruppe/Gren summary. Phone and guardian are not mentioned. [RegNy]
- Since December 2023 only Leder, Daglig leder or Adm.leder in the club may register new members manually. Reasons: every member must be validated with fødselsnummer, and children must not be registered without a foresatt (all members under 15 need one). [Endr2023]
- The preferred route is invitation by email or phone (Medlem → Nytt medlem) → self-signup at medlemskap.nif.no. [Invitere] [Innmelding]

### Import and API

- The KlubbAdmin FAQ and the Medlem guides describe no member import. [FAQ] [MedlemGuide] One regional NIF body (Oslo og Akershus Bedriftsidrettskrets) says clubs with more than 50 members can send an Excel template to support for import. This is secondary and specific to bedriftsidrett. [OABIK]
- The NIF Third-Party Member API (api-portal.nif.no) targets vendors of third-party member systems. The third party must be registered with NIF and authorised by the club. It has endpoints for org structure, members and adding memberships. [API-search] The wiki pages did not render for fetching, so this is based on the search-index summary of NIF's wiki only.
- Clubs must use exactly one NIF-approved member system: KlubbAdmin or a system with an approved integration. [Sak42-search] The 2013 lecture shows KlubbAdmin as having "Integrasjon 3. part". [Foredrag2013]
- NIF also documents **IMS** (imssupport@idrettsforbundet.no, imsapp.nif.no), a separate NIF member system with "medlemskategorier", treningsavgift and "partier". [IMS] This research assumes the club uses KlubbAdmin.

## Open / unverified (confirm against a real export file)

1. Exact column headers and their order in the default export, and which fields the pop-up offers.
2. File type (.xlsx or .xls), sheet name, header row, encoding of Norwegian characters, and date format of Fødselsdato.
3. Whether **PersonId** (Idrettens ID) can be exported. It is shown in the overview since 2021, but the export is not confirmed. This matters for stable matching.
4. The separator used in the multi-valued gruppe/gren and utvalg columns, and whether ended (avsluttede) gren memberships appear.
5. How foresatte appear when included: extra columns on the child's row, or extra rows.
6. Whether resigned (utmeldte) or unpaid members are included by default. Membership is only valid once paid.
7. Whether phone (mobil) is a column for the member, and whether children have their own email or phone.
8. The current requirements in the 2025 revision of the member-register rules (sak 42). The PDF text could not be read.
9. The current UI. Release notes after 2022 are not published, so screens may differ from the 2016–2022 notes.

## Sources

- [H2016] KlubbAdmin – Historikk – 2016: https://www.idrettsforbundet.no/digital/klubbadmin/oppdateringer/klubbadmin-historikk-2016/
- [H2019] KlubbAdmin – Historikk – 2019: https://www.idrettsforbundet.no/digital/klubbadmin/oppdateringer/klubbadmin-historikk-2019/
- [H2021] KlubbAdmin – Historikk – 2021: https://www.idrettsforbundet.no/digital/klubbadmin/oppdateringer/klubbadmin-2021/
- [H2022] KlubbAdmin – 2022: https://www.idrettsforbundet.no/digital/klubbadmin/oppdateringer/klubbadmin-2022/
- [FAQ] KlubbAdmin spørsmål og svar: https://www.idrettsforbundet.no/digital/klubbadmin/sporsmal-og-svar/
- [MedlemGuide] KA – Medlemsadministrasjon: https://www.idrettsforbundet.no/digital/klubbadmin/medlem/
- [RegNy] Hvordan registrerer jeg nye medlemmer?: https://www.idrettsforbundet.no/digital/klubbadmin/sporsmal-og-svar/hvordan-registrere-nye-medlemmer/
- [Endr2023] Endringer i KlubbAdmin (18 Dec 2023): https://www.idrettsforbundet.no/digital/klubbadmin/nyheter/endringer-i-klubbadmin2/
- [Invitere] Invitere nye medlemmer: https://www.idrettsforbundet.no/digital/klubbadmin/medlem/invitere-nye-medlemmer/
- [Innmelding] Innmelding: https://www.idrettsforbundet.no/digital/klubbadmin/medlem/innmelding/
- [Riktig] Hvordan registrere medlemmer riktig?: https://www.idrettsforbundet.no/digital/klubbadmin/medlem/hvordan-registrere-medlemmer-riktig/
- [Aktive] Medlemmer og aktive – hva er forskjellen?: https://www.idrettsforbundet.no/digital/klubbadmin/medlem/medlemmer-og-aktive-hva-er-forskjellen/
- [Kontingent] Hvordan opprette avgift? Medlemskontingent: https://www.idrettsforbundet.no/digital/klubbadmin/sporsmal-og-svar/medlemskontingent/
- [KGG] Forskjell på klubb, gruppe og gren: https://www.idrettsforbundet.no/digital/klubbadmin/sporsmal-og-svar/forskjell-pa-klubb-gruppe-og-gren/
- [Utvalg] Utvalg – hva er det: https://www.idrettsforbundet.no/digital/klubbadmin/medlem/utvalg-hva-er-det-og-hvordan-opprette-det/
- [Detaljer] Medlemsdetaljer – hva er det?: https://www.idrettsforbundet.no/digital/klubbadmin/medlem/medlemsdetaljer-hva-er-det/
- [Endre] Hvordan gjøre endringer på et medlem?: https://www.idrettsforbundet.no/digital/klubbadmin/medlem/hvordan-gjore-endringer-pa-et-medlem/
- [Familie] Hvordan lage familierelasjon?: https://www.idrettsforbundet.no/digital/klubbadmin/medlem/hvordan-lage-familierelasjon/
- [Duplikat] Samme person ligger oppført to ganger?: https://www.idrettsforbundet.no/digital/klubbadmin/medlem/samme-person-ligger-oppfort-to-ganger/
- [Verif2026] Medlems- og aktivitetstall for 2026 (1 Oct 2026): https://www.idrettsforbundet.no/digital/klubbadmin/nyheter/verifiserte-medlemmer/
- [Innmelding2026] Forbedret innmelding og organisering av idrettslag (8 Jan 2026): https://www.idrettsforbundet.no/digital/klubbadmin/nyheter/forbedret-innmelding-og-organisering/
- [Forskrift2013] / [Foredrag2013] KlubbAdmin foredrag (NIF IT, quotes the forskrift of 14 Feb 2013): https://www.idrettsforbundet.no/siteassets/trondelag-idrettskrets/sor-trondelag/dokumenter/kurs/styrekurs/klubbadmin--foredrag.pdf
- [Sak42] Idrettsstyret sak 42, regler for medlemsregistrering (11 Nov 2025): https://www.idrettsforbundet.no/contentassets/5ae30a885ac046d6b3fa2eaf1f8df1b8/sak-42-regler-for-medlemsregistrering-idrettsstyrevedtak-11.11.25.pdf ([Sak42-search]: the "one system per club / approved integration" point comes from the search-index summary of this document, not from text I extracted myself.)
- [API-search] NIF Third-Party Member API documentation (vendor docs on NIF's Atlassian wiki): https://idrettsforbundet.atlassian.net/wiki/download/attachments/14024708/Third-Party+Member+API+Documentation_v1.9.pdf?version=1 and https://idrettsforbundet.atlassian.net/wiki/x/AYC6I. The pages did not render when fetched, so the claims rest on the search-index summary.
- [IMS] IMS – Innmelding for nye medlemmer: https://www.idrettsforbundet.no/siteassets/idrettsforbundet/digital/ims/innmelding-for-nye-medlemmer.pdf
- [OABIK] Oslo og Akershus Bedriftsidrettskrets – KlubbAdmin (secondary): https://oa.bedriftsidretten.no/next/p/33172/klubbadmin
