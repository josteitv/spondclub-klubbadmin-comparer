import { describe, expect, it } from 'vitest'
import { identifyExport, readSpondClubExport } from './read-export.ts'
import { SPOND_CLUB_COLUMNS, spondClubFile, xlsxFile } from './test-files.ts'

describe('readSpondClubExport', () => {
  it('reads the Spond Club members', async () => {
    const file = await spondClubFile([
      { Medlemstype: 'Medlem', 'Medlem fornavn': 'Ola', 'Medlem etternavn': 'Nordmann', Grupper: 'Gutter 2012' },
    ])

    expect(await readSpondClubExport(file)).toEqual({
      ok: true,
      value: {
        members: [{ firstName: 'Ola', lastName: 'Nordmann', groups: 'Gutter 2012' }],
        notMemberCount: 0,
        skippedWithoutName: 0,
      },
    })
  })

  it('leaves out and counts the Ikke medlem rows', async () => {
    const file = await spondClubFile([
      { Medlemstype: 'Ikke medlem', 'Medlem fornavn': 'Kari', 'Medlem etternavn': 'Hansen' },
      { Medlemstype: 'Medlem', 'Medlem fornavn': 'Ola', 'Medlem etternavn': 'Nordmann' },
      { Medlemstype: 'Ikke medlem', 'Medlem fornavn': 'Per', 'Medlem etternavn': 'Olsen' },
    ])

    const result = await readSpondClubExport(file)

    expect(result).toMatchObject({
      ok: true,
      value: { members: [{ firstName: 'Ola', lastName: 'Nordmann' }], notMemberCount: 2 },
    })
  })

  it('skips and counts member rows without a name, but keeps a row with only one name field', async () => {
    const file = await spondClubFile([
      { Medlemstype: 'Medlem', Grupper: 'Jenter 2013' },
      { Medlemstype: 'Medlem', 'Medlem fornavn': '', 'Medlem etternavn': 'Nordmann' },
    ])

    expect(await readSpondClubExport(file)).toMatchObject({
      ok: true,
      value: { members: [{ firstName: '', lastName: 'Nordmann' }], skippedWithoutName: 1 },
    })
  })

  it('reads the birth date serial as a date, and leaves a missing one out', async () => {
    const file = await spondClubFile([
      { Medlemstype: 'Medlem', 'Medlem fornavn': 'Ola', 'Medlem etternavn': 'Nordmann', Fødselsdato: new Date('2012-03-04') },
      { Medlemstype: 'Medlem', 'Medlem fornavn': 'Kari', 'Medlem etternavn': 'Hansen' },
    ])

    const result = await readSpondClubExport(file)

    expect(result).toMatchObject({
      ok: true,
      value: { members: [{ firstName: 'Ola', birthDate: new Date('2012-03-04T00:00:00Z') }, { firstName: 'Kari' }] },
    })
    expect(result.ok && result.value.members[1]).not.toHaveProperty('birthDate')
  })

  it.each(['Medlemstype', 'Medlem fornavn', 'Medlem etternavn', 'Fødselsdato', 'Grupper'])(
    'rejects a file without the %s column, naming it',
    async (missing) => {
      const file = await spondClubFile(
        [{ Medlemstype: 'Medlem', 'Medlem fornavn': 'Ola', 'Medlem etternavn': 'Nordmann' }],
        SPOND_CLUB_COLUMNS.filter((column) => column !== missing),
      )

      expect(await readSpondClubExport(file)).toEqual({
        ok: false,
        error: { code: 'missing-columns', columns: [missing] },
      })
    },
  )

  it('finds the columns by title, ignoring other columns and their order', async () => {
    const columns = ['Kjønn', 'Medlem etternavn', 'Draktnummer', 'Grupper', 'Medlem fornavn', 'Fødselsdato', 'Medlemstype']
    const file = await spondClubFile(
      [{ Medlemstype: 'Medlem', 'Medlem fornavn': 'Ola', 'Medlem etternavn': 'Nordmann', Kjønn: 'Mann', Draktnummer: '7' }],
      columns,
    )

    expect(await readSpondClubExport(file)).toEqual({
      ok: true,
      value: { members: [{ firstName: 'Ola', lastName: 'Nordmann' }], notMemberCount: 0, skippedWithoutName: 0 },
    })
  })

  it('rejects a file that is not an .xlsx', async () => {
    const file = new Blob(['Fornavn;Etternavn\nOla;Nordmann\n'], { type: 'text/csv' })
    expect(await readSpondClubExport(file)).toEqual({ ok: false, error: { code: 'not-xlsx' } })
  })

  it('rejects an empty sheet', async () => {
    expect(await readSpondClubExport(await xlsxFile([], []))).toEqual({ ok: false, error: { code: 'empty-sheet' } })
  })

  it('keeps a Grupper cell whole, even when a group name contains ", "', async () => {
    const groups = 'Fotball, gutter 2012, Allidrett'
    const file = await spondClubFile([
      { Medlemstype: 'Medlem', 'Medlem fornavn': 'Ola', 'Medlem etternavn': 'Nordmann', Grupper: groups },
    ])

    expect(await readSpondClubExport(file)).toMatchObject({ ok: true, value: { members: [{ groups }] } })
  })
})

describe('identifyExport', () => {
  it('recognises a Spond Club export from its header row', async () => {
    const file = await spondClubFile([{ Medlemstype: 'Medlem', 'Medlem fornavn': 'Ola', 'Medlem etternavn': 'Nordmann' }])
    expect(await identifyExport(file)).toEqual({ ok: true, value: 'spond-club' })
  })

  it('rejects an .xlsx with other columns, naming what is missing', async () => {
    const file = await xlsxFile(['Navn', 'Fødselsdato'], [{ Navn: 'Ola Nordmann' }])
    expect(await identifyExport(file)).toEqual({
      ok: false,
      error: { code: 'missing-columns', columns: ['Medlemstype', 'Medlem fornavn', 'Medlem etternavn', 'Grupper'] },
    })
  })

  it('rejects a file that is not an .xlsx', async () => {
    expect(await identifyExport(new Blob(['not a spreadsheet']))).toEqual({ ok: false, error: { code: 'not-xlsx' } })
  })
})
