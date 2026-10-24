# What does KlubbAdmin's member export contain?

Type: research
Status: resolved

## Question

What member export can a club admin download from KlubbAdmin (NIF), and what does it contain? Format, columns, membership types/categories, links to activities/teams (grener/lag), and which fields are required when registering a new member manually. Cite primary sources (NIF/KlubbAdmin help pages).

## Answer

- KlubbAdmin can export member search results (all hits or ticked rows, also from gruppe/gren/utvalg) to Excel. A pop-up lets you choose fields, and the club and date go into the file name. NIF publishes no column list.
- Known exportable data: personalia, a "verified with fødselsnummer" flag, a multi-valued gruppe/gren column, utvalg, medlemsdetaljer, kontingent status/unntak, and optionally foresatte (email and mobile). Whether PersonId can be exported is unconfirmed.
- No fixed member type. The split is member (club level) versus active (also in a gren). Labels like "støttemedlem" are free-text kontingent names. Teams exist only as club-defined utvalg.
- Manual registration requires first/last name, birth date, gender, citizenship, address, postcode/place and email. Only leader roles may do it, and members under 15 must have a foresatt.
- Clubs get no import function and no API (the NIF API is for approved vendors), so the tool's input is the manual Excel export. The exact format must be confirmed with a real file (see issue 03).

Details: [../research/klubbadmin-export.md](../research/klubbadmin-export.md)
