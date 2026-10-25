// The page's Content-Security-Policy (ADR 0001, ticket 10): only its own origin,
// and no network requests of its own, so export data can't leave the browser.
// Delivered as a <meta> tag because GitHub Pages can't send headers.
export const CSP_DIRECTIVES: Record<string, string> = {
  'default-src': "'self'",
  'script-src': "'self'",
  'style-src': "'self'",
  'img-src': "'self' data:",
  'font-src': "'self'",
  'connect-src': "'none'",
  'worker-src': "'none'",
  'object-src': "'none'",
  'base-uri': "'none'",
  'form-action': "'none'",
}

export const CSP = Object.entries(CSP_DIRECTIVES)
  .map(([directive, value]) => `${directive} ${value}`)
  .join('; ')
