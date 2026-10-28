// Test-only: lets browser tests run a module under the page's CSP and talk to it.
import { expect } from 'vitest'

/** An iframe with the page's CSP (build/csp.ts), running the given module. */
export async function cspFrame(module: URL): Promise<(message: unknown) => Promise<any>> {
  const frame = document.createElement('iframe')
  frame.src = `/__csp-frame?module=${encodeURIComponent(module.pathname)}`
  // Vitest posts messages of its own, so wait for the next one from this frame.
  const nextMessage = () =>
    new Promise<any>((resolve) => {
      const listener = (event: MessageEvent) => {
        if (event.source !== frame.contentWindow) return
        window.removeEventListener('message', listener)
        resolve(event.data)
      }
      window.addEventListener('message', listener)
    })
  const ready = nextMessage()
  document.body.append(frame)
  expect(await ready).toBe('ready')
  return (message) => {
    const reply = nextMessage()
    frame.contentWindow!.postMessage(message, '*')
    return reply
  }
}
