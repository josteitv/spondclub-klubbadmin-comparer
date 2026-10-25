# Browser-only static web page; export data never leaves the browser

The tool is a static web page with no backend. The Membership manager drops the Spond Club and KlubbAdmin exports into the page, and they are parsed and compared entirely in the browser tab. We chose this over a desktop app (installers, SmartScreen warnings and manual updates for a tool run a few times a year) and a script (needs a runtime and a command line, unusable by a non-tech-savvy Membership manager). The page also works for other clubs on any OS, needs no install and updates on every deploy. The guarantee is narrow: data from the exports, and anything derived from it, is never uploaded. Third-party CDNs, fonts, analytics and error reporting are allowed, so a blanket network block is not an option.

## Consequences

- A CSP allowlists only the domains in use, and CDN scripts carry Subresource Integrity hashes.
- All analytics and error reporting goes through one choke point that sends only fixed event names and error codes, never messages built from export values. No session replay or content-capturing breadcrumbs. A test with invented exports asserts that no file value reaches the choke point.
- Prefer cookieless providers that process data in the EU/EEA, since every request still sends the Membership manager's IP address.
- The first version stores nothing in the browser; closing the tab wipes everything.
- Adding a backend, or any feature that uploads export data, reverses this decision.
- Amended 2026-10-25: the first version uses none of the allowed third-party services (no CDN, external fonts, analytics or error reporting; see `.scratch/first-version/issues/10-analytics.md`). Its CSP therefore is `default-src 'self'` with `connect-src 'none'`, a blanket network block after all, and the choke point is not built. Adding analytics or error reporting later means loosening the CSP for that one origin and building the choke point and its test first.
- A desktop app is rejected for the first version only. A later offline version for Windows will package this same page in an installer (see `.scratch/offline-version/`), so the page must run fully offline once loaded: its code, `.xlsx` parser and fonts are bundled rather than loaded from a CDN at runtime, analytics and error reporting fail silently, and asset paths are relative.
