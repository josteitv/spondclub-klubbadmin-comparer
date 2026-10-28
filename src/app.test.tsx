import { fireEvent, render, screen, within } from '@testing-library/preact'
import { describe, expect, it, vi } from 'vitest'
import { App } from './app.tsx'
import { klubbAdminFile, spondClubFile, xlsxFile } from './exports/test-files.ts'

vi.stubGlobal('__APP_VERSION__', '1.2.3+abc1234')

type Rows = Parameters<typeof spondClubFile>[0]

const asFile = async (blob: Promise<Blob>, name: string) => new File([await blob], name)
const spondClub = (rows: Rows, name = 'spond.xlsx') => asFile(spondClubFile(rows), name)
const klubbAdmin = (rows: Rows, name = 'klubbadmin.xlsx') => asFile(klubbAdminFile(rows), name)

const pick = (...files: File[]) => fireEvent.change(screen.getByLabelText('Velg filer'), { target: { files } })

const drop = (...files: File[]) =>
  fireEvent.drop(screen.getByRole('region', { name: 'Eksportfiler' }), { dataTransfer: { files } })

const section = async (name: string) => within(await screen.findByRole('region', { name }))

/** The cells of each body row in a section's table, as text. */
const rows = async (name: string) =>
  (await section(name))
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell').map((cell) => cell.textContent))

/** Both exports for a club with one person in each section, plus a left-out and a skipped row. */
async function dropClub() {
  drop(
    await spondClub([
      { ...ola, Fødselsdato: new Date('2012-03-04'), Grupper: 'Gutter 2012, Vinter' },
      { Medlemstype: 'Medlem', 'Medlem fornavn': 'Kari', 'Medlem etternavn': 'Hansen' },
      { Medlemstype: 'Medlem', 'Medlem fornavn': 'Per', 'Medlem etternavn': 'Olsen', Grupper: 'Old boys' },
      { Medlemstype: 'Ikke medlem', 'Medlem fornavn': 'Siri', 'Medlem etternavn': 'Lund' },
      { Medlemstype: 'Medlem' },
    ]),
    await klubbAdmin([
      { Fornavn: 'Ola', Etternavn: 'Nordmann', Fødselsdato: '04.03.2012', 'Grupper/grener': 'Fotball|Ski' },
      { Fornavn: 'Per Johan', Etternavn: 'Olsen', Fødselsdato: '05.06.1970' },
      { Fornavn: 'Liv', Etternavn: 'Berg', Fødselsdato: '01.02.1980', 'Grupper/grener': 'Styret' },
    ]),
  )
}

const ola = { Medlemstype: 'Medlem', 'Medlem fornavn': 'Ola', 'Medlem etternavn': 'Nordmann' }

