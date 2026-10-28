# Copy contact details with one click

Type: task
Status: resolved
Blocked by: 18

## What to build

Asked by the user on 2026-10-28, to make moving data into KlubbAdmin easier. In the Kontakt column of "Ikke registrert i KlubbAdmin", one click on an email address or a phone number copies it to the clipboard, and a short message confirms it ("Kopiert: …") or says that copying failed.

- **Phone numbers** are copied in KlubbAdmin's form (user's choice): a Norwegian number (`+47` plus 8 digits, spaces allowed) is copied as the 8 digits without `+47`. Any other number is copied as shown. The page still shows the number as Spond Club has it.
- **Email addresses** are copied as shown.
- **Privacy:** copying is local and only happens on the user's click (`navigator.clipboard.writeText`). Nothing leaves the browser; the CSP is unchanged.

## Acceptance criteria

- [x] Component tests: an email is copied and confirmed; a Norwegian number (with and without spaces) is copied without `+47`; a foreign number is copied as shown; a refused copy shows the failure message.
- [x] Works in the built page: checked in Chromium (clipboard read back) and Firefox.

## Comments

- 2026-10-28, agent: done in `src/report.tsx` (`CopyButton`, `useCopy`). The email addresses and numbers are buttons styled as text, with a copy cursor and a dotted underline on hover, so they work with the keyboard too. The message is a `role="status"` line fixed at the bottom of the page; it stays in the page while empty, so screen readers announce each message, and it fades after 3 seconds.
