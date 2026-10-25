# Error reporting

Type: task
Status: needs-triage

## Idea

The first version has no error reporting: errors are only shown to the Membership manager as clear messages ([first-version 10](../../first-version/issues/10-analytics.md)). A later version could let problems reach the maintainers, for example:

- a "report a problem" link to a GitHub issue form, pre-filled with only a short error code, the tool version and the browser, warning in bold never to paste names, birth dates or the export files (the repo is public);
- a fallback for Membership managers without a GitHub account;
- or automatic reporting to a cookieless EU/EEA provider.

Requirements from [ADR 0001](../../../docs/adr/0001-browser-only-static-web-page.md): nothing from the exports is ever sent. Anything automatic goes through one choke point that sends only fixed error codes, with a test asserting that no file value reaches it, and the strict CSP is loosened for that one origin only.
