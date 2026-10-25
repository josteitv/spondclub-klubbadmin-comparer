import { describe, expect, it } from 'vitest'
import { CSP } from '../build/csp.ts'
import { checkExternalUrls, checkHtml } from './check-dist.ts'

const page = (head: string, body = '') =>
  `<!doctype html><html><head>${head}</head><body>${body}</body></html>`
const cspTag = `<meta http-equiv="Content-Security-Policy" content="${CSP}">`
const entry = '<script type="module" crossorigin src="./assets/index-abc.js" integrity="sha384-x"></script>'

describe('checkHtml', () => {
  it('accepts the built page shape', () => {
    expect(checkHtml(page(cspTag + entry))).toEqual([])
  })

  it('rejects a missing CSP', () => {
    expect(checkHtml(page(entry))).toEqual(['index.html: missing Content-Security-Policy <meta> tag'])
  })

  it('rejects a CSP that differs from build/csp.ts', () => {
    const loose = `<meta http-equiv="Content-Security-Policy" content="default-src *">`
    expect(checkHtml(page(loose + entry))[0]).toMatch(/CSP differs/)
  })

  it('rejects an inline script', () => {
    expect(checkHtml(page(cspTag + entry, '<script>alert(1)</script>'))).toEqual(['index.html: inline <script> found'])
  })
})

describe('checkExternalUrls', () => {
  it('rejects an external script', () => {
    const html = page(cspTag + '<script src="https://cdn.example.com/lib.js"></script>')
    expect(checkExternalUrls('index.html', html)).toEqual([
      'index.html: references external URL https://cdn.example.com/lib.js',
    ])
  })

  it('rejects protocol-relative URLs, CSS url() and JS imports', () => {
    expect(checkExternalUrls('a.html', '<link href="//fonts.example.com/x.css">')).toHaveLength(1)
    expect(checkExternalUrls('a.css', 'body{background:url("https://img.example.com/a.png")}')).toHaveLength(1)
    expect(checkExternalUrls('a.js', 'import x from"https://esm.example.com/x.js";import("http://e.example.com/y.js")')).toHaveLength(2)
  })

  it('ignores same-origin paths and namespace strings', () => {
    expect(checkExternalUrls('a.html', '<link rel="icon" href="./favicon.svg"><script src="./assets/a.js"></script>')).toEqual([])
    expect(checkExternalUrls('a.js', 'const ns="http://www.w3.org/2000/svg"')).toEqual([])
  })
})
