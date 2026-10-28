// Test-only: runs inside an iframe that has the page's CSP (see app.browser.test.ts).
// It renders the App, drops the files it is sent, and reports the report's headings and every CSP violation.
import { h, render } from 'preact'
import { App } from './app.tsx'

const violations: string[] = []
document.addEventListener('securitypolicyviolation', (event) => {
  violations.push(`${event.effectiveDirective} ${event.blockedURI}`)
})

// Vitest's browser mode defines `define` values as globals in its own frame only, not in this one.
Object.assign(globalThis, { __APP_VERSION__: 'test' })
render(h(App, null), document.body)

const headings = () => [...document.querySelectorAll('h2')].map((heading) => heading.textContent)

window.addEventListener('message', async (event: MessageEvent<{ probe: true } | { files: File[] }>) => {
  if ('probe' in event.data) {
    // Must be blocked by connect-src 'none'; proves the policy is in force.
    const blocked = await fetch('/probe').then(
      () => false,
      () => true,
    )
    parent.postMessage({ blocked, violations: [...violations] }, '*')
    return
  }
  const dataTransfer = new DataTransfer()
  for (const file of event.data.files) dataTransfer.items.add(file)
  const zone = document.querySelector('[aria-labelledby="eksportfiler"]')!
  zone.dispatchEvent(new DragEvent('drop', { dataTransfer, bubbles: true, cancelable: true }))
  // The report appears once both files are read.
  for (let i = 0; i < 100 && !headings().includes('Funnet i begge'); i++) {
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  // Violation events are dispatched asynchronously; give any from the report time to arrive.
  await new Promise((resolve) => setTimeout(resolve, 100))
  parent.postMessage({ headings: headings(), violations: [...violations] }, '*')
})

parent.postMessage('ready', '*')
