export interface Person {
  firstName: string
  lastName: string
  birthDate?: Date
  groups?: string
}

/** A Guardian of a Spond Club member, with the contact details for registering them. */
export interface Guardian {
  firstName: string
  lastName: string
  email?: string
  phone?: string
}

/** Contact details, shown for registering an Unregistered member; never compared. */
export interface SpondClubMember extends Person {
  email?: string
  phone?: string
  guardians?: Guardian[]
}
export type KlubbAdminMember = Person

export interface Match {
  spondClubMember: SpondClubMember
  klubbAdminMember: KlubbAdminMember
}

export type PossibleMatchReason = 'same-name' | 'missing-words' | 'typo'

export interface PossibleMatchPair extends Match {
  reason: PossibleMatchReason
}

/** People linked by Possible-match pairs, directly or through each other. */
export interface PossibleMatchSet {
  spondClubMembers: SpondClubMember[]
  klubbAdminMembers: KlubbAdminMember[]
  pairs: PossibleMatchPair[]
}

export interface MatchResult {
  foundInBoth: Match[]
  possibleMatches: PossibleMatchSet[]
  unregisteredMembers: SpondClubMember[]
  klubbAdminOnlyMembers: KlubbAdminMember[]
}

// NFD splits å into a + ring above; keep that ring so å stays distinct from a (æ and ø don't decompose).
const stripAccents = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, (mark, i: number, str: string) => (mark === '̊' && str[i - 1] === 'a' ? mark : ''))
    .normalize('NFC')

/** First + last name, lower case, without accents or hyphens, words sorted. */
const fullName = (p: Person) =>
  stripAccents(`${p.firstName} ${p.lastName}`.toLowerCase())
    .replaceAll('-', ' ')
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(' ')

function levenshtein(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const current = [i]
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
    previous = current
  }
  return previous[b.length]
}

const letterCount = (name: string) => name.replaceAll(' ', '').length

function possibleMatchReason(a: string, b: string): PossibleMatchReason | undefined {
  // Only reached for a name used more than once on a side, which is never Found in both.
  if (a === b) return 'same-name'
  const [shorter, longer] = [a.split(' '), b.split(' ')].sort((x, y) => x.length - y.length)
  if (shorter.length >= 2 && shorter.every((word) => longer.includes(word))) return 'missing-words'
  // The shorter name sets the limit, so the stricter one applies.
  const maxTypos = Math.min(letterCount(a), letterCount(b)) < 10 ? 1 : 2
  if (levenshtein(transliterate(a), transliterate(b)) <= maxTypos) return 'typo'
  return undefined
}

/** å → aa, æ → ae, ø → o, words re-sorted: these spellings are not typos. */
const transliterate = (name: string) =>
  name.replaceAll('å', 'aa').replaceAll('æ', 'ae').replaceAll('ø', 'o').split(' ').sort().join(' ')

function findPossibleMatches(spondClub: SpondClubMember[], klubbAdmin: KlubbAdminMember[]): PossibleMatchPair[] {
  const pairs: PossibleMatchPair[] = []
  for (const s of spondClub) {
    for (const k of klubbAdmin) {
      const reason = possibleMatchReason(fullName(s), fullName(k))
      if (reason) pairs.push({ spondClubMember: s, klubbAdminMember: k, reason })
    }
  }
  return pairs
}

function groupIntoSets(pairs: PossibleMatchPair[]): PossibleMatchSet[] {
  const setOf = new Map<Person, PossibleMatchSet>()
  const sets: PossibleMatchSet[] = []
  for (const pair of pairs) {
    const s = setOf.get(pair.spondClubMember)
    const k = setOf.get(pair.klubbAdminMember)
    let set: PossibleMatchSet
    if (s && k && s !== k) {
      // The pair links two sets: merge k into s.
      s.spondClubMembers.push(...k.spondClubMembers)
      s.klubbAdminMembers.push(...k.klubbAdminMembers)
      s.pairs.push(...k.pairs)
      for (const p of [...k.spondClubMembers, ...k.klubbAdminMembers]) setOf.set(p, s)
      sets.splice(sets.indexOf(k), 1)
      set = s
    } else {
      set = s ?? k ?? { spondClubMembers: [], klubbAdminMembers: [], pairs: [] }
      if (!s && !k) sets.push(set)
    }
    if (!s) set.spondClubMembers.push(pair.spondClubMember)
    if (!k) set.klubbAdminMembers.push(pair.klubbAdminMember)
    for (const p of [pair.spondClubMember, pair.klubbAdminMember]) setOf.set(p, set)
    set.pairs.push(pair)
  }
  return sets
}

function groupByName<P extends Person>(people: P[]): Map<string, P[]> {
  const byName = new Map<string, P[]>()
  for (const p of people) {
    const name = fullName(p)
    byName.set(name, [...(byName.get(name) ?? []), p])
  }
  return byName
}

export function matchMembers(spondClub: SpondClubMember[], klubbAdmin: KlubbAdminMember[]): MatchResult {
  const spondClubByName = groupByName(spondClub)
  const klubbAdminByName = groupByName(klubbAdmin)
  const foundInBoth: Match[] = []
  const matched = new Set<Person>()
  for (const [name, spondClubMembers] of spondClubByName) {
    const klubbAdminMembers = klubbAdminByName.get(name)
    if (spondClubMembers.length === 1 && klubbAdminMembers?.length === 1) {
      foundInBoth.push({ spondClubMember: spondClubMembers[0], klubbAdminMember: klubbAdminMembers[0] })
      matched.add(spondClubMembers[0]).add(klubbAdminMembers[0])
    }
  }

  const pairs = findPossibleMatches(
    spondClub.filter((s) => !matched.has(s)),
    klubbAdmin.filter((k) => !matched.has(k)),
  )
  const possibleMatches = groupIntoSets(pairs)
  const inPossibleMatch = new Set(pairs.flatMap((p) => [p.spondClubMember, p.klubbAdminMember]))
  const unmatched = (p: Person) => !matched.has(p) && !inPossibleMatch.has(p)

  return {
    foundInBoth,
    possibleMatches,
    unregisteredMembers: spondClub.filter(unmatched),
    klubbAdminOnlyMembers: klubbAdmin.filter(unmatched),
  }
}
