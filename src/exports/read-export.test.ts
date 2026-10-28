import { describe, expect, it } from 'vitest'
import { identifyExport, readKlubbAdminExport, readSpondClubExport } from './read-export.ts'
import { KLUBBADMIN_COLUMNS, klubbAdminFile, SPOND_CLUB_COLUMNS, spondClubFile, xlsxFile } from './test-files.ts'

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

  it("reads the member's email and mobile", async () => {
    const file = await spondClubFile([
      {
        Medlemstype: 'Medlem',
        'Medlem fornavn': 'Ola',
        'Medlem etternavn': 'Nordmann',
        'Medlems-e-post': 'ola@example.com',
        'Medlem mobil': '+4740000000',
      },
    ])

    expect(await readSpondClubExport(file)).toMatchObject({
      ok: true,
      value: { members: [{ firstName: 'Ola', email: 'ola@example.com', phone: '+4740000000' }] },
    })
  })

  it('reads up to four Guardians, leaving out an empty one', async () => {
    const file = await spondClubFile([
      {
        Medlemstype: 'Medlem',
        'Medlem fornavn': 'Ola',
        'Medlem etternavn': 'Nordmann',
        'Foresatt 1 fornavn': 'Kari',
        'Foresatt 1 etternavn': 'Nordmann',
        'Foresatt 1 e-post': 'kari@example.com',
        'Foresatt 1 telefonnummer': '+4741111111',
        'Foresatt 3 fornavn': 'Per',
        'Foresatt 3 etternavn': 'Hansen',
        'Foresatt 4 e-post': 'familie@example.com',
      },
    ])

    expect(await readSpondClubExport(file)).toMatchObject({
      ok: true,
      value: {
        members: [
          {
            firstName: 'Ola',
            guardians: [
              { firstName: 'Kari', lastName: 'Nordmann', email: 'kari@example.com', phone: '+4741111111' },
              { firstName: 'Per', lastName: 'Hansen' },
              { firstName: '', lastName: '', email: 'familie@example.com' },
            ],
          },
        ],
      },
    })
  })

  it('reads a file without the contact and Guardian columns, leaving the details out', async () => {
    const columns = ['Medlemstype', 'Grupper', 'Medlem fornavn', 'Medlem etternavn', 'Fødselsdato']
    const file = await spondClubFile([{ Medlemstype: 'Medlem', 'Medlem fornavn': 'Ola', 'Medlem etternavn': 'Nordmann' }], columns)

    expect(await readSpondClubExport(file)).toEqual({
      ok: true,
      value: {
        members: [{ firstName: 'Ola', lastName: 'Nordmann' }],
        notMemberCount: 0,
        skippedWithoutName: 0,
      },
    })
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

  it('recognises a KlubbAdmin export from its header row', async () => {
    const file = await klubbAdminFile([{ Fornavn: 'Ola', Etternavn: 'Nordmann' }])
    expect(await identifyExport(file)).toEqual({ ok: true, value: 'klubbadmin' })
  })

  it('rejects an .xlsx with other columns, naming what is missing for each export', async () => {
    const file = await xlsxFile(['Navn', 'Fødselsdato', 'Grupper'], [{ Navn: 'Ola Nordmann' }])
    expect(await identifyExport(file)).toEqual({
      ok: false,
      error: {
        code: 'unrecognised',
        missing: {
          spondClub: ['Medlemstype', 'Medlem fornavn', 'Medlem etternavn'],
          klubbAdmin: ['Fornavn', 'Etternavn', 'Grupper/grener'],
        },
      },
    })
  })

  it('rejects a file that is not an .xlsx', async () => {
    expect(await identifyExport(new Blob(['not a spreadsheet']))).toEqual({ ok: false, error: { code: 'not-xlsx' } })
  })
})

describe('readKlubbAdminExport', () => {
  it('reads the KlubbAdmin members, with text birth dates and |-joined groups', async () => {
    const file = await klubbAdminFile([
      {
        PersonId: '1234567',
        Fornavn: 'Ola',
        Etternavn: 'Nordmann',
        Fødselsdato: '04.03.2012',
        'Grupper/grener': 'Fotball|Allidrett',
      },
    ])

    expect(await readKlubbAdminExport(file)).toEqual({
      ok: true,
      value: {
        members: [
          {
            firstName: 'Ola',
            lastName: 'Nordmann',
            birthDate: new Date('2012-03-04T00:00:00Z'),
            groups: 'Fotball, Allidrett',
          },
        ],
        skippedWithoutName: 0,
      },
    })
  })
  it.each([
    ['an impossible date', '31.02.2012'],
    ['a month out of range', '04.13.2012'],
    ['text that is not a date', 'ukjent'],
    ['another date format', '2012-03-04'],
    ['a blank cell', '  '],
  ])('treats %s as a missing birth date', async (_, Fødselsdato) => {
    const file = await klubbAdminFile([{ Fornavn: 'Ola', Etternavn: 'Nordmann', Fødselsdato }])

    const result = await readKlubbAdminExport(file)

    expect(result).toMatchObject({ ok: true, value: { members: [{ firstName: 'Ola' }] } })
    expect(result.ok && result.value.members[0]).not.toHaveProperty('birthDate')
  })
  it('reads a number stored in a text-formatted cell as text', async () => {
    const file = await klubbAdminFile([{ PersonId: 1234567, Fornavn: 'Ola', Etternavn: 2012 }])

    expect(await readKlubbAdminExport(file)).toMatchObject({
      ok: true,
      value: { members: [{ firstName: 'Ola', lastName: '2012' }] },
    })
  })

  it('skips and counts rows without a name, and ignores a trailing empty row', async () => {
    const empty = Object.fromEntries(KLUBBADMIN_COLUMNS.map((column) => [column, '']))
    const file = await klubbAdminFile([
      { PersonId: 1234567, Fødselsdato: '04.03.2012', 'Tlf. mobil': '40000000' },
      { Fornavn: 'Ola', Etternavn: 'Nordmann', 'Tlf. mobil': '40000001', 'E-post': 'a@example.com;b@example.com' },
      empty,
    ])

    expect(await readKlubbAdminExport(file)).toEqual({
      ok: true,
      value: { members: [{ firstName: 'Ola', lastName: 'Nordmann' }], skippedWithoutName: 1 },
    })
  })
  it.each(['Fornavn', 'Etternavn', 'Fødselsdato', 'Grupper/grener'])(
    'rejects a file without the %s column, naming it',
    async (missing) => {
      const file = await klubbAdminFile(
        [{ Fornavn: 'Ola', Etternavn: 'Nordmann' }],
        KLUBBADMIN_COLUMNS.filter((column) => column !== missing),
      )

      expect(await readKlubbAdminExport(file)).toEqual({
        ok: false,
        error: { code: 'missing-columns', columns: [missing] },
      })
    },
  )
})
