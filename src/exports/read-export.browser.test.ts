import { describe, expect, it } from 'vitest'
import { spondClubFile } from './test-files.ts'

/** An iframe with the page's CSP (build/csp.ts), running csp-frame.ts. */
async function cspFrame(): Promise<(message: unknown) => Promise<any>> {
  const frame = document.createElement('iframe')
  const script = new URL('./csp-frame.ts', import.meta.url).pathname
  frame.src = `/__csp-frame?module=${encodeURIComponent(script)}`
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

describe('readSpondClubExport in a real browser', () => {
  it('reads an export under the page CSP without any violation', async () => {
    const send = await cspFrame()

    const probe = await send({ probe: true })
    expect(probe.blocked).toBe(true)

    const file = await spondClubFile([
      { Medlemstype: 'Medlem', 'Medlem fornavn': 'Ola', 'Medlem etternavn': 'Nordmann', Fødselsdato: new Date('2012-03-04') },
    ])
    const { result, violations } = await send({ file })

    expect(result).toEqual({
      ok: true,
      value: {
        members: [{ firstName: 'Ola', lastName: 'Nordmann', birthDate: new Date('2012-03-04T00:00:00Z') }],
        notMemberCount: 0,
        skippedWithoutName: 0,
      },
    })
    // The probe's violation shows that violations are reported; reading the file caused none.
    expect(violations).toEqual([expect.stringMatching(/^connect-src .*\/probe$/)])
  })

  // read-excel-file's /browser entry unzips large files in a blob: worker (ticket 08); the page's
  // worker-src 'none' would block that, so check a file well past fflate's 512 kB threshold.
  it('reads a large export under the page CSP without any violation', async () => {
    const send = await cspFrame()
    const rows = Array.from({ length: 4000 }, (_, i) => ({
      Medlemstype: 'Medlem',
      'Medlem fornavn': `Fornavn${i}`,
      'Medlem etternavn': `Etternavn${i}`,
      Grupper: `Gruppe ${i % 40}, Gruppe ${i % 7}`,
      'Medlems-e-post': `person${i}@example.com`,
      'Foresatt 1 fornavn': `Foresatt${i}`,
      Fødselsdato: new Date(Date.UTC(2005, 0, 1 + (i % 3000))),
    }))

    const { result, violations } = await send({ file: await spondClubFile(rows) })

    expect(result.ok && result.value.members).toHaveLength(4000)
    expect(violations).toEqual([])
  })
})
