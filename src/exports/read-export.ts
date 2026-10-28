// The only module that reads export files, and the only one that imports read-excel-file (ticket 08),
// so the parser can be swapped without touching the rest.
import {
  InvalidInputError,
  InvalidSpreadsheetError,
  readSheet,
  SheetNotFoundError,
  type Row,
} from 'read-excel-file/universal'
import type { Guardian, KlubbAdminMember, SpondClubMember } from '../matching/match.ts'

/** Why a file was rejected. `code` is also the key of its message in the interface. */
export type ExportError =
  | { code: 'not-xlsx' }
  | { code: 'empty-sheet' }
  | { code: 'missing-columns'; columns: string[] }
  /** Neither export: the columns each one would need. */
  | { code: 'unrecognised'; missing: { spondClub: string[]; klubbAdmin: string[] } }

export type Result<T> = { ok: true; value: T } | { ok: false; error: ExportError }

export type ExportKind = 'spond-club' | 'klubbadmin'

export interface SpondClubExport {
  members: SpondClubMember[]
  notMemberCount: number
  skippedWithoutName: number
}

export interface KlubbAdminExport {
  members: KlubbAdminMember[]
  skippedWithoutName: number
}

// The required columns of each export (ticket 03); other columns are ignored.
const SPOND_CLUB_COLUMNS = {
  memberType: 'Medlemstype',
  firstName: 'Medlem fornavn',
  lastName: 'Medlem etternavn',
  birthDate: 'Fødselsdato',
  groups: 'Grupper',
} as const

// Optional Spond Club columns: a file without them is still read (ticket 18).
const SPOND_CLUB_CONTACT_COLUMNS = { email: 'Medlems-e-post', phone: 'Medlem mobil' } as const
const GUARDIAN_COLUMNS = [1, 2, 3, 4].map((n) => ({
  firstName: `Foresatt ${n} fornavn`,
  lastName: `Foresatt ${n} etternavn`,
  email: `Foresatt ${n} e-post`,
  phone: `Foresatt ${n} telefonnummer`,
}))

const KLUBBADMIN_COLUMNS = {
  firstName: 'Fornavn',
  lastName: 'Etternavn',
  birthDate: 'Fødselsdato',
  groups: 'Grupper/grener',
} as const

type Columns = Record<string, string>
type CellOf<C extends Columns> = (row: Row, key: keyof C) => unknown

interface Sheet {
  header: string[]
  rows: Row[]
}

async function readFirstSheet(file: Blob): Promise<Result<Sheet>> {
  let data: Row[]
  try {
    data = await readSheet(file)
  } catch (error) {
    if (error instanceof InvalidInputError || error instanceof InvalidSpreadsheetError || error instanceof SheetNotFoundError) {
      return { ok: false, error: { code: 'not-xlsx' } }
    }
    throw error
  }
  const [header, ...rows] = data
  if (!header) return { ok: false, error: { code: 'empty-sheet' } }
  return { ok: true, value: { header: header.map(text), rows } }
}

const missingColumns = (header: string[], columns: Columns) =>
  Object.values(columns).filter((title) => !header.includes(title))

/** Finds each required column by its header title; never guesses. */
function locateColumns<C extends Columns>(header: string[], columns: C): Result<CellOf<C>> {
  const missing = missingColumns(header, columns)
  if (missing.length > 0) return { ok: false, error: { code: 'missing-columns', columns: missing } }
  const index = Object.fromEntries(Object.entries(columns).map(([key, title]) => [key, header.indexOf(title)]))
  return { ok: true, value: (row, key) => row[index[key as string]] }
}

/** Reads a column that may be missing from the file; a missing column reads as empty text. */
const optionalColumn = (header: string[], title: string) => {
  const index = header.indexOf(title)
  return (row: Row) => (index === -1 ? '' : text(row[index]))
}

/** A cell as trimmed text. A number stored in a text-formatted cell is read as a number, so it is converted back. */
const text = (value: unknown) =>
  typeof value === 'string' ? value.trim() : typeof value === 'number' ? String(value) : ''

/** `dd.mm.yyyy` text as a Date at UTC midnight, like the Spond Club dates. */
function parseDate(value: string): Date | undefined {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value)
  if (!match) return undefined
  const [day, month, year] = match.slice(1).map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  // Date.UTC rolls 31.02 over into March; such a date is invalid, not a different day.
  return date.getUTCDate() === day && date.getUTCMonth() === month - 1 ? date : undefined
}

