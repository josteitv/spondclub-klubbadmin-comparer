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
