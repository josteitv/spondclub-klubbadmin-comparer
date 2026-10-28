// PROTOTYPE, throwaway (branch prototype/unregistered-contacts). Not for main.
// Question: how should "Ikke registrert i KlubbAdmin" show the member's own email/phone and the
// Guardians' contact details so all of it is visible? Variants switch with ?variant= and the
// floating bar (← →); ?demo loads invented exports. Dev server only.
import { useEffect, useState } from 'preact/hooks'
import type { KlubbAdminExport, SpondClubExport } from './exports/read-export.ts'
import type { Guardian, SpondClubMember } from './matching/match.ts'
import { BirthDate, Groups, Missing, name, UnregisteredTable } from './report.tsx'
import './prototype-unregistered.css'

// ---------- variant switching ----------

const VARIANTS = [
  { key: 'now', label: 'Nå (i dag)' },
  { key: 'A', label: 'A: Kontaktkolonne' },
  { key: 'B', label: 'B: Kort per medlem' },
  { key: 'C', label: 'C: Én rad per kontakt' },
  { key: 'D', label: 'D: Foreslått kontakt + flere' },
] as const

type VariantKey = (typeof VARIANTS)[number]['key']

const readVariant = (): VariantKey => {
  const v = new URLSearchParams(location.search).get('variant')
  return VARIANTS.find((x) => x.key === v)?.key ?? 'now'
}

function useVariant() {
  const [variant, setVariant] = useState(readVariant)
  useEffect(() => {
    const update = () => setVariant(readVariant())
    addEventListener('prototype-variant', update)
    return () => removeEventListener('prototype-variant', update)
  }, [])
  return variant
}

function go(step: number) {
  const i = VARIANTS.findIndex((x) => x.key === readVariant())
  const next = VARIANTS[(i + step + VARIANTS.length) % VARIANTS.length]
  const params = new URLSearchParams(location.search)
  params.set('variant', next.key)
  history.replaceState(null, '', `?${params}`)
  dispatchEvent(new Event('prototype-variant'))
}

export function PrototypeSwitcher() {
  const variant = useVariant()
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (target.closest('input, textarea, [contenteditable]')) return
      if (event.key === 'ArrowLeft') go(-1)
      if (event.key === 'ArrowRight') go(1)
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [])
  if (!import.meta.env.DEV) return null
  return (
    <div class="proto-switcher" role="toolbar" aria-label="Prototypevariant">
      <button type="button" onClick={() => go(-1)} aria-label="Forrige variant">
        ←
      </button>
      <span>{VARIANTS.find((x) => x.key === variant)?.label}</span>
      <button type="button" onClick={() => go(1)} aria-label="Neste variant">
        →
      </button>
    </div>
  )
}

export function PrototypeUnregistered({ members }: { members: SpondClubMember[] }) {
  const variant = useVariant()
  if (variant === 'A') return <VariantA members={members} />
  if (variant === 'B') return <VariantB members={members} />
  if (variant === 'C') return <VariantC members={members} />
  if (variant === 'D') return <VariantD members={members} />
  return <UnregisteredTable members={members} />
}

// ---------- shared bits ----------

interface Contact {
  role: string
  who?: string
  email?: string
  phone?: string
}

/** The member's own details first (if any), then each Guardian. */
function contactsOf(member: SpondClubMember): Contact[] {
  const own: Contact[] = member.email || member.phone ? [{ role: 'Medlemmet', email: member.email, phone: member.phone }] : []
  const guardians = (member.guardians ?? []).map((g: Guardian) => ({
    role: 'Foresatt',
    who: name(g) || undefined,
    email: g.email,
    phone: g.phone,
  }))
  return [...own, ...guardians]
}

const Email = ({ value }: { value?: string }) => (value ? <span class="proto-email">{value}</span> : <Missing what="ingen e-post" />)
const Phone = ({ value }: { value?: string }) =>
  value ? <span class="data nowrap">{value}</span> : <Missing what="ingen telefon" />

const NoContact = () => <Missing what="ingen kontaktinfo" />

// ---------- A: one Kontakt column, an aligned mini-grid per member ----------

