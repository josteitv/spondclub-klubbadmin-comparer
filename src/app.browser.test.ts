import { describe, expect, it } from 'vitest'
import { cspFrame } from './csp-frame-client.ts'
import { klubbAdminFile, spondClubFile } from './exports/test-files.ts'

describe('App in a real browser', () => {
  it('shows the report for two dropped exports under the page CSP without any violation', async () => {
    const send = await cspFrame(new URL('./app-csp-frame.ts', import.meta.url))
    expect((await send({ probe: true })).blocked).toBe(true)
    const files = [
      new File([await spondClubFile([{ Medlemstype: 'Medlem', 'Medlem fornavn': 'Ola', 'Medlem etternavn': 'Nordmann' }])], 'spond.xlsx'),
      new File([await klubbAdminFile([{ Fornavn: 'Ola', Etternavn: 'Nordmann' }])], 'klubbadmin.xlsx'),
    ]

    const { headings, violations } = await send({ files })

    expect(headings).toEqual([
      'Eksportfiler',
      'Ikke registrert i KlubbAdmin',
      'Mulige treff',
      'Funnet i begge',
      'Medlemmer i KlubbAdmin som ikke er i Spond Club',
    ])
    // The probe's violation shows that violations are reported; the report caused none.
    expect(violations).toEqual([expect.stringMatching(/^connect-src .*\/probe$/)])
  })
})
