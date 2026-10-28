# Medlemssjekk: Spond Club vs KlubbAdmin

A web page that compares a club's members in Spond Club with its members in KlubbAdmin (NIF). It lists the Spond Club members who are not registered in KlubbAdmin, possible matches to check by hand, everyone found in both, and the KlubbAdmin members who are not in Spond Club.

Use it at <https://josteitv.github.io/spondclub-klubbadmin-comparer/>.

## Privacy

The exports contain personal data. The page reads and compares them entirely in your browser: nothing is uploaded, stored or sent anywhere. Its Content-Security-Policy allows only the page's own files and blocks every network request the page could make, so the browser itself enforces this. See [ADR 0001](docs/adr/0001-browser-only-static-web-page.md).

## Development

Requires Node 24 (see `.nvmrc`).

```sh
npm install
npm run dev         # dev server
npm test            # unit and component tests
npm run typecheck   # tsc -b
npm run build       # static site in dist/
npm run check:dist  # verifies the CSP and that dist/ references no other origin
npm run preview     # serves dist/ (with the CSP, unlike the dev server)
```

Never use real exports in code or tests; tests use invented data.

## License

MIT
