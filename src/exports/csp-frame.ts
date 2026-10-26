// Test-only: runs inside an iframe that has the page's CSP (see read-export.browser.test.ts).
// It reads the file it is sent and reports the result and every CSP violation back to the test.
import { readSpondClubExport } from './read-export.ts'

const violations: string[] = []
document.addEventListener('securitypolicyviolation', (event) => {
  violations.push(`${event.effectiveDirective} ${event.blockedURI}`)
})

window.addEventListener('message', async (event: MessageEvent<{ probe: true } | { file: Blob }>) => {
  if ('probe' in event.data) {
    // Must be blocked by connect-src 'none'; proves the policy is in force.
    const blocked = await fetch('/probe').then(
      () => false,
      () => true,
    )
    parent.postMessage({ blocked, violations: [...violations] }, '*')
    return
  }
  const result = await readSpondClubExport(event.data.file).catch((error: unknown) => ({ thrown: String(error) }))
  // Violation events are dispatched asynchronously; give any from the read time to arrive.
  await new Promise((resolve) => setTimeout(resolve, 100))
  parent.postMessage({ result, violations: [...violations] }, '*')
})

parent.postMessage('ready', '*')
