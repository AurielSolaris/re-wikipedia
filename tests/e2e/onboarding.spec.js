import { test, expect, softkeys, t } from './support/test.js'

test.describe('first run', () => {
  test.use({ onboarded: false, consented: false })

  test('shows onboarding, then consent, then search', async ({ page }) => {
    await page.goto('./')

    await expect(page).toHaveURL(/#\/onboarding$/)
    await expect(page.locator('.onboarding .image > img')).toHaveAttribute('src', /onboarding-0\.png$/)
    await expect(page.locator('.onboarding .title')).toHaveText(t('onboarding-0-title'))
    await expect(page.locator('.onboarding .description')).toHaveText(t('onboarding-0-description'))

    await expect(softkeys(page).center).toHaveText(t('softkey-get-started'))
    await softkeys(page).center.click()

    await expect(page.locator('.consent')).toBeVisible()
    await expect(softkeys(page).center).toHaveText('Agree')
    await softkeys(page).center.click()

    await expect(page.locator('.consent')).toHaveCount(0)
    await expect(page.locator('.search input[type=text]')).toBeVisible()

    // Both choices are remembered.
    await page.reload()
    await expect(page.locator('.search input[type=text]')).toBeVisible()
    await expect(page.locator('.consent')).toHaveCount(0)
  })
})