function VariantA({ members }: { members: SpondClubMember[] }) {
  return (
    <table class="proto-a">
      <thead>
        <tr>
          <th>Navn</th>
          <th>Født</th>
          <th>Grupper i Spond Club</th>
          <th>Kontakt</th>
        </tr>
      </thead>
      <tbody>
        {members.map((m) => {
          const contacts = contactsOf(m)
          return (
            <tr>
              <td>
                <strong>{name(m)}</strong>
              </td>
              <td>
                <BirthDate person={m} />
              </td>
              <td class="groups">
                <Groups person={m} />
              </td>
              <td>
                {contacts.length === 0 ? (
                  <NoContact />
                ) : (
                  <div class="proto-a-grid">
                    {contacts.map((c) => (
                      <>
                        <span class="proto-role">{c.role === 'Medlemmet' ? 'Medlemmet' : (c.who ?? 'Foresatt')}</span>
                        <Email value={c.email} />
                        <Phone value={c.phone} />
                      </>
                    ))}
                  </div>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

// ---------- B: no table, one card per member with contact tiles ----------

function VariantB({ members }: { members: SpondClubMember[] }) {
  return (
    <div class="proto-b">
      {members.map((m) => {
        const contacts = contactsOf(m)
        return (
          <article class="proto-b-card">
            <header>
              <strong>{name(m)}</strong>
              <span class="muted">
                født <BirthDate person={m} /> · <Groups person={m} />
              </span>
            </header>
            {contacts.length === 0 ? (
              <NoContact />
            ) : (
              <div class="proto-b-tiles">
                {contacts.map((c) => (
                  <div class={c.role === 'Medlemmet' ? 'proto-b-tile own' : 'proto-b-tile'}>
                    <span class="proto-role">{c.role === 'Medlemmet' ? 'Medlemmet selv' : `Foresatt: ${c.who ?? 'navn mangler'}`}</span>
                    <Email value={c.email} />
                    <Phone value={c.phone} />
                  </div>
                ))}
              </div>
            )}
          </article>
        )
      })}
    </div>
  )
}

// ---------- C: one table row per contact, member cells span them ----------

function VariantC({ members }: { members: SpondClubMember[] }) {
  return (
    <table class="proto-c">
      <thead>
        <tr>
          <th>Navn</th>
          <th>Født</th>
          <th>Grupper i Spond Club</th>
          <th>Kontaktperson</th>
          <th>E-post</th>
          <th>Telefon</th>
        </tr>
      </thead>
      <tbody>
        {members.map((m) => {
          const contacts = contactsOf(m)
          const rows = contacts.length === 0 ? [undefined] : contacts
          return rows.map((c, i) => (
            <tr class={i === 0 ? 'first' : 'more'}>
              {i === 0 && (
                <>
                  <td rowSpan={rows.length}>
                    <strong>{name(m)}</strong>
                  </td>
                  <td rowSpan={rows.length}>
                    <BirthDate person={m} />
                  </td>
                  <td rowSpan={rows.length} class="groups">
                    <Groups person={m} />
                  </td>
                </>
              )}
              {c ? (
                <>
                  <td>{c.role === 'Medlemmet' ? <span class="proto-role">Medlemmet selv</span> : (c.who ?? <Missing what="navn mangler" />)}</td>
                  <td>
                    <Email value={c.email} />
                  </td>
                  <td>
                    <Phone value={c.phone} />
                  </td>
                </>
              ) : (
                <td colSpan={3}>
                  <NoContact />
                </td>
              )}
            </tr>
          ))
        })}
      </tbody>
    </table>
  )
}

// ---------- D: one suggested contact per member, the rest behind "flere" ----------

function VariantD({ members }: { members: SpondClubMember[] }) {
  return (
    <table class="proto-d">
      <thead>
        <tr>
          <th>Navn</th>
          <th>Født</th>
          <th>Grupper i Spond Club</th>
          <th>Kontakt for registrering</th>
        </tr>
      </thead>
      <tbody>
        {members.map((m) => {
          // Suggest the first contact with an email, else the first one at all.
          const contacts = contactsOf(m)
          const suggested = contacts.find((c) => c.email) ?? contacts[0]
          const others = contacts.filter((c) => c !== suggested)
          return (
            <tr>
              <td>
                <strong>{name(m)}</strong>
              </td>
              <td>
                <BirthDate person={m} />
              </td>
              <td class="groups">
                <Groups person={m} />
              </td>
              <td>
                {!suggested ? (
                  <NoContact />
                ) : (
                  <>
                    <div class="proto-d-main">
                      <span class="proto-role">{suggested.role === 'Medlemmet' ? 'Medlemmet selv' : suggested.who}</span>
                      <Email value={suggested.email} />
                      <Phone value={suggested.phone} />
                    </div>
                    {others.length > 0 && (
                      <details>
                        <summary>
                          {others.length} {others.length === 1 ? 'annen kontakt' : 'andre kontakter'}
                        </summary>
                        {others.map((c) => (
                          <div class="proto-d-main">
                            <span class="proto-role">{c.role === 'Medlemmet' ? 'Medlemmet selv' : (c.who ?? 'Foresatt')}</span>
                            <Email value={c.email} />
                            <Phone value={c.phone} />
                          </div>
                        ))}
                      </details>
                    )}
                  </>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

// ---------- invented demo data (?demo) ----------

const d = (iso: string) => new Date(`${iso}T00:00:00Z`)

export const DEMO_SPOND_CLUB: SpondClubExport = {
  notMemberCount: 3,
  skippedWithoutName: 0,
  members: [
    {
      firstName: 'Aksel',
      lastName: 'Berg',
      birthDate: d('2016-04-03'),
      groups: 'Allidrett 2016',
      guardians: [
        { firstName: 'Ingrid', lastName: 'Berg', email: 'ingrid.berg.hjemme@eksempelpost.no', phone: '+4741111111' },
        { firstName: 'Jon Erik', lastName: 'Berg-Halvorsen', email: 'jon.erik.berg.halvorsen@eksempel-arbeid.no', phone: '+4742222222' },
      ],
    },
    {
      firstName: 'Elias Moe',
      lastName: 'Strand',
      birthDate: d('2014-09-11'),
      groups: 'Fotball G10, Vintertrening, mandag og onsdag',
      guardians: [
        { firstName: 'Mari', lastName: 'Strand', email: 'mari@eksempel.no', phone: '+4743333333' },
        { firstName: 'Ola', lastName: 'Moe', phone: '+4744444444' },
        { firstName: 'Bestemor', lastName: 'Moe', email: 'bestemor.moe@eksempel.no' },
        { firstName: 'Kari', lastName: 'Strand', email: 'kari.strand@eksempel.no', phone: '+4745555555' },
      ],
    },
    { firstName: 'Frida', lastName: 'Holm', groups: 'Håndball J11' },
    {
      firstName: 'Henrik',
      lastName: 'Solberg',
      birthDate: d('1984-12-25'),
      groups: 'Old boys',
      email: 'henrik.solberg@eksempel.no',
      phone: '+4746666666',
    },
    {
      firstName: 'Ida',
      lastName: 'Myhre',
      birthDate: d('2008-07-07'),
      groups: 'Turn',
      email: 'ida.myhre2008@eksempel.no',
      phone: '+4747777777',
      guardians: [{ firstName: 'Tone', lastName: 'Myhre', email: 'tone.myhre@eksempel.no', phone: '+4748888888' }],
    },
    {
      firstName: 'Leah',
      lastName: 'Ahmed',
      birthDate: d('2013-02-16'),
      groups: 'Fotball J12',
      guardians: [{ firstName: '', lastName: '', email: 'familien.ahmed@eksempel.no' }],
    },
    { firstName: 'Ola', lastName: 'Nordmann', birthDate: d('2012-03-04'), groups: 'Fotball G12' },
  ],
}

export const DEMO_KLUBBADMIN: KlubbAdminExport = {
  skippedWithoutName: 0,
  members: [
    { firstName: 'Ola', lastName: 'Nordmann', birthDate: d('2012-03-04'), groups: 'Fotball' },
    { firstName: 'Liv', lastName: 'Sætre', birthDate: d('1985-03-30') },
  ],
}

export const demoRequested = () => import.meta.env.DEV && new URLSearchParams(location.search).has('demo')
