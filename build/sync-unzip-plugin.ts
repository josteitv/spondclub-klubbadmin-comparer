import { fileURLToPath } from 'node:url'
import type { Plugin } from 'vite'

const SYNC_FFLATE = fileURLToPath(new URL('../src/exports/fflate-sync.ts', import.meta.url))

// Gives read-excel-file our synchronous fflate unzip (src/exports/fflate-sync.ts), so it never
// starts a worker. Only imports from inside read-excel-file are redirected.
export function syncUnzipForReadExcelFile(): Plugin {
  return {
    name: 'sync-unzip-for-read-excel-file',
    enforce: 'pre',
    resolveId(source, importer) {
      if (source === 'fflate' && importer?.includes('/node_modules/read-excel-file/')) return SYNC_FFLATE
      return null
    },
  }
}
