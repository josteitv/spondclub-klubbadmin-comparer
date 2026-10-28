import type { ComponentChildren } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import type { KlubbAdminExport, SpondClubExport } from './exports/read-export.ts'
import {
  matchMembers,
  type Guardian,
  type MatchResult,
  type Person,
  type PossibleMatchReason,
  type SpondClubMember,
} from './matching/match.ts'

const name = (p: Person) => `${p.firstName} ${p.lastName}`.trim()

const twoDigits = (n: number) => String(n).padStart(2, '0')

/** Birth dates are read as UTC midnight, so they are shown in UTC. */
function BirthDate({ person: { birthDate } }: { person: Person }) {
  if (!birthDate) return <span class="missing">mangler</span>
  return (
    <span class="data">
      {twoDigits(birthDate.getUTCDate())}.{twoDigits(birthDate.getUTCMonth() + 1)}.{birthDate.getUTCFullYear()}
    </span>
  )
}

const Groups = ({ person }: { person: Person }) =>
  person.groups ? <>{person.groups}</> : <span class="missing">ingen gruppe</span>

const REASONS: Record<PossibleMatchReason, string> = {
  'missing-words': 'Navneledd mangler',
  typo: 'Skrivefeil',
  'same-name': 'Samme navn flere ganger',
}

type Kind = 'unregistered' | 'possible' | 'found' | 'klubbadmin-only'

interface SectionProps {
  id: string
  kind: Kind
  title: string
  hint: string
  empty: boolean
  children: ComponentChildren
}

function Section({ id, kind, title, hint, empty, children }: SectionProps) {
  return (
    <section id={id} class={`section ${kind}`} aria-labelledby={`${id}-tittel`}>
      <header>
        <h2 id={`${id}-tittel`}>{title}</h2>
        <p class="muted">{hint}</p>
      </header>
      {empty ? <p class="muted">Ingen.</p> : <div class="scroll">{children}</div>}
    </section>
  )
}

/** A person in a Possible match, with what helps tell whether it's the same one. */
function Candidate({ person }: { person: Person }) {
  return (
    <p class="candidate">
      <strong>{name(person)}</strong>{' '}
      <span class="meta">
        født <BirthDate person={person} /> · <Groups person={person} />
      </span>
    </p>
  )
}

const collator = new Intl.Collator('nb')
const byName = <T,>(nameOf: (item: T) => Person) => (a: T, b: T) => collator.compare(name(nameOf(a)), name(nameOf(b)))
const asIs = (p: Person) => p

/** Every section in Norwegian alphabetical order; a Possible match set goes by its first Spond Club member. */
function sorted(result: MatchResult): MatchResult {
  const possibleMatches = result.possibleMatches.map((set) => ({
    ...set,
    spondClubMembers: [...set.spondClubMembers].sort(byName(asIs)),
    klubbAdminMembers: [...set.klubbAdminMembers].sort(byName(asIs)),
  }))
  return {
    unregisteredMembers: [...result.unregisteredMembers].sort(byName(asIs)),
    possibleMatches: possibleMatches.sort(byName((set) => set.spondClubMembers[0])),
    foundInBoth: [...result.foundInBoth].sort(byName((match) => match.spondClubMember)),
    klubbAdminOnlyMembers: [...result.klubbAdminOnlyMembers].sort(byName(asIs)),
  }
}

const rowCount = (n: number) => `${n} ${n === 1 ? 'rad' : 'rader'}`

function Summary({ counts, read }: { counts: [id: string, kind: Kind, title: string, count: number][]; read: string }) {
  return (
    <nav class="summary" aria-label="Sammendrag">
      <ul>
        {counts.map(([id, kind, title, count]) => (
          <li>
            <a class={kind} href={`#${id}`}>
              <span class="n">{count}</span> <span>{title}</span>
            </a>
          </li>
        ))}
      </ul>
      <p class="muted">{read}</p>
    </nav>
  )
}

