import { h, render } from 'preact'
import { describe, expect, it } from 'vitest'
import { App } from './app.tsx'
import { klubbAdminFile, spondClubFile } from './exports/test-files.ts'

// A club-sized pair of exports with many people on each side who have no exact match, so the
// matching itself takes about a second, as with real exports.
const FIRST = ['Ola', 'Kari', 'Per', 'Lise', 'Jonas', 'Emma', 'Noah', 'Nora', 'Jakob', 'Sofie', 'Filip', 'Ella']
const LAST = ['Hansen', 'Johansen', 'Olsen', 'Larsen', 'Andersen', 'Pedersen', 'Nilsen', 'Berg', 'Haugen', 'Dahl', 'Lund']
const person = (i: number, suffix = '') => ({ first: FIRST[i % FIRST.length], last: `${LAST[(i * 7) % LAST.length]}${suffix}${i}` })

async function clubExports(): Promise<File[]> {
  const spondClub = Array.from({ length: 700 }, (_, i) => person(i))
  const klubbAdmin = [...spondClub.slice(0, 300), ...Array.from({ length: 350 }, (_, i) => person(i * 3, 'x'))]
  return [
    new File(
      [
        await spondClubFile(
          spondClub.map((p, i) => ({
            Medlemstype: 'Medlem',
            'Medlem fornavn': p.first,
            'Medlem etternavn': p.last,
            'Medlems-e-post': `person${i}@example.com`,
          })),
        ),
      ],
      'spond.xlsx',
    ),
    new File([await klubbAdminFile(klubbAdmin.map((p) => ({ Fornavn: p.first, Etternavn: p.last })))], 'klubbadmin.xlsx'),
  ]
}

describe('App with a club-sized export in a real browser', () => {
  it('copies a contact detail without freezing the page', async () => {
    Object.assign(globalThis, { __APP_VERSION__: 'test' })
    const root = document.createElement('div')
    document.body.append(root)
    render(h(App, null), root)
    const files = new DataTransfer()
    for (const file of await clubExports()) files.items.add(file)
    const input = root.querySelector<HTMLInputElement>('input[type=file]')!
    input.files = files.files
    input.dispatchEvent(new Event('change', { bubbles: true }))
    await expect.poll(() => root.querySelector('#ikke-registrert button.copy'), { timeout: 30_000 }).toBeTruthy()

    // From the click until the copy message shows (copied or refused: either way the click is handled).
    const start = performance.now()
    root.querySelector<HTMLButtonElement>('#ikke-registrert button.copy')!.click()
    await expect.poll(() => root.querySelector('[role=status]')?.textContent, { interval: 5 }).toBeTruthy()

    expect(performance.now() - start).toBeLessThan(300)
    render(null, root)
  }, 60_000)
})
