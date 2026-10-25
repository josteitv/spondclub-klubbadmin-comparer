# Analytics and error reporting in the first version?

Type: grilling
Status: resolved

## Question

Does the first version include analytics and/or error reporting at all? If so, which cookieless EU/EEA providers, and what fixed events/error codes go through the choke point required by [ADR 0001](../../../docs/adr/0001-browser-only-static-web-page.md)?

## Answer

- **No analytics.** One Membership manager running the tool a few times a year gives no useful usage data.
- **No error reporting of any kind** in the first version: nothing automatic, and no "report a problem" link. Errors (e.g. an unrecognised export) are shown as clear messages that say what is wrong and how to fix it. Error reporting is a later feature: [error-reporting](../../error-reporting/issues/01-error-reporting.md).
- **Strict CSP.** With no CDN, no external fonts, no analytics and no error reporting, the page needs no third-party origin. The CSP is `default-src 'self'`, `connect-src 'none'`, with no inline scripts, so the browser blocks any network request the page could make. This amends [ADR 0001](../../../docs/adr/0001-browser-only-static-web-page.md): the choke point and its test are not needed while there is nothing to send.