/** Name, birth date and groups: the table for a list of people. */
function PeopleTable({ people, groupsTitle }: { people: Person[]; groupsTitle: string }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Navn</th>
          <th>Født</th>
          <th>{groupsTitle}</th>
        </tr>
      </thead>
      <tbody>
        {people.map((p) => (
          <tr>
            <td>
              <strong>{name(p)}</strong>
            </td>
            <td>
              <BirthDate person={p} />
            </td>
            <td class="groups">
              <Groups person={p} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const Missing = ({ what }: { what: string }) => <span class="missing">{what}</span>

interface Contact {
  who: string
  email?: string
  phone?: string
}

/** The member's own details first, if any, then each Guardian (ticket 18). */
function contactsOf(member: SpondClubMember): Contact[] {
  const own = member.email || member.phone ? [{ who: 'Medlemmet', email: member.email, phone: member.phone }] : []
  const guardians = (member.guardians ?? []).map((g: Guardian) => ({ who: name(g) || 'Foresatt', email: g.email, phone: g.phone }))
  return [...own, ...guardians]
}

/** What a click on a contact detail puts on the clipboard: a Norwegian number without +47, as KlubbAdmin stores it. */
function forKlubbAdmin(phone: string) {
  const compact = phone.replace(/\s/g, '')
  return /^\+47\d{8}$/.test(compact) ? compact.slice(3) : phone
}

type OnCopy = (text: string) => void

/** One click copies the value, to paste it into KlubbAdmin (ticket 19). */
function CopyButton({ value, copy, onCopy, class: className }: { value: string; copy?: string; onCopy: OnCopy; class?: string }) {
  return (
    <button type="button" class={`copy ${className ?? ''}`} title="Klikk for å kopiere" onClick={() => onCopy(copy ?? value)}>
      {value}
    </button>
  )
}

function Contacts({ member, onCopy }: { member: SpondClubMember; onCopy: OnCopy }) {
  const contacts = contactsOf(member)
  if (contacts.length === 0) return <Missing what="ingen kontaktinfo" />
  return (
    <ul class="contacts">
      {contacts.map((c) => (
        <li>
          <span class="who">{c.who}</span>
          {c.email ? <CopyButton class="email" value={c.email} onCopy={onCopy} /> : <Missing what="ingen e-post" />}
          {c.phone ? (
            <CopyButton class="data nowrap" value={c.phone} copy={forKlubbAdmin(c.phone)} onCopy={onCopy} />
          ) : (
            <Missing what="ingen telefon" />
          )}
        </li>
      ))}
    </ul>
  )
}

/** Copies to the clipboard and tells the result in a status line that fades after a while. */
function useCopy(): [OnCopy, string] {
  const [message, setMessage] = useState('')
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), 3000)
    return () => clearTimeout(timer)
  }, [message])
  const copy = (text: string) =>
    navigator.clipboard.writeText(text).then(
      () => setMessage(`Kopiert: ${text}`),
      () => setMessage('Kunne ikke kopiere. Merk teksten og kopier den selv.'),
    )
  return [copy, message]
}

/**
 * People to register in KlubbAdmin, with their own and their Guardians' contact details. The
 * Membership manager ticks each one off once registered (ticket 20); the ticks live only as long as
 * this report, and are never stored.
 */
