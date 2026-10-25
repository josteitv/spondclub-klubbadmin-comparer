// Checks the built page against ADR 0001: the strict CSP is present,
// nothing references another origin, and there are no inline scripts.
// Usage: node scripts/check-dist.ts <dist dir>
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { CSP } from '../build/csp.ts'

const TEXT_FILES = /\.(html|css|js|mjs|svg|json|webmanifest)$/

// Absolute or protocol-relative URLs in attributes, CSS url() and JS imports.
const EXTERNAL_URL = /(?:\b(?:src|href|action|poster|srcset)\s*=\s*["']?|url\(\s*["']?|\bimport\s*\(?\s*["']|\bfrom\s*["'])(\s*(?:https?:)?\/\/[^"')\s>]+)/gi

export function checkHtml(html: string): string[] {
  const problems: string[] = []
  const csp = html.match(/<meta\s+http-equiv=["']Content-Security-Policy["']\s+content=(?:"([^"]*)"|'([^']*)')/i)
  const policy = csp?.[1] ?? csp?.[2]
  if (policy === undefined) problems.push('index.html: missing Content-Security-Policy <meta> tag')
  else if (policy !== CSP) problems.push(`index.html: CSP differs from build/csp.ts: "${policy}"`)

  for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (!/\bsrc\s*=/.test(attrs) || body.trim() !== '') problems.push('index.html: inline <script> found')
  }
  return problems
}

export function checkExternalUrls(name: string, text: string): string[] {
  return [...text.matchAll(EXTERNAL_URL)].map(([, url]) => `${name}: references external URL ${url.trim()}`)
}

export function checkDist(dir: string): string[] {
  const problems = checkHtml(readFileSync(join(dir, 'index.html'), 'utf8'))
  for (const entry of readdirSync(dir, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !TEXT_FILES.test(entry.name)) continue
    const path = join(entry.parentPath, entry.name)
    problems.push(...checkExternalUrls(relative(dir, path), readFileSync(path, 'utf8')))
  }
  return problems
}

if (import.meta.main) {
  const problems = checkDist(process.argv[2] ?? 'dist')
  for (const problem of problems) console.error(problem)
  if (problems.length > 0) process.exit(1)
  console.log('dist check passed')
}
