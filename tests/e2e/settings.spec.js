import { test, expect, press, softkeys, t, phoneOnly } from './support/test.js'

const items = page => page.locator('.settings .item')
const titles = [
  'settings-saved', 'settings-language', 'settings-theme', 'settings-touch-support',
  'settings-help-feedback', 'settings-about-wikipedia', 'settings-about-app', 'settings-privacy-terms'
]

test.describe('settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./#/settings')
    await expect(items(page).nth(0)).toHaveAttribute('nav-selected', 'true')
  })

  test('lists every setting, with the first one selected', async ({ page }) => {
    await expect(items(page).locator('.title')).toHaveText(titles.map(key => t(key)))
    await expect(items(page).nth(0)).toHaveAttribute('nav-selected', 'true')
    await expect(items(page).nth(1)).toHaveAttribute('nav-selected', 'false')
  })

  test('the down arrow moves the selection', async ({ page }, testInfo) => {
    phoneOnly(testInfo)
    await press(page, 'ArrowDown')
    await expect(items(page).nth(0)).toHaveAttribute('nav-selected', 'false')
    await expect(items(page).nth(1)).toHaveAttribute('nav-selected', 'true')
  })

  test('the theme setting cycles System, Light and Dark', async ({ page }) => {
    const theme = items(page).filter({ hasText: t('settings-theme') })
    const html = page.locator('html')

    await expect(theme.locator('.description')).toHaveText(t('theme-auto'))
    await expect(html).not.toHaveAttribute('data-theme')

    await theme.click()
    await expect(theme.locator('.description')).toHaveText(t('theme-light'))
    await expect(html).toHaveAttribute('data-theme', 'light')

    await theme.click()
    await expect(theme.locator('.description')).toHaveText(t('theme-dark'))
    await expect(html).toHaveAttribute('data-theme', 'dark')

    // The choice survives a reload.
    await page.reload()
    await expect(html).toHaveAttribute('data-theme', 'dark')
  })

  test('about the app', async ({ page }) => {
    await items(page).filter({ hasText: t('settings-about-app') }).click()
    await expect(page.locator('.popup')).toContainText(t('about-header'))
    await expect(page.locator('.popup')).toContainText(t('about-app-message'))
    await softkeys(page).left.click()
    await expect(page.locator('.popup')).toHaveCount(0)
  })

  test('Close goes back to search', async ({ page }) => {
    await page.goto('./')
    await expect(page.locator('.search input[type=text]')).toBeVisible()
    await expect(softkeys(page).right).toHaveText(t('softkey-settings'))
    await softkeys(page).right.click()
    await expect(page).toHaveURL(/#\/settings$/)
    await expect(softkeys(page).left).toHaveText(t('softkey-close'))
    await softkeys(page).left.click()
    await expect(page.locator('.search input[type=text]')).toBeVisible()
  })
})
