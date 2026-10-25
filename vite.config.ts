/// <reference types="vitest/config" />
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import sri from 'vite-plugin-sri-gen'
import { cspMetaTag } from './build/csp-plugin.ts'

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
    cspMetaTag(),
    // Inline import maps and the dynamic-tag runtime would need 'unsafe-inline'; the app has no lazy chunks.
    sri({ importMapIntegrity: false, runtimePatchDynamicLinks: false, preloadDynamicChunks: false }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
})
