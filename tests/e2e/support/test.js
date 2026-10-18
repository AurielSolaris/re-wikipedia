import fs from 'node:fs'
import { test as base, expect } from '@playwright/test'
import { mockWikipedia } from './wiki.js'

// The app's own test helpers: a fake Wikipedia for every test, a way to start
// past onboarding and consent, and the KaiOS keypad.

export const test = base.extend({
  // Set to false to start on the onboarding screen.
  onboarded: [true, { option: true }],
  // Set to false to get the consent popup on the home screen.
  consented: [true, { option: true }],

  // The fake Wikipedia; `wiki.setOffline(true)` cuts the connection.
  wiki: async ({ context }, use) => {
    await use(await mockWikipedia(context))
  },

  page: async ({ page, onboarded, consented, wiki }, use) => {
    await page.addInitScript(({ onboarded, consented }) => {
      try {
        // Only on the first load, so a test can still change these.
        if (sessionStorage.getItem('e2e-seeded')) return
        sessionStorage.setItem('e2e-seeded', '1')
        if (onboarded) localStorage.setItem('has-onboard-before', 'true')
        if (consented) localStorage.setItem('usage-data-consent', JSON.stringify({ timestamp: 0, version: 'e2e' }))
      } catch (e) {
        // about:blank and other pages without storage
      }
    }, { onboarded, consented })

    const errors = []
    page.on('pageerror', error => errors.push(error.message))

    await use(page)

    expect(errors, 'uncaught errors in the page').toEqual([])
    expect(wiki.unhandled, 'Wikimedia requests without a mock').toEqual([])
  }
})

export { expect }

// KaiOS keys that Playwright's keyboard does not know about. The app listens on
// `document`, like the device does.
const KAIOS_KEYS = ['SoftLeft', 'SoftRight', 'EndCall']

export const press = async (page, key, times = 1) => {
  for (let i = 0; i < times; i++) {
    if (KAIOS_KEYS.includes(key)) {
      await page.evaluate(key => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
      }, key)
    } else {
      await page.keyboard.press(key)
    }
  }
}

export const softkeys = page => ({
  left: page.locator('.softkey .left'),
  center: page.locator('.softkey .center'),
  right: page.locator('.softkey .right')
})

export const search = async (page, term) => {
  await page.goto('./')
  await page.locator('.search input[type=text]').fill(term)
}

export const openArticle = async (page, title, lang = 'en') => {
  await page.goto(`./#/article/${lang}/${title}`)
  await expect(page.locator('.article-content')).toBeVisible()
}

// English UI strings, with $1-style parameters and simple {{PLURAL}} forms.
const en = JSON.parse(fs.readFileSync(new URL('../../../i18n/en.json', import.meta.url), 'utf8'))

export const t = (key, ...args) => {
  if (!(key in en)) throw new Error(`Unknown message ${key}`)
  return en[key]
    .replace(/\$(\d)/g, (_, n) => String(args[n - 1]))
    .replace(/\{\{PLURAL:(\d+)\|([^|}]*)\|([^}]*)\}\}/g, (_, n, one, other) => (Number(n) === 1 ? one : other))
}

// Keyboard selection moves by whole rows in the desktop card grid, so tests
// that count arrow presses only run on the phone layout.
export const phoneOnly = testInfo =>
  test.skip(testInfo.project.name !== 'kaios', 'arrow-key counts differ in the desktop grid')
