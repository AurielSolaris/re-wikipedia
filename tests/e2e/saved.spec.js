import { test, expect, openArticle, press, softkeys, t } from './support/test.js'

// Loads the app and waits until its service worker controls the page (it
// claims open pages once the app shell is cached).
const waitForServiceWorker = async page => {
  await page.goto('./')
  await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 30_000 })
}

const saveButton = page => page.locator('.article-actions-button[data-action=save]')
const savedItems = page => page.locator('.saved .item')

const saveArticle = async (page, title) => {
  await openArticle(page, title)
  await expect(saveButton(page).locator('label')).toHaveText(t('article-action-save'))
  await saveButton(page).click()
  await expect(saveButton(page).locator('label')).toHaveText(t('article-action-saved'))
  await expect(saveButton(page).locator('img')).toHaveAttribute('src', /icon-saved\.svg$/)
}

test.describe('saved articles', () => {
  test('starts empty', async ({ page }) => {
    await page.goto('./#/saved')
    await expect(page.locator('.saved .header')).toHaveText(t('header-saved'))
    await expect(page.locator('.saved .empty')).toHaveText(t('saved-empty'))
    await expect(softkeys(page).right).toHaveText('')
  })

  test('save, list, read and remove an article', async ({ page }) => {
    await saveArticle(page, 'Cattle')

    // Still saved after a reload (it is in IndexedDB).
    await page.reload()
    await expect(saveButton(page).locator('label')).toHaveText(t('article-action-saved'))

    await page.goto('./#/settings')
    await page.locator('.settings .item', { hasText: t('settings-saved') }).click()
    await expect(page).toHaveURL(/#\/saved$/)
    await expect(savedItems(page)).toHaveCount(1)
    await expect(savedItems(page).locator('.title')).toHaveText('Cattle')
    await expect(savedItems(page).locator('.description')).toHaveText('Large domesticated bovines')

    await expect(softkeys(page).center).toHaveText(t('softkey-read'))
    await press(page, 'Enter')
    await expect(page).toHaveURL(/#\/article\/en\/Cattle$/)
    await page.goBack()

    await expect(softkeys(page).right).toHaveText(t('softkey-remove'))
    await press(page, 'SoftRight')
    await expect(page.locator('.confirm-dialog .header')).toHaveText(t('saved-remove-title'))
    await expect(page.locator('.confirm-dialog .info')).toHaveText(t('saved-remove-message', 'Cattle'))
    await press(page, 'SoftRight')

    await expect(page.locator('.saved .empty')).toHaveText(t('saved-empty'))
  })

  test('the Options menu toggles saving', async ({ page }) => {
    await openArticle(page, 'Cattle')
    await press(page, 'SoftRight')
    await page.locator('.menu .item', { hasText: t('menu-save') }).click()
    await expect(saveButton(page).locator('label')).toHaveText(t('article-action-saved'))

    await press(page, 'SoftRight')
    await page.locator('.menu .item', { hasText: t('menu-unsave') }).click()
    await expect(saveButton(page).locator('label')).toHaveText(t('article-action-save'))
  })

  test('newest first', async ({ page }) => {
    await saveArticle(page, 'Cattle')
    await saveArticle(page, 'Dairy_cattle')
    await page.goto('./#/saved')
    await expect(savedItems(page).locator('.title')).toHaveText(['Dairy cattle', 'Cattle'])
  })
})

test.describe('offline', () => {
  // The service worker is what makes the app open without a network.
  test.use({ serviceWorkers: 'allow' })

  test('a saved article opens with no connection, even after a reload', async ({ page, wiki }) => {
    await waitForServiceWorker(page)
    await saveArticle(page, 'Cattle')

    await wiki.setOffline(true)
    await page.goto('./#/')
    await page.reload()

    const link = page.locator('.saved-link')
    await expect(page.locator('.offline-panel .message')).toHaveText(t('offline-message'))
    await expect(link).toHaveText(t('offline-saved-articles', 1))
    await link.click()

    await expect(savedItems(page).locator('.title')).toHaveText('Cattle')
    await savedItems(page).first().click()
    await expect(page.locator('.article .title').first()).toHaveText('Cattle')
    await expect(page.locator('.article-content').first()).toContainText('domesticated, bovid ungulates')

    // A cold start with no network: the shell comes from the service worker.
    await page.reload()
    await expect(page.locator('.article-content').first()).toContainText('domesticated, bovid ungulates')
  })

  test('an article that was not saved shows the error screen', async ({ page, wiki }) => {
    await waitForServiceWorker(page)
    await wiki.setOffline(true)
    await page.goto('./#/article/en/Dairy_cattle')
    await expect(page.locator('.error')).toBeVisible()
    await expect(page.locator('.article-content')).toHaveCount(0)
  })
})