describe('App', () => {
  it('shows the title and the version', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Medlemssjekk' })).toBeTruthy()
    expect(screen.getByText('Versjon 1.2.3+abc1234')).toBeTruthy()
  })

  it('recognises a Spond Club export and says the KlubbAdmin export is missing', async () => {
    render(<App />)

    pick(await spondClub([ola], 'medlemmer.xlsx'))

    expect(await screen.findByText('Spond Club: medlemmer.xlsx')).toBeTruthy()
    expect(screen.getByText('KlubbAdmin: mangler')).toBeTruthy()
  })

  it.each([
    ['Spond Club first', 'spond-club'],
    ['KlubbAdmin first', 'klubbadmin'],
  ])('shows the report when both exports are dropped, %s', async (_, first) => {
    render(<App />)
    const files = [await spondClub([ola]), await klubbAdmin([{ Fornavn: 'Kari', Etternavn: 'Hansen' }])]

    drop(...(first === 'spond-club' ? files : files.reverse()))

    expect((await section('Ikke registrert i KlubbAdmin')).getByText('Ola Nordmann')).toBeTruthy()
  })

  it('says which export is missing when both files are the same kind', async () => {
    render(<App />)

    drop(await spondClub([ola], 'a.xlsx'), await spondClub([ola], 'b.xlsx'))

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Begge filene er eksporter fra Spond Club. Eksporten fra KlubbAdmin mangler.',
    )
  })

  it('rejects an unrecognised file, naming the columns each export would need', async () => {
    render(<App />)

    drop(await asFile(xlsxFile(['Fornavn', 'Medlem etternavn', 'Grupper'], []), 'liste.xlsx'))

    expect((await screen.findByRole('alert')).textContent).toBe(
      '«liste.xlsx» er ikke en eksport fra Spond Club eller KlubbAdmin. ' +
        'Som eksport fra Spond Club mangler den kolonnene Medlemstype, Medlem fornavn, Fødselsdato. ' +
        'Som eksport fra KlubbAdmin mangler den kolonnene Etternavn, Fødselsdato, Grupper/grener.',
    )
    expect(screen.getByText('Spond Club: mangler')).toBeTruthy()
  })

  it('rejects a file that is not an Excel file', async () => {
    render(<App />)

    drop(new File(['Ola;Nordmann'], 'liste.csv'))

    expect((await screen.findByRole('alert')).textContent).toBe('«liste.csv» er ikke en Excel-fil (.xlsx).')
  })

  it('lists each person in the right section, with birth date and groups', async () => {
    render(<App />)

    await dropClub()

    expect(await rows('Ikke registrert i KlubbAdmin')).toEqual([
      ['Kari Hansen', 'mangler', 'ingen gruppe', 'mangler', 'mangler', 'ingen foresatte'],
    ])
    expect(await rows('Mulige treff')).toEqual([
      ['Per Olsen født mangler · Old boys', 'Per Johan Olsen født 05.06.1970 · ingen gruppe', 'Navneledd mangler'],
    ])
    expect(await rows('Funnet i begge')).toEqual([['Ola Nordmann', '04.03.2012', '04.03.2012', 'Gutter 2012, Vinter']])
    expect(await rows('Medlemmer i KlubbAdmin som ikke er i Spond Club')).toEqual([
      ['Liv Berg', '01.02.1980', 'Styret'],
    ])
  })

  it("shows an Unregistered member's email and mobile, and each Guardian's", async () => {
    render(<App />)

    drop(
      await spondClub([
        {
          ...ola,
          'Medlems-e-post': 'ola@example.com',
          'Medlem mobil': '+4740000000',
          'Foresatt 1 fornavn': 'Kari',
          'Foresatt 1 etternavn': 'Nordmann',
          'Foresatt 1 e-post': 'kari@example.com',
          'Foresatt 1 telefonnummer': '+4741111111',
          'Foresatt 2 fornavn': 'Per',
          'Foresatt 2 etternavn': 'Nordmann',
        },
      ]),
      await klubbAdmin([]),
    )

    const unregistered = await section('Ikke registrert i KlubbAdmin')
    const [row] = unregistered.getAllByRole('row').slice(1)
    const cells = within(row).getAllByRole('cell')
    expect(cells.slice(3, 5).map((cell) => cell.textContent)).toEqual(['ola@example.com', '+4740000000'])
    expect(within(cells[5]).getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'Kari Nordmann · kari@example.com · +4741111111',
      'Per Nordmann · e-post mangler · telefon mangler',
    ])
  })

  it('shows the reason once when every pair in a Possible match has the same one', async () => {
    render(<App />)
    const emma = { Medlemstype: 'Medlem', 'Medlem fornavn': 'Emma', 'Medlem etternavn': 'Larsen' }

    drop(await spondClub([emma, emma]), await klubbAdmin([{ Fornavn: 'Emma', Etternavn: 'Larsen' }]))

    expect((await rows('Mulige treff')).map((row) => row[2])).toEqual(['Samme navn flere ganger'])
  })

  it('sums up the report with a count per section, each linking to it', async () => {
    render(<App />)

    await dropClub()

    const summary = within(await screen.findByRole('navigation', { name: 'Sammendrag' }))
    const links = summary.getAllByRole('link').map((link) => [link.textContent, link.getAttribute('href')])
    expect(links).toEqual([
      ['1 Ikke registrert i KlubbAdmin', '#ikke-registrert'],
      ['1 Mulige treff', '#mulige-treff'],
      ['1 Funnet i begge', '#funnet-i-begge'],
      ['1 Medlemmer i KlubbAdmin som ikke er i Spond Club', '#kun-klubbadmin'],
    ])
    expect(summary.getByText('Lest inn 3 medlemmer fra Spond Club og 3 medlemmer fra KlubbAdmin.')).toBeTruthy()
  })

  it('ends the report with the rows left out and the reminder to delete the exports', async () => {
    render(<App />)

    await dropClub()

    expect(await screen.findByText('1 rad i Spond Club med medlemstypen «Ikke medlem» er ikke tatt med.')).toBeTruthy()
    expect(screen.getByText('1 rad uten navn er hoppet over.')).toBeTruthy()
    expect(
      screen.getByText('Husk å slette eksportfilene fra datamaskinen når du er ferdig. De inneholder personopplysninger.'),
    ).toBeTruthy()
  })

  it('sorts each section by full name in Norwegian order, with æ, ø and å after z', async () => {
    render(<App />)
    const names = ['Åse Berg', 'Øyvind Dahl', 'Anna Vik', 'Ægir Moe', 'Zara Lie']
    const [firstNames, lastNames] = [names.map((n) => n.split(' ')[0]), names.map((n) => n.split(' ')[1])]

    drop(
      await spondClub(
        names.map((_, i) => ({ Medlemstype: 'Medlem', 'Medlem fornavn': firstNames[i], 'Medlem etternavn': lastNames[i] })),
      ),
      await klubbAdmin(names.map((_, i) => ({ Fornavn: `${firstNames[i]}e`, Etternavn: `${lastNames[i]}sen` }))),
    )

    const sorted = ['Anna Vik', 'Zara Lie', 'Ægir Moe', 'Øyvind Dahl', 'Åse Berg']
    expect((await rows('Ikke registrert i KlubbAdmin')).map(([name]) => name)).toEqual(sorted)
    expect((await rows('Medlemmer i KlubbAdmin som ikke er i Spond Club')).map(([name]) => name)).toEqual(
      ['Annae Viksen', 'Zarae Liesen', 'Ægire Moesen', 'Øyvinde Dahlsen', 'Åsee Bergsen'],
    )
  })

  it('clears the files, the messages and the report on Start på nytt', async () => {
    render(<App />)
    await dropClub()
    await screen.findByRole('region', { name: 'Funnet i begge' })
    drop(new File(['x'], 'feil.csv'))
    await screen.findByRole('alert')

    fireEvent.click(screen.getByRole('button', { name: 'Start på nytt' }))

    expect(screen.queryByRole('region', { name: 'Funnet i begge' })).toBeNull()
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.getByText('Spond Club: mangler')).toBeTruthy()
    expect(screen.getByText('KlubbAdmin: mangler')).toBeTruthy()
  })

  it('writes nothing to any browser storage', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    const open = vi.fn()
    vi.stubGlobal('indexedDB', { open })
    vi.stubGlobal('caches', { open })
    render(<App />)

    await dropClub()
    await screen.findByRole('region', { name: 'Funnet i begge' })
    fireEvent.click(screen.getByRole('button', { name: 'Start på nytt' }))

    expect(setItem).not.toHaveBeenCalled()
    expect([localStorage.length, sessionStorage.length]).toEqual([0, 0])
    expect(open).not.toHaveBeenCalled()
    expect(document.cookie).toBe('')
  })
})
