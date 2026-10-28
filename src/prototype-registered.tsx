// PROTOTYPE, throwaway (branch prototype/registered-tracking). Not for main.
// Question: how should the Membership manager mark Unregistered members as registered in KlubbAdmin
// while working through the list? Marks live in memory only (lost on reload / Start på nytt).
// Variants switch with ?variant= and the floating bar (← →); ?demo loads invented exports. Dev only.
import { useEffect, useState } from 'preact/hooks'
import type { KlubbAdminExport, SpondClubExport } from './exports/read-export.ts'
import type { SpondClubMember } from './matching/match.ts'
import { BirthDate, Contacts, Groups, name, UnregisteredTable, type OnCopy } from './report.tsx'
import './prototype-registered.css'

// ---------- variant switching ----------

const VARIANTS = [
  { key: 'now', label: 'Nå (uten avkrysning)' },
  { key: 'A', label: 'A: Avkrysningskolonne' },
  { key: 'B', label: 'B: Flytt til «Registrert»' },
  { key: 'C', label: 'C: Filter gjenstår/registrert' },
  { key: 'D', label: 'D: Én om gangen' },
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

// ---------- shared state: which members are marked, in memory only ----------

type Marks = { has: (m: SpondClubMember) => boolean; toggle: (m: SpondClubMember) => void; count: number }

function useMarks(): Marks {
  const [marked, setMarked] = useState<Set<SpondClubMember>>(new Set())
  return {
    has: (m) => marked.has(m),
    toggle: (m) =>
      setMarked((old) => {
        const next = new Set(old)
        if (next.has(m)) next.delete(m)
        else next.add(m)
        return next
      }),
    count: marked.size,
  }
}

function Progress({ done, total }: { done: number; total: number }) {
  return (
    <div class="proto-progress">
      <span>
        <strong>{done}</strong> av {total} registrert i KlubbAdmin
      </span>
      <progress max={total} value={done} />
    </div>
  )
}

export function PrototypeRegistered({ members, onCopy }: { members: SpondClubMember[]; onCopy: OnCopy }) {
  const variant = useVariant()
  const marks = useMarks()
  // Variants keep their own marks so switching starts clean; fine for a prototype.
  if (variant === 'A') return <VariantA members={members} onCopy={onCopy} marks={marks} />
  if (variant === 'B') return <VariantB members={members} onCopy={onCopy} marks={marks} />
  if (variant === 'C') return <VariantC members={members} onCopy={onCopy} marks={marks} />
  if (variant === 'D') return <VariantD members={members} onCopy={onCopy} marks={marks} />
  return <UnregisteredTable members={members} onCopy={onCopy} />
}

interface Props {
  members: SpondClubMember[]
  onCopy: OnCopy
  marks: Marks
}

// ---------- A: a checkbox first in each row; ticked rows fade, the list stays put ----------

function VariantA({ members, onCopy, marks }: Props) {
  return (
    <>
      <Progress done={marks.count} total={members.length} />
      <table class="proto-a">
        <thead>
          <tr>
            <th>Registrert</th>
            <th>Navn</th>
            <th>Født</th>
            <th>Grupper i Spond Club</th>
            <th>Kontakt</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr class={marks.has(m) ? 'done' : undefined}>
              <td>
                <input
                  type="checkbox"
                  class="proto-check"
                  checked={marks.has(m)}
                  onChange={() => marks.toggle(m)}
                  aria-label={`${name(m)} er registrert i KlubbAdmin`}
                />
              </td>
              <td>
                <strong class="proto-name">{name(m)}</strong>
              </td>
              <td>
                <BirthDate person={m} />
              </td>
              <td class="groups">
                <Groups person={m} />
              </td>
              <td>
                <Contacts member={m} onCopy={onCopy} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

// ---------- B: a button moves the member to a "done" list below; undo from there ----------

function VariantB({ members, onCopy, marks }: Props) {
  const todo = members.filter((m) => !marks.has(m))
  const done = members.filter((m) => marks.has(m))
  return (
    <>
      <Progress done={done.length} total={members.length} />
      {todo.length === 0 ? (
        <p class="proto-alldone">Alle er registrert. Bra jobba!</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Navn</th>
              <th>Født</th>
              <th>Grupper i Spond Club</th>
              <th>Kontakt</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {todo.map((m) => (
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
                  <Contacts member={m} onCopy={onCopy} />
                </td>
                <td>
                  <button type="button" class="button proto-small" onClick={() => marks.toggle(m)}>
                    Registrert ✓
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {done.length > 0 && (
        <details class="proto-b-done" open>
          <summary>Registrert i KlubbAdmin nå ({done.length})</summary>
          <ul>
            {done.map((m) => (
              <li>
                <span>✓ {name(m)}</span>
                <button type="button" class="proto-link" onClick={() => marks.toggle(m)}>
                  Angre
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </>
  )
}

// ---------- C: a toggle per row plus a filter: Gjenstår / Registrert / Alle ----------

type Filter = 'todo' | 'done' | 'all'

function VariantC({ members, onCopy, marks }: Props) {
  const [filter, setFilter] = useState<Filter>('todo')
  const shown = members.filter((m) => (filter === 'all' ? true : filter === 'done' ? marks.has(m) : !marks.has(m)))
  const tabs: [Filter, string, number][] = [
    ['todo', 'Gjenstår', members.length - marks.count],
    ['done', 'Registrert', marks.count],
    ['all', 'Alle', members.length],
  ]
  return (
    <>
      <div class="proto-c-bar">
        <div class="proto-tabs" role="tablist">
          {tabs.map(([key, label, n]) => (
            <button type="button" role="tab" aria-selected={filter === key} onClick={() => setFilter(key)}>
              {label} <span class="proto-count">{n}</span>
            </button>
          ))}
        </div>
        <Progress done={marks.count} total={members.length} />
      </div>
      {shown.length === 0 ? (
        <p class="muted">{filter === 'todo' ? 'Ingen igjen. Alle er registrert.' : 'Ingen ennå.'}</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Navn</th>
              <th>Født</th>
              <th>Grupper i Spond Club</th>
              <th>Kontakt</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((m) => (
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
                  <Contacts member={m} onCopy={onCopy} />
                </td>
                <td>
                  <button
                    type="button"
                    class={marks.has(m) ? 'proto-toggle on' : 'proto-toggle'}
                    aria-pressed={marks.has(m)}
                    onClick={() => marks.toggle(m)}
                  >
                    {marks.has(m) ? '✓ Registrert' : 'Ikke registrert'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}

// ---------- D: one member at a time, like a checklist wizard ----------

function VariantD({ members, onCopy, marks }: Props) {
  const [index, setIndex] = useState(0)
  if (members.length === 0) return null
  const i = Math.min(index, members.length - 1)
  const m = members[i]
  const nextOpen = () => {
    // Jump to the next member not yet marked, after this one.
    for (let step = 1; step <= members.length; step++) {
      const j = (i + step) % members.length
      if (!marks.has(members[j]) && members[j] !== m) return setIndex(j)
    }
    setIndex(Math.min(i + 1, members.length - 1))
  }
  return (
    <div class="proto-d">
      <Progress done={marks.count} total={members.length} />
      <nav class="proto-d-dots" aria-label="Medlemmer">
        {members.map((x, j) => (
          <button
            type="button"
            class={`${marks.has(x) ? 'done' : ''} ${j === i ? 'current' : ''}`}
            title={name(x)}
            aria-label={name(x)}
            onClick={() => setIndex(j)}
          />
        ))}
      </nav>
      <article class={marks.has(m) ? 'proto-d-card done' : 'proto-d-card'}>
        <header>
          <span class="muted">
            {i + 1} av {members.length}
          </span>
          <h3>{name(m)}</h3>
          <p class="muted">
            født <BirthDate person={m} /> · <Groups person={m} />
          </p>
        </header>
        <Contacts member={m} onCopy={onCopy} />
        <div class="proto-d-actions">
          <button type="button" class="button secondary" disabled={i === 0} onClick={() => setIndex(i - 1)}>
            ← Forrige
          </button>
          {marks.has(m) ? (
            <button type="button" class="button secondary" onClick={() => marks.toggle(m)}>
              Angre «registrert»
            </button>
          ) : (
            <button
              type="button"
              class="button"
              onClick={() => {
                marks.toggle(m)
                nextOpen()
              }}
            >
              Registrert ✓ – neste
            </button>
          )}
          <button type="button" class="button secondary" disabled={i === members.length - 1} onClick={() => setIndex(i + 1)}>
            Hopp over →
          </button>
        </div>
      </article>
    </div>
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
