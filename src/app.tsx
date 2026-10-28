import { useRef, useState } from 'preact/hooks'
import {
  identifyExport,
  readKlubbAdminExport,
  readSpondClubExport,
  type ExportError,
  type KlubbAdminExport,
  type SpondClubExport,
} from './exports/read-export.ts'
import { DEMO_KLUBBADMIN, DEMO_SPOND_CLUB, demoRequested, PrototypeSwitcher } from './prototype-registered.tsx'
import { Report } from './report.tsx'

interface Loaded<T> {
  fileName: string
  value: T
}

function errorMessage(fileName: string, error: ExportError): string {
  const file = `«${fileName}»`
  switch (error.code) {
    case 'not-xlsx':
      return `${file} er ikke en Excel-fil (.xlsx).`
    case 'empty-sheet':
      return `${file} er tom.`
    case 'missing-columns':
      return `${file} mangler kolonnene ${error.columns.join(', ')}.`
    case 'unrecognised':
      return (
        `${file} er ikke en eksport fra Spond Club eller KlubbAdmin. ` +
        `Som eksport fra Spond Club mangler den kolonnene ${error.missing.spondClub.join(', ')}. ` +
        `Som eksport fra KlubbAdmin mangler den kolonnene ${error.missing.klubbAdmin.join(', ')}.`
      )
  }
}

export function App() {
  const [spondClub, setSpondClub] = useState<Loaded<SpondClubExport> | undefined>(() =>
    demoRequested() ? { fileName: 'demo (oppdiktet)', value: DEMO_SPOND_CLUB } : undefined,
  )
  const [klubbAdmin, setKlubbAdmin] = useState<Loaded<KlubbAdminExport> | undefined>(() =>
    demoRequested() ? { fileName: 'demo (oppdiktet)', value: DEMO_KLUBBADMIN } : undefined,
  )

  const [messages, setMessages] = useState<string[]>([])
  const [dragging, setDragging] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  // Bumped by Start på nytt, so files still being read when it was clicked are dropped.
  const run = useRef(0)

  function startOver() {
    run.current++
    setSpondClub(undefined)
    setKlubbAdmin(undefined)
    setMessages([])
    // Lets the same file be picked again.
    if (input.current) input.current.value = ''
  }

  async function addFiles(files: File[]) {
    const thisRun = run.current
    // Local copies: the state seen by this call doesn't change while it runs.
    let loaded = { spondClub, klubbAdmin }
    const found: string[] = []
    for (const file of files) {
      const kind = await identifyExport(file)
      if (!kind.ok) {
        found.push(errorMessage(file.name, kind.error))
        continue
      }
      // A second file of a kind already loaded replaces it, but the other export is still missing.
      const sameKindTwice = kind.value === 'spond-club' ? loaded.spondClub && !loaded.klubbAdmin : loaded.klubbAdmin && !loaded.spondClub
      if (sameKindTwice) {
        found.push(
          kind.value === 'spond-club'
            ? 'Begge filene er eksporter fra Spond Club. Eksporten fra KlubbAdmin mangler.'
            : 'Begge filene er eksporter fra KlubbAdmin. Eksporten fra Spond Club mangler.',
        )
      }
      if (kind.value === 'spond-club') {
        const read = await readSpondClubExport(file)
        if (read.ok) loaded = { ...loaded, spondClub: { fileName: file.name, value: read.value } }
        else found.push(errorMessage(file.name, read.error))
      } else {
        const read = await readKlubbAdminExport(file)
        if (read.ok) loaded = { ...loaded, klubbAdmin: { fileName: file.name, value: read.value } }
        else found.push(errorMessage(file.name, read.error))
      }
    }
    if (thisRun !== run.current) return
    setSpondClub(loaded.spondClub)
    setKlubbAdmin(loaded.klubbAdmin)
    setMessages(found)
  }

  return (
    <main>
      <header>
        <h1>Medlemssjekk</h1>
        <p class="muted">Sammenligner medlemmene i Spond Club med medlemmene i KlubbAdmin. Ingen data forlater nettleseren din.</p>
      </header>
      <section
        class={dragging ? 'drop-zone dragging' : 'drop-zone'}
        aria-labelledby="eksportfiler"
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          addFiles([...(event.dataTransfer?.files ?? [])])
        }}
      >
        <h2 id="eksportfiler">Eksportfiler</h2>
        <p>Slipp eksportfilene fra Spond Club og KlubbAdmin her, i hvilken som helst rekkefølge.</p>
        <div class="actions">
          <label class="button">
            Velg filer
            <input
              ref={input}
              class="visually-hidden"
              type="file"
              multiple
              accept=".xlsx"
              onChange={(event) => addFiles([...(event.currentTarget.files ?? [])])}
            />
          </label>
          {(spondClub || klubbAdmin || messages.length > 0) && (
            <button type="button" class="button secondary" onClick={startOver}>
              Start på nytt
            </button>
          )}
        </div>
        <ul class="files">
          <li class={spondClub ? 'loaded' : undefined}>Spond Club: {spondClub?.fileName ?? 'mangler'}</li>
          <li class={klubbAdmin ? 'loaded' : undefined}>KlubbAdmin: {klubbAdmin?.fileName ?? 'mangler'}</li>
        </ul>
        {messages.length > 0 && (
          <div class="messages" role="alert">
            {messages.map((message) => (
              <p>{message}</p>
            ))}
          </div>
        )}
      </section>
      {spondClub && klubbAdmin && <Report spondClub={spondClub.value} klubbAdmin={klubbAdmin.value} />}
      <PrototypeSwitcher />
      <footer class="version">Versjon {__APP_VERSION__}</footer>
    </main>
  )
}
