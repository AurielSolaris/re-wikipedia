import { defineConfig, devices } from '@playwright/test'

// End-to-end tests run against the production build (the same files Vercel
// serves), with every Wikipedia request answered from tests/e2e/support.
const PORT = 4173
const CI = !!process.env.CI

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  reporter: CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: `http://127.0.0.1:${PORT}/`,
    locale: 'en-US',
    trace: 'retain-on-failure',
    // page.route() cannot see requests a service worker makes, so it is off
    // except in the offline tests, which opt back in.
    serviceWorkers: 'block'
  },
  projects: [
    {
      // The KaiOS phone screen.
      name: 'kaios',
      use: { ...devices['Desktop Chrome'], viewport: { width: 240, height: 320 } }
    },
    {
      // The desktop web layout (card grid, wide article column).
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } }
    }
  ],
  webServer: {
    command: `bun run build:ci && bunx vite preview --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: !CI,
    timeout: 300_000
  }
})
