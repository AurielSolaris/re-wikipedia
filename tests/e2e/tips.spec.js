import { test, expect, press, softkeys, t } from './support/test.js'

const items = page => page.locator('.tips .item')
const tips = [
  { item: 'tips-read', header: 'tip-read-header', message: 'tip-read-message', media: 'tip-read-animation.gif' },
  { item: 'tips-search', header: 'tip-search-header', message: 'tip-search-message', media: 'tip-search-animation.gif' },
  { item: 'tips-switch', header: 'tip-switch-header', message: 'tip-switch-message', media: 'tip-switch-animation.gif' },
  { item: 'tips-about', header: 'tip-about-header', message: 'tip-about-message', media: 'onboarding-0.png' }
]

test.describe('tips', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./#/tips')
    await expect(items(page).nth(0)).toHaveAttribute('nav-selected', 'true')
  })

  test('lists every tip, with the first one selected', async ({ page }) => {
    await expect(items(page).locator('.title')).toHaveText(tips.map(tip => t(tip.item)))
    await expect(items(page).nth(0)).toHaveAttribute('nav-selected', 'true')
  })

  for (const tip of tips) {
    test(`shows "${t(tip.header)}"`, async ({ page }) => {
      await items(page).filter({ hasText: t(tip.item) }).click()
      await expect(page.locator('.tip-header')).toHaveText(t(tip.header))
      await expect(page.locator('.tip-text')).toHaveText(t(tip.message))
      await expect(page.locator('.tip-media > div')).toHaveAttribute('style', new RegExp(tip.media.replace('.', '\\.')))
    })
  }

  test('Next walks through all the tips and Back closes them', async ({ page }) => {
    await press(page, 'Enter')
    for (const tip of tips) {
      await expect(page.locator('.tip-header')).toHaveText(t(tip.header))
      if (tip !== tips[tips.length - 1]) {
        await expect(softkeys(page).right).toHaveText(t('softkey-next'))
        await softkeys(page).right.click()
      }
    }
    await expect(softkeys(page).right).toHaveText('')

    await softkeys(page).left.click()
    await expect(page.locator('.tip-header')).toHaveCount(0)
    await expect(items(page).nth(0)).toHaveAttribute('nav-selected', 'true')
  })
})
