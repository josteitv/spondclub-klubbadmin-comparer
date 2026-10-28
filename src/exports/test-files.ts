// Builds .xlsx files with invented data that mirror the confirmed export structures (ticket 03).
import writeXlsxFile from 'write-excel-file/universal'

type CellValue = string | number | Date | undefined

// The Spond Club export's columns, in order, without the payment contact and the address columns.
export const SPOND_CLUB_COLUMNS = [
  'Medlemstype',
  'Grupper',
  'Undergruppe',
  'Medlem fornavn',
  'Medlem etternavn',
  'Medlems-e-post',
  'Medlem mobil',
  ...[1, 2, 3, 4].flatMap((n) => [
    `Foresatt ${n} fornavn`,
    `Foresatt ${n} etternavn`,
    `Foresatt ${n} e-post`,
    `Foresatt ${n} telefonnummer`,
  ]),
  'Innmeldingsdato',
  'Fødselsdato',
  'Kjønn',
  'Nasjonalitet',
]

// The KlubbAdmin export's columns, in order. Every cell is text-formatted (`@`).
export const KLUBBADMIN_COLUMNS = [
  'PersonId',
  'Fornavn',
  'Etternavn',
  'Fødselsdato',
  'Kjønn',
  'Adresse',
  'Postnr',
  'Postadresse',
  'E-post',
  'Tlf. privat',
  'Tlf. mobil',
  'Tlf. arbeid',
  'Medlem fra dato',
  'Grupper/grener',
  'Medlemsdetaljer',
] as const

type Format = '@' | undefined

function cell(value: CellValue, format: Format) {
  if (value === undefined) return null
  if (value instanceof Date) return { value, type: Date, format: 'dd.mm.yyyy' }
  if (typeof value === 'number') return { value, type: Number, format }
  return { value, type: String, format }
}

/** One header row, then one row per entry; columns missing from an entry are left empty. */
export function xlsxFile(columns: readonly string[], rows: Record<string, CellValue>[], format?: Format): Promise<Blob> {
  const header = columns.map((column) => ({ value: column, type: String, format }))
  return writeXlsxFile([header, ...rows.map((row) => columns.map((column) => cell(row[column], format)))]).toBlob()
}

export const spondClubFile = (rows: Record<string, CellValue>[], columns: readonly string[] = SPOND_CLUB_COLUMNS) =>
  xlsxFile(columns, rows)

export const klubbAdminFile = (rows: Record<string, CellValue>[], columns: readonly string[] = KLUBBADMIN_COLUMNS) =>
  xlsxFile(columns, rows, '@')