/** Tells which export a file is from its header row alone. */
export async function identifyExport(file: Blob): Promise<Result<ExportKind>> {
  const sheet = await readFirstSheet(file)
  if (!sheet.ok) return sheet
  const missing = {
    spondClub: missingColumns(sheet.value.header, SPOND_CLUB_COLUMNS),
    klubbAdmin: missingColumns(sheet.value.header, KLUBBADMIN_COLUMNS),
  }
  if (missing.spondClub.length === 0) return { ok: true, value: 'spond-club' }
  if (missing.klubbAdmin.length === 0) return { ok: true, value: 'klubbadmin' }
  return { ok: false, error: { code: 'unrecognised', missing } }
}

export async function readSpondClubExport(file: Blob): Promise<Result<SpondClubExport>> {
  const sheet = await readFirstSheet(file)
  if (!sheet.ok) return sheet
  const located = locateColumns(sheet.value.header, SPOND_CLUB_COLUMNS)
  if (!located.ok) return located
  const cell = located.value
  const email = optionalColumn(sheet.value.header, SPOND_CLUB_CONTACT_COLUMNS.email)
  const phone = optionalColumn(sheet.value.header, SPOND_CLUB_CONTACT_COLUMNS.phone)
  const guardianColumns = GUARDIAN_COLUMNS.map((columns) => ({
    firstName: optionalColumn(sheet.value.header, columns.firstName),
    lastName: optionalColumn(sheet.value.header, columns.lastName),
    email: optionalColumn(sheet.value.header, columns.email),
    phone: optionalColumn(sheet.value.header, columns.phone),
  }))

  const members: SpondClubMember[] = []
  let notMemberCount = 0
  let skippedWithoutName = 0
  for (const row of sheet.value.rows) {
    // Only `Medlem` rows are Spond Club members; `Ikke medlem` rows are left out but counted.
    if (text(cell(row, 'memberType')) !== 'Medlem') {
      notMemberCount++
      continue
    }
    const member: SpondClubMember = { firstName: text(cell(row, 'firstName')), lastName: text(cell(row, 'lastName')) }
    if (!member.firstName && !member.lastName) {
      skippedWithoutName++
      continue
    }
    // A date serial with a date format comes back as a Date at UTC midnight.
    const birthDate = cell(row, 'birthDate')
    if (birthDate instanceof Date) member.birthDate = birthDate
    const groups = text(cell(row, 'groups'))
    if (groups) member.groups = groups
    if (email(row)) member.email = email(row)
    if (phone(row)) member.phone = phone(row)
    const guardians = guardianColumns.flatMap((columns) => {
      const guardian: Guardian = { firstName: columns.firstName(row), lastName: columns.lastName(row) }
      if (columns.email(row)) guardian.email = columns.email(row)
      if (columns.phone(row)) guardian.phone = columns.phone(row)
      // A Guardian slot with every field empty is unused.
      return guardian.firstName || guardian.lastName || guardian.email || guardian.phone ? [guardian] : []
    })
    if (guardians.length > 0) member.guardians = guardians
    members.push(member)
  }
  return { ok: true, value: { members, notMemberCount, skippedWithoutName } }
}

export async function readKlubbAdminExport(file: Blob): Promise<Result<KlubbAdminExport>> {
  const sheet = await readFirstSheet(file)
  if (!sheet.ok) return sheet
  const located = locateColumns(sheet.value.header, KLUBBADMIN_COLUMNS)
  if (!located.ok) return located
  const cell = located.value

  const members: KlubbAdminMember[] = []
  let skippedWithoutName = 0
  for (const row of sheet.value.rows) {
    const member: KlubbAdminMember = { firstName: text(cell(row, 'firstName')), lastName: text(cell(row, 'lastName')) }
    if (!member.firstName && !member.lastName) {
      skippedWithoutName++
      continue
    }
    // Every KlubbAdmin cell is text, the birth date included.
    const birthDate = parseDate(text(cell(row, 'birthDate')))
    if (birthDate) member.birthDate = birthDate
    // Entries are `|`-joined in KlubbAdmin and shown joined by `, `.
    const groups = text(cell(row, 'groups'))
      .split('|')
      .map((group) => group.trim())
      .filter(Boolean)
      .join(', ')
    if (groups) member.groups = groups
    members.push(member)
  }
  return { ok: true, value: { members, skippedWithoutName } }
}
