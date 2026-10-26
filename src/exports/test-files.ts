// Builds .xlsx files with invented data that mirror the confirmed export structures (ticket 03).
import writeXlsxFile from 'write-excel-file/universal'

type CellValue = string | Date | undefined

// The Spond Club export's columns, in order. Guardian and payment contact columns are trimmed to one set.
export const SPOND_CLUB_COLUMNS = [
  'Medlemstype',
  'Grupper',
  'Undergruppe',
  'Medlem fornavn',
  'Medlem etternavn',
  'Medlems-e-post',
  'Medlem mobil',
  'Foresatt 1 fornavn',
  'Foresatt 1 etternavn',
  'Innmeldingsdato',
  'Fødselsdato',
  'Kjønn',
  'Nasjonalitet',
] as const

function cell(value: CellValue) {
  if (value === undefined) return null
  if (value instanceof Date) return { value, type: Date, format: 'dd.mm.yyyy' }
  return { value, type: String }
}

/** One header row, then one row per entry; columns missing from an entry are left empty. */
export function xlsxFile(columns: readonly string[], rows: Record<string, CellValue>[]): Promise<Blob> {
  const header = columns.map((column) => ({ value: column, type: String }))
  return writeXlsxFile([header, ...rows.map((row) => columns.map((column) => cell(row[column])))]).toBlob()
}

export const spondClubFile = (rows: Record<string, CellValue>[], columns: readonly string[] = SPOND_CLUB_COLUMNS) =>
  xlsxFile(columns, rows)