function UnregisteredTable({ members, onCopy }: { members: SpondClubMember[]; onCopy: OnCopy }) {
  const [registered, setRegistered] = useState<ReadonlySet<SpondClubMember>>(new Set())
  const toggle = (member: SpondClubMember) =>
    setRegistered((old) => {
      const next = new Set(old)
      if (!next.delete(member)) next.add(member)
      return next
    })
  return (
    <>
      <p class="progress">
        <span>
          {registered.size} av {members.length} registrert i KlubbAdmin
        </span>
        <progress max={members.length} value={registered.size} aria-hidden="true" />
      </p>
      <table class="unregistered-table">
        <thead>
          <tr>
            <th>Navn</th>
            <th>Født</th>
            <th>Grupper i Spond Club</th>
            <th>Kontakt</th>
            <th>Registrert</th>
          </tr>
        </thead>
        <tbody>
          {members.map((p) => (
            <tr class={registered.has(p) ? 'registered' : undefined}>
              <td>
                <strong>{name(p)}</strong>
              </td>
              <td>
                <BirthDate person={p} />
              </td>
              <td class="groups">
                <Groups person={p} />
              </td>
              <td>
                <Contacts member={p} onCopy={onCopy} />
              </td>
              <td class="tick">
                <input
                  type="checkbox"
                  checked={registered.has(p)}
                  onChange={() => toggle(p)}
                  aria-label={`${name(p)} er registrert i KlubbAdmin`}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export function Report({ spondClub, klubbAdmin }: { spondClub: SpondClubExport; klubbAdmin: KlubbAdminExport }) {
  const result = sorted(matchMembers(spondClub.members, klubbAdmin.members))
  const [copy, copied] = useCopy()
  return (
    <div class="report">
      <p class={copied ? 'copied visible' : 'copied'} role="status">
        {copied}
      </p>
      <Summary
        counts={[
          ['ikke-registrert', 'unregistered', 'Ikke registrert i KlubbAdmin', result.unregisteredMembers.length],
          ['mulige-treff', 'possible', 'Mulige treff', result.possibleMatches.length],
          ['funnet-i-begge', 'found', 'Funnet i begge', result.foundInBoth.length],
          [
            'kun-klubbadmin',
            'klubbadmin-only',
            'Medlemmer i KlubbAdmin som ikke er i Spond Club',
            result.klubbAdminOnlyMembers.length,
          ],
        ]}
        read={`Lest inn ${spondClub.members.length} medlemmer fra Spond Club og ${klubbAdmin.members.length} medlemmer fra KlubbAdmin.`}
      />
      <Section
        id="ikke-registrert"
        kind="unregistered"
        title="Ikke registrert i KlubbAdmin"
        hint="Hvis personen ikke skal være medlem av klubben, endre medlemstypen til «Ikke medlem» i Spond Club."
        empty={result.unregisteredMembers.length === 0}
      >
        <UnregisteredTable members={result.unregisteredMembers} onCopy={copy} />
      </Section>
      <Section
        id="mulige-treff"
        kind="possible"
        title="Mulige treff"
        hint="Navnene ligner, men er ikke like. Sjekk om det er samme person."
        empty={result.possibleMatches.length === 0}
      >
        <table>
          <thead>
            <tr>
              <th>Spond Club</th>
              <th>KlubbAdmin</th>
              <th>Hvorfor</th>
            </tr>
          </thead>
          <tbody>
            {result.possibleMatches.map((set) => (
              <tr>
                <td class="side">
                  {set.spondClubMembers.map((p) => (
                    <Candidate person={p} />
                  ))}
                </td>
                <td class="side">
                  {set.klubbAdminMembers.map((p) => (
                    <Candidate person={p} />
                  ))}
                </td>
                <td class="why">
                  {set.pairs.every((pair) => pair.reason === set.pairs[0].reason)
                    ? REASONS[set.pairs[0].reason]
                    : set.pairs.map((pair) => (
                        <p>
                          {name(pair.spondClubMember)} – {name(pair.klubbAdminMember)}: {REASONS[pair.reason]}
                        </p>
                      ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
      <Section
        id="funnet-i-begge"
        kind="found"
        title="Funnet i begge"
        hint="Samme navn i begge systemer."
        empty={result.foundInBoth.length === 0}
      >
        <table>
          <thead>
            <tr>
              <th>Navn</th>
              <th>Født i Spond Club</th>
              <th>Født i KlubbAdmin</th>
              <th>Grupper i Spond Club</th>
            </tr>
          </thead>
          <tbody>
            {result.foundInBoth.map((match) => (
              <tr>
                <td>
                  <strong>{name(match.spondClubMember)}</strong>
                </td>
                <td>
                  <BirthDate person={match.spondClubMember} />
                </td>
                <td>
                  <BirthDate person={match.klubbAdminMember} />
                </td>
                <td class="groups">
                  <Groups person={match.spondClubMember} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
      <Section
        id="kun-klubbadmin"
        kind="klubbadmin-only"
        title="Medlemmer i KlubbAdmin som ikke er i Spond Club"
        hint="Registrert i KlubbAdmin, men ikke funnet blant medlemmene i Spond Club."
        empty={result.klubbAdminOnlyMembers.length === 0}
      >
        <PeopleTable people={result.klubbAdminOnlyMembers} groupsTitle="Grupper/grener i KlubbAdmin" />
      </Section>
      <footer class="reminder">
        <p>{rowCount(spondClub.notMemberCount)} i Spond Club med medlemstypen «Ikke medlem» er ikke tatt med.</p>
        <p>{rowCount(spondClub.skippedWithoutName + klubbAdmin.skippedWithoutName)} uten navn er hoppet over.</p>
        <p class="delete-reminder">
          Husk å slette eksportfilene fra datamaskinen når du er ferdig. De inneholder personopplysninger.
        </p>
      </footer>
    </div>
  )
}
