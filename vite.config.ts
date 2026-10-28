/// <reference types="vitest/config" />
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { playwright } from '@vitest/browser-playwright'
import sri from 'vite-plugin-sri-gen'
import { cspMetaTag, cspTestFrame } from './build/csp-plugin.ts'
import { syncUnzipForReadExcelFile } from './build/sync-unzip-plugin.ts'

const { version } = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string }

function gitCommit(): string {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
  } catch {
    return 'dev'
  }
}

export default defineConfig({
  // Relative paths: the same build runs on GitHub Pages, our own domain and the future offline version.
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(`${version}+${gitCommit()}`),
  },
  plugins: [
    preact(),
    syncUnzipForReadExcelFile(),
    cspMetaTag(),
    // Inline import maps and the dynamic-tag runtime would need 'unsafe-inline'; the app has no lazy chunks.
    sri({ importMapIntegrity: false, runtimePatchDynamicLinks: false, preloadDynamicChunks: false }),
  ],
  // Pre-bundling would skip the plugin above, so read-excel-file is served as-is; fflate, which
  // src/exports/fflate-sync.ts imports, and preact/hooks are pre-bundled up front so the dev server
  // doesn't reload a CSP test frame halfway.
  optimizeDeps: { exclude: ['read-excel-file'], include: ['fflate', 'preact/hooks'] },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          setupFiles: ['./src/test-setup.ts'],
          exclude: ['**/node_modules/**', '**/*.browser.test.ts'],
        },
      },
      {
        // Real browsers, for what jsdom can't show: CSP enforcement, workers, network.
        extends: true,
        plugins: [cspTestFrame()],
        test: {
          name: 'browser',
          include: ['src/**/*.browser.test.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }, { browser: 'firefox' }],
          },
        },
      },
    ],
  },
})
