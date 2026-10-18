import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.mjs'

// Unit tests reuse the app's Vite config (path aliases, `define` globals, the
// Preact JSX transform), so modules are imported exactly as the app does.
// ReScript sources must be compiled first (`bun run test` does that).
export default mergeConfig(viteConfig, defineConfig({
  test: {
    include: ['tests/unit/**/*.test.js'],
    environment: 'jsdom',
    setupFiles: ['tests/unit/setup.js'],
    restoreMocks: true,
    unstubGlobals: true
  }
}))
