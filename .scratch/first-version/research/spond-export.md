# Spond member export: what can be downloaded and what it contains

Researched 2026-10-24 against the Spond help centre (help.spond.com). Resolves issue `../issues/01-spond-export.md`.

## Answer

- **Plain Spond groups (app or spond.com web):** a group admin can download the member list as an **Excel file** ("Export member list to Excel" in the app, "Download member list (Excel)" / "Last ned medlemsliste (Excel)" on the web) [S1][S1-nb]. The export is **per main group**: it is run from the main group and covers that group's subgroups, so a club with several Spond groups needs one export per group [S2]. An archived version of the official article says the workbook has several sheets: an overview of all members with **their guardians and all member fields**, a print-friendly version, and one sheet per subgroup [S2]. The current article only says the export "will also show which members belong to each subgroup" [S1].
- **Default member fields in a group** are **date of birth, address and guardians**. Admins can add custom text/number/date fields [S3]. **Gender is not a default group field** [S3]. Members and guardians both carry contact details (email/phone). Spond insists that a child's own email/phone fields stay empty unless the child has their own profile, and that the guardian's details go on the guardian [S4][S5].
- **Players vs Guardians vs admins:** in Spond's model, guardians are **attached to a member** rather than being members themselves [S4][S5], and administrators are a **separate list** ("Administrators" tab). An admin can also be a member, or be added "from guardians" [S6][S7]. The official sources do **not** say whether, or how, admins appear in the Excel export.
- **Spond Club** (the club product) has its own export: Members → Active members → select all → **Export → .xlsx** [S8]. Club default member fields include **date of birth, gender, address, guardians, nationality, country** and optionally **Member ID** (the Member ID "will be included in the member export") [S9]. The export covers all active club members across groups, but the official docs do not list its columns.
- **Removed members:** in plain groups, deleting a member removes them immediately and the docs describe no history or "former members" view [S6][S7]. Spond Club has a **Deactivated** list of deactivated members, until they are permanently deleted [S10]. Spond Club can also be **integrated with NIF**: it then shows "Members from NIF" and reports members to NIF itself [S11][S12]. That partly overlaps with this tool's purpose.

## Details

### 1. Export from a plain Spond group

**How to get it**
- App: Groups → group → Members → Excel icon (top right) → "Export member list to Excel" → share via the phone's share sheet (email, etc.) [S1].
- Web (spond.com): group → three dots on the far right of the menu bar → "Download member list (Excel)". The file downloads in the browser [S1]. Norwegian labels: "Eksporter medlemsliste til Excel" / "Last ned medlemsliste (Excel)" [S1-nb].
- Who can do it: the help centre describes it as a group-admin function [S1][S2]. Viewing members' contact information requires an admin role with the "Members" permission, which allows "viewing hidden contact information" [S1][S13]. Whether an admin without that permission gets an export without contact columns is **not documented**.

**Format**
- Described only as an "Excel file" [S1][S14]. The extension (.xlsx vs .xls) is not stated for plain groups. Spond Club's export is explicitly .xlsx [S8].

**Scope (one group vs all)**
- "You can only do this from the main group but the export will include all sub groups on separate tabs" [S2]. The current article: "If subgroups have been created, the export will also show which members belong to each subgroup" [S1].
- Nothing in the sources describes a single export across several independent main groups in the plain app. One export per Spond group is therefore needed (see Spond Club below for the alternative).

**Sheets / contents** (archived article, Oct 2024 [S2]):
1. "An overview over all members, their guardians and all member fields"
2. "A print friendly version"
3. "Each sub group separately"

The help centre does **not** publish column names or describe the layout, for example whether guardians share a row with the child or get their own rows.

**Fields available on a group member**
- Default member fields: "Date of birth, address and guardians are included by default and cannot be deleted" [S3].
- Custom group member fields can be text, number or date [S9]. They are configured per group [S3][S15].
- If the group is linked to a Spond Club, the default member fields are managed at club level [S9][S15]. This suggests club fields such as gender may then apply to the group, but the sources do not say whether those fields then appear in the group export.
- Email/phone on the member: "The contact information fields on the member are for entering the email or phone number associated with the member's/child's Spond profile if the person has their own" [S6]. For children without their own profile these "should be left blank" [S4].
- Guardian fields: when registering, the guardian enters their own name, date of birth and contact information, then the child's name, date of birth and "other fields" [S4]. Adding a person (e.g. an admin) takes first name, last name, phone number and email [S6]. Which guardian fields end up in the export is **not documented**.
- **Gender** is not among the default group fields [S3]. It exists as a default field only in Spond Club [S9].

**Players vs Guardians vs admins**
- Guardians are linked to a member ("See the member's guardians", "Edit the member and/or guardian") [S1]. Children are added "one by one as individual members of the group, and the same guardian can be set as the guardian for both/all children" [S4]. A guardian is therefore not a member row in their own right in Spond's model.
- Administrators are listed separately: "select *Administrators* to view all others with an admin role" [S1]. Admins can be added as a new person, "from members" or "from guardians". When an admin is removed, Spond asks whether to keep them as a member if "[Name] is also a member" [S6]. So a person can be an admin without being a member.
- The sources do **not** say whether admins who are not members appear in the export, or whether there is a role/type column.

### 2. Export from Spond Club

