# Which .xlsx parser does the web page bundle?

Type: research
Status: claimed

## Question

Which library should the static, browser-only web page bundle to read the Spond Club and KlubbAdmin `.xlsx` exports? Compare candidates such as SheetJS (xlsx), ExcelJS, read-excel-file and a minimal unzip + XML approach (e.g. fflate). Criteria: licence (the repo is MIT), maintenance health and how it is distributed (SheetJS no longer publishes to npm), bundle size, runs fully in the browser with no network at runtime (offline-version constraint, [ADR 0001](../../../docs/adr/0001-browser-only-static-web-page.md)), TypeScript types, known security advisories, and whether it handles what the exports need: shared strings, Excel date serials with `dd.mm.yyyy` format, text-formatted cells, a trailing empty row. Also: can tests generate `.xlsx` files with invented data using the same or a companion library. Cite primary sources.
