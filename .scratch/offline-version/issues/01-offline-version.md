# Offline version for Windows

Type: task
Status: needs-triage

## Idea

The first version is web only. A later version adds an offline version that the Membership manager downloads and runs on a Windows PC without a network connection. Ideally it is the same app packaged in an installer, not a separate codebase. When a newer version exists, the offline version asks the Membership manager to update.

## Requirements

- Same app as the web version: the same source and features, packaged differently.
- Installer for Windows.
- On start, the offline version checks for a newer version and, if one exists, asks the Membership manager to update. Without a network connection it still runs.
- The GDPR guarantee in [ADR 0001](../../../docs/adr/0001-browser-only-static-web-page.md) still holds: export data, and anything derived from it, never leaves the PC. The update check sends nothing from the exports.

## Constraint on the web version (applies now)

No technical choice made for the web version may conflict with the offline version. In practice the first version must:

- work fully without network access once loaded: app code, the `.xlsx` parser and fonts are bundled, not loaded from a CDN at runtime;
- treat analytics and error reporting as optional extras that fail silently when offline;
- use relative asset paths, not ones tied to the GitHub Pages base path or a domain;
- not depend on a server or on features only available over `https://` from a hosted origin.

## To explore later

- Packaging: e.g. a PWA, Tauri (WebView2) or Electron; installer size and how much browser it ships.
- Code signing and Windows SmartScreen warnings.
- How the update check and update work, and where the version manifest is published.
- Whether analytics and error reporting are kept in the offline version at all.

Raised after [first-version 05](../../first-version/issues/05-how-to-run.md), which chose a web page over a desktop app for the first version.
