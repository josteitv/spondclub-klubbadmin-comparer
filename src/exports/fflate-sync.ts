// read-excel-file unzips with fflate's async unzip(), which inflates entries over 512 KiB in a
// blob: worker; the page's worker-src 'none' blocks that and the read never finishes.
// build/sync-unzip-plugin.ts points read-excel-file's `fflate` import here instead.
import { unzipSync, type FlateError, type Unzipped } from 'fflate'

export * from 'fflate'

/** fflate's unzip() callback API, done synchronously on the main thread. */
export function unzip(data: Uint8Array, callback: (error: FlateError | null, files: Unzipped) => void): void {
  let files: Unzipped
  try {
    files = unzipSync(data)
  } catch (error) {
    callback(error as FlateError, {})
    return
  }
  callback(null, files)
}
