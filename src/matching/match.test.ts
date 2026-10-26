import { describe, expect, it } from 'vitest'
import { matchMembers, type Person } from './match.ts'

const person = (firstName: string, lastName: string): Person => ({ firstName, lastName })

describe('matchMembers', () => {
  it('finds a person with the same name in both systems', () => {
    const spond = person('Ola', 'Nordmann')
    const klubbAdmin = person('Ola', 'Nordmann')

    expect(matchMembers([spond], [klubbAdmin])).toEqual({
      foundInBoth: [{ spondClubMember: spond, klubbAdminMember: klubbAdmin }],
      possibleMatches: [],
      unregisteredMembers: [],
      klubbAdminOnlyMembers: [],
    })
  })

  it.each([
    ['case', person('ola', 'NORDMANN'), person('Ola', 'Nordmann')],
    ['extra spaces', person('  Ola ', 'Nordmann  '), person('Ola', 'Nordmann')],
    ['hyphen vs space', person('Anne-Lise', 'Berg'), person('Anne Lise', 'Berg')],
    ['word order', person('Nordmann', 'Ola'), person('Ola', 'Nordmann')],
    ['split between first and last name', person('Ola Johan', 'Nordmann'), person('Ola', 'Johan Nordmann')],
    ['accents',person('René', 'Müller'), person('Rene', 'Muller')],
    ['empty first name', person('', 'Ola Nordmann'), person('Ola', 'Nordmann')],
    ['empty last name', person('Ola Nordmann', ''), person('Ola', 'Nordmann')],
  ])('ignores %s', (_, spond, klubbAdmin) => {
    expect(matchMembers([spond], [klubbAdmin]).foundInBoth).toEqual([
      { spondClubMember: spond, klubbAdminMember: klubbAdmin },
    ])
  })

  it.each([
    ['ø', person('Ole', 'Bø'), person('Ole', 'Bo')],
    ['å', person('Ole', 'Ås'), person('Ole', 'As')],
    ['æ', person('Ole', 'Bæk'), person('Ole', 'Bak')],
  ])('keeps %s as a distinct letter', (_, spond, klubbAdmin) => {
    expect(matchMembers([spond], [klubbAdmin]).foundInBoth).toEqual([])
  })

  it('shows a missing middle name as a Possible match', () => {
    const spond = person('Ola Johan', 'Nordmann')
    const klubbAdmin = person('Ola', 'Nordmann')

    expect(matchMembers([spond], [klubbAdmin])).toEqual({
      foundInBoth: [],
      possibleMatches: [
        {
          spondClubMembers: [spond],
          klubbAdminMembers: [klubbAdmin],
          pairs: [{ spondClubMember: spond, klubbAdminMember: klubbAdmin, reason: 'missing-words' }],
        },
      ],
      unregisteredMembers: [],
      klubbAdminOnlyMembers: [],
    })
  })

  it('does not match a one-word name by missing words', () => {
    const result = matchMembers([person('', 'Nordmann')], [person('Ola', 'Nordmann')])
    expect(result.possibleMatches).toEqual([])
  })

  it.each([
    ['1 typo in a name under 10 letters', person('Ola', 'Berg'), person('Ola', 'Bergh'), true],
    ['2 typos in a name under 10 letters', person('Ola', 'Berg'), person('Ole', 'Bergh'), false],
    ['2 typos in a name of 10 letters', person('Kari', 'Hansen'), person('Kary', 'Hansan'), true],
    ['2 typos in a name of 9 letters', person('Kari', 'Hanse'), person('Kary', 'Hansa'), false],
    ['3 typos in a long name', person('Kari', 'Nordmann'), person('Kary', 'Nordmen'), false],
    ['2 typos where only the other name has 10 letters', person('Kari', 'Hanse'), person('Kari', 'Hanssen'), false],
    ['ø written as o', person('Ole', 'Bø'), person('Ole', 'Bo'), true],
    ['å written as aa', person('Håkon', 'Nordmann'), person('Haakon', 'Nordmann'), true],
    ['a missing middle name plus a typo', person('Ola Johan', 'Nordmann'), person('Ola', 'Nordman'), false],
  ])('typo rule: %s', (_, spond, klubbAdmin, isPossibleMatch) => {
    const pairs = matchMembers([spond], [klubbAdmin]).possibleMatches.flatMap((set) => set.pairs)
    expect(pairs).toEqual(isPossibleMatch ? [{ spondClubMember: spond, klubbAdminMember: klubbAdmin, reason: 'typo' }] : [])
  })

  describe('duplicate names', () => {
    const born = (p: Person, isoDate: string): Person => ({ ...p, birthDate: new Date(isoDate) })
    const olaA = born(person('Ola', 'Nordmann'), '2010-01-01')
    const olaB = born(person('Ola', 'Nordmann'), '2012-06-30')

    it('shows a name used twice in Spond Club as Possible matches, not Found in both', () => {
      const klubbAdmin = person('Ola', 'Nordmann')

      expect(matchMembers([olaA, olaB], [klubbAdmin])).toEqual({
        foundInBoth: [],
        possibleMatches: [
          {
            spondClubMembers: [olaA, olaB],
            klubbAdminMembers: [klubbAdmin],
            pairs: [
              { spondClubMember: olaA, klubbAdminMember: klubbAdmin, reason: 'same-name' },
              { spondClubMember: olaB, klubbAdminMember: klubbAdmin, reason: 'same-name' },
            ],
          },
        ],
        unregisteredMembers: [],
        klubbAdminOnlyMembers: [],
      })
    })

    it('pairs every same-name person when the name is used twice on both sides', () => {
      const result = matchMembers([olaA, olaB], [olaB, olaA])

      expect(result.foundInBoth).toEqual([])
      expect(result.possibleMatches).toHaveLength(1)
      expect(result.possibleMatches[0].pairs).toHaveLength(4)
      expect(result.possibleMatches[0].pairs.every((p) => p.reason === 'same-name')).toBe(true)
    })

    it('does not pair two Spond Club members with each other', () => {
      expect(matchMembers([olaA, olaB], [])).toEqual({
        foundInBoth: [],
        possibleMatches: [],
        unregisteredMembers: [olaA, olaB],
        klubbAdminOnlyMembers: [],
      })
    })
  })

  it('groups one Spond Club member with two KlubbAdmin candidates into one set', () => {
    const spond = person('Ola Johan', 'Nordmann')
    const ola = person('Ola', 'Nordmann')
    const johan = person('Johan', 'Nordmann')

    expect(matchMembers([spond], [ola, johan]).possibleMatches).toEqual([
      {
        spondClubMembers: [spond],
        klubbAdminMembers: [ola, johan],
        pairs: [
          { spondClubMember: spond, klubbAdminMember: ola, reason: 'missing-words' },
          { spondClubMember: spond, klubbAdminMember: johan, reason: 'missing-words' },
        ],
      },
    ])
  })

  it('does not offer a KlubbAdmin member who is already Found in both as a candidate', () => {
    const ola = person('Ola', 'Nordmann')
    const olaJohan = person('Ola Johan', 'Nordmann')

    expect(matchMembers([ola, olaJohan], [person('Ola', 'Nordmann')])).toMatchObject({
      possibleMatches: [],
      unregisteredMembers: [olaJohan],
    })
  })

  it('puts every person in exactly one result group, for random inputs', () => {
    // Small invented name pools so that exact, duplicate, missing-word and typo cases collide often.
    const firstNames = ['Ola', 'Ole', 'Kari', 'Kary', 'Ola Johan', 'Anne-Lise', 'Anne Lise', 'Håkon', 'Haakon', '']
    const lastNames = ['Nordmann', 'Nordman', 'Hansen', 'Bø', 'Bo', 'Berg', 'Bergh', 'Ås', '']
    let seed = 42
    const random = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31), seed / 2 ** 31)
    const pick = <T,>(items: T[]) => items[Math.floor(random() * items.length)]
    const people = (count: number) =>
      Array.from({ length: count }, () => person(pick(firstNames), pick(lastNames))).filter(
        (p) => p.firstName || p.lastName,
      )

    for (let run = 0; run < 200; run++) {
      const spondClub = people(Math.floor(random() * 12))
      const klubbAdmin = people(Math.floor(random() * 12))
      const result = matchMembers(spondClub, klubbAdmin)

      const spondClubPlaced = [
        ...result.foundInBoth.map((m) => m.spondClubMember),
        ...result.possibleMatches.flatMap((set) => set.spondClubMembers),
        ...result.unregisteredMembers,
      ]
      const klubbAdminPlaced = [
        ...result.foundInBoth.map((m) => m.klubbAdminMember),
        ...result.possibleMatches.flatMap((set) => set.klubbAdminMembers),
        ...result.klubbAdminOnlyMembers,
      ]
      // Compared by identity: each input object exactly once.
      expect(new Set(spondClubPlaced).size).toBe(spondClubPlaced.length)
      expect(new Set(spondClubPlaced)).toEqual(new Set(spondClub))
      expect(new Set(klubbAdminPlaced).size).toBe(klubbAdminPlaced.length)
      expect(new Set(klubbAdminPlaced)).toEqual(new Set(klubbAdmin))
      for (const set of result.possibleMatches) {
        for (const pair of set.pairs) {
          expect(set.spondClubMembers).toContain(pair.spondClubMember)
          expect(set.klubbAdminMembers).toContain(pair.klubbAdminMember)
        }
      }
    }
  })

  it('lists people with no match as Unregistered or KlubbAdmin-only', () => {
    const spond = person('Kari', 'Hansen')
    const klubbAdmin = person('Per', 'Olsen')

    expect(matchMembers([spond], [klubbAdmin])).toEqual({
      foundInBoth: [],
      possibleMatches: [],
      unregisteredMembers: [spond],
      klubbAdminOnlyMembers: [klubbAdmin],
    })
  })
})