- Members → Active Members shows "all active club members with an approved membership". Selecting one, several or all members (checkbox by "First Name") and clicking **Export** downloads "an .xlsx file" [S8].
- The list supports configurable columns and filters on standard fields such as "date of birth, gender, country, approval of the club's terms, photo consent" plus custom club fields [S16]. The docs do not say whether the export follows the chosen columns or always contains every field.
- Default club member fields: Date of Birth, Member ID (optional unless NIF-integrated; "The field will be included in the member export"), Guardians, Nationality, Country, Address, Gender [S9].
- A member profile shows name, date of birth, contact details, membership status, guardians/payment contacts, and the groups and subgroups the member belongs to [S17].
- Group membership types when adding club members to a group: "Group Member", "Group Administrator", "Group Administrator and Member" [S8]. This shows the data model separates admin and member roles per group.
- Custom *group* member fields are **not** visible in Spond Club [S9].
- Each person has one member type in the club regardless of how many groups they belong to [S8]. The Spond Club export is therefore the natural source for a club-wide, de-duplicated list, but only if the club uses Spond Club.

### 3. Removed / left members

- Plain groups: "When you remove a member, they are removed from the group and lose access to group activities and information immediately" [S6]. Removing a person entirely "cannot be undone" [S6]. The help centre describes no history, archive or "former members" list for groups.
- Spond Club: deactivated members are moved to Members → Deactivated, where they keep their data and can be reactivated. Permanent deletion removes all data [S10]. The docs do not say whether the Deactivated list can be exported.
- Spond Club with NIF integration: "Members from NIF" lists people NIF registers as club members. Deactivating there withdraws the member from NIF [S11]. The integration reports members to NIF from Spond Club [S12].

### 4. Secondary indication (unofficial API, not a primary source)

The open-source `spond` Python package (unofficial) documents that each group from `get_groups()` has a `members` list. Each member has `id`, `firstName`, `lastName`, and, for child profiles, a nested `guardians` list of the same shape; lookups also match on `email` [S18]. This matches the help centre's model of guardians nested under members. It says nothing about the Excel export layout.

## Open / unverified (confirm against a real export file)

1. Exact sheet names and column headers of the plain-group Excel export, in both the Norwegian and English UI. Is it .xlsx?
2. Guardian layout: guardian columns on the child's row (Guardian 1/2 …) or separate rows, and which guardian fields are included (name, email, phone, address?).
3. Whether group admins who are not members appear in the export, and whether any column distinguishes member/admin/guardian.
4. Whether date of birth is present for every Player (it is a default field but may be empty), and the date format.
5. Whether gender appears in the group export when the group is linked to a Spond Club. Is it absent otherwise?
6. Whether email/phone columns are empty for children (expected per Spond guidance), so matching must rely on name + date of birth.
7. Whether the export content depends on the exporting admin's permissions (hidden contact information).
8. Whether Spond Club's .xlsx export includes all fields or only the visible columns, and whether it includes group/subgroup membership and Member ID / NIF ID.
9. Whether any export (plain group or Spond Club Deactivated list) exposes removed/left members.
10. Whether the club actually uses Spond Club and its NIF integration. If it does, the comparison problem may partly be solved inside Spond Club already.

## Sources

- [S1] Spond help, "Other functions for group admins" (updated 7 May 2026): https://help.spond.com/app/en/articles/136364-other-functions-for-group-admins
- [S1-nb] Same article in Norwegian, "Andre funksjoner i grupper for gruppeadministrator": https://help.spond.com/app/nb/articles/136364-andre-funksjoner-i-grupper-for-gruppeadministrator
- [S2] Spond help, "Spond App: How to download a group member list from the app" (archived 15 Oct 2024; the live URL now only shows the help-centre landing page): https://web.archive.org/web/20241015024733/https://help.spond.com/en/articles/25936-spond-app-how-to-download-a-group-member-list-from-the-app
- [S3] Spond help, "Member overview: status, colour codes, import/export and member management": https://help.spond.com/app/en/articles/203929-member-overview-status-colour-codes-import-export-and-member-management
- [S4] Spond help, "Correct Registration of Children and Guardians in Spond app": https://help.spond.com/app/en/articles/301491-correct-registration-of-children-and-guardians-in-spond-app
- [S5] Spond help (Club), "Managing Member Information", guardians section: https://help.spond.com/club/en/articles/182663-managing-member-information
- [S6] Spond help, "Add administrators and edit/delete members and administrators in groups" (updated 2 Sep 2026): https://help.spond.com/app/en/articles/131486-add-administrators-and-edit-delete-members-and-administrators-in-groups
- [S7] Same as S6 (admin removal / "is also a member" dialog).
- [S8] Spond help (Club), "Active members": https://help.spond.com/club/en/articles/200715-active-members
- [S9] Spond help (Club), "How to Manage Member Fields in Spond Club" (23 Mar 2026): https://help.spond.com/club/en/articles/197447-member-fields
- [S10] Spond help (Club), "Managing Deactivated Members in Spond Club": https://help.spond.com/club/en/articles/182649-managing-deactivated-members-in-spond-club
- [S11] Spond help (Club), "Members from NIF": https://help.spond.com/club/en/articles/196628-members-from-nif
- [S12] Spond help (Club), "How Does the NIF Integration Work?": https://help.spond.com/club/en/articles/200713-how-does-the-nif-integration-work
- [S13] Spond help, "Group settings for group admins in Spond app" (roles and permissions; Members permission): https://help.spond.com/app/en/articles/133292-group-settings-for-group-admins
- [S14] = S3 ("You'll get an Excel file with the member list").
- [S15] = S13 (Member fields section).
- [S16] Spond help (Club), "Filtering and Columns in Spond Club": https://help.spond.com/club/en/articles/182677-filtering-and-columns-in-spond-club
- [S17] = S5.
- [S18] Unofficial: `Olen/Spond` Python package, `spond/spond.py` docstrings: https://github.com/Olen/Spond/blob/main/spond/spond.py
