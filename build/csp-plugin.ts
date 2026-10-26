import type { Plugin } from 'vite'
import { CSP } from './csp.ts'

// Build only: the dev server injects inline <style> tags for hot reload,
// which this policy would block.
export function cspMetaTag(): Plugin {
  return {
    name: 'csp-meta-tag',
    apply: 'build',
    transformIndexHtml: {
      order: 'pre',
      handler: () => [
        {
          tag: 'meta',
          attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP },
          injectTo: 'head-prepend',
        },
      ],
    },
  }
}

// Tests only: serves /__csp-frame?module=/src/… as a page with the CSP above that runs that module,
// so browser tests can check code under the real policy. A srcdoc frame won't do: Firefox doesn't
// treat its URL as 'self'.
export function cspTestFrame(): Plugin {
  return {
    name: 'csp-test-frame',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__csp-frame', (req, res) => {
        const module = new URL(req.url ?? '', 'http://localhost').searchParams.get('module') ?? ''
        if (!/^\/src\/[\w/.-]+\.ts$/.test(module)) {
          res.statusCode = 400
          res.end()
          return
        }
        res.setHeader('Content-Type', 'text/html')
        res.end(
          `<!doctype html><meta http-equiv="Content-Security-Policy" content="${CSP}">` +
            `<script type="module" src="${module}"></script>`,
        )
      })
    },
  }
}
