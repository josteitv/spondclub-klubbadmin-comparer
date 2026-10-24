# How will the Membership manager run the tool?

Type: grilling
Status: resolved

## Question

What technical form lets a non-tech-savvy Membership manager run the comparison, with a UI possible eventually, while no personal data ever reaches a third-party provider? Candidates include a local desktop app, a static web page that processes files only in the browser, or a script. Covers installation/distribution, updates, and how the GDPR constraint is guaranteed.

## Answer

- **Form:** a static web page with no backend and nothing to install. The Membership manager drops both exports into the page, and they are read and compared entirely in the browser tab. Desktop app and script were rejected. See [ADR 0001](../../../docs/adr/0001-browser-only-static-web-page.md).
- **Users:** the club's Membership manager on a Windows 11 PC, a few times a year. The tool is built so other clubs can use it too.
- **Browsers:** current desktop Edge, Chrome, Firefox and Safari. Phones and tablets are not targeted.
- **Hosting and updates:** GitHub Pages now, our own domain later. Every push to `main` deploys automatically, and the page shows its version. Relying on the hosted code is accepted; clubs wanting more assurance can host their own copy.
- **GDPR guarantee:** data from the exports, and anything derived from it, never leaves the browser. CDNs, external fonts, analytics and error reporting are allowed but never carry such data. Enforcement:
  - A CSP that allowlists only the domains in use.
  - Subresource Integrity on CDN scripts.
  - One choke point for analytics and error reports that sends only fixed event names and error codes; no session replay or content-capturing breadcrumbs.
  - A test with invented exports that asserts no file value reaches that choke point.
- **Third-party providers:** prefer cookieless ones that process data in the EU/EEA, to avoid a consent banner. Specific providers are chosen in the spec.
- **Nothing left behind:** the first version stores nothing, and closing the tab wipes everything. The page reminds the user to delete the downloaded exports. Saved sessions are a future feature: [saved-session](../../saved-session/issues/01-saved-session.md).
- **Languages:** the interface is in Norwegian bokmål and English, picked from the browser language with Norwegian as the default, plus a visible switch. The choice isn't stored. Code, docs and tickets are in English.
- **Export instructions:** step-by-step instructions for both exports, shown in the tool.
- **Wrong export format:** the file is rejected with a clear error that points to the export instructions. The tool never guesses.
- **Stack:** TypeScript with Svelte or Preact, a bundled `.xlsx` parser chosen after checking how candidates are licensed and maintained, and CI tests with invented data. The build tool is decided in [07](07-build-tool.md).
- **Repo:** public, MIT license.
