import { test, expect, openArticle, press, softkeys, t } from './support/test.js'

test.describe('article', () => {
  test('shows the title, description, lead image and body', async ({ page }) => {
    await openArticle(page, 'Cattle')

    await expect(page.locator('.article .title').first()).toHaveText('Cattle')
    await expect(page.locator('.article .desc').first()).toHaveText('Large domesticated bovines')
    await expect(page.locator('.article-hero')).toHaveAttribute('src', /Cow_female_black_white\.jpg/)
    await expect(page.locator('.article-content').first()).toContainText('domesticated, bovid ungulates')
    // Lazy-load placeholders become real thumbnails at a standard width.
    await expect(page.locator('.article-content figure img').first())
      .toHaveAttribute('src', /\/500px-Cow_female_black_white\.jpg$/)

    await expect(softkeys(page).left).toHaveText(t('softkey-close'))
    await expect(softkeys(page).right).toHaveText(t('softkey-menu'))
  })

  test('Contents lists the sections and jumps to one', async ({ page }) => {
    await openArticle(page, 'Cattle')
    await page.locator('.article-actions-button[data-action=sections]').click()

    const toc = page.locator('.toc .item')
    await expect(toc.locator('.title')).toHaveText(['Cattle', 'Etymology', 'History', 'References', t('toc-footer')])

    await toc.filter({ hasText: 'History' }).click()
    await expect(page.locator('.toc')).toHaveCount(0)
    await expect(page.locator('.article .title', { hasText: 'History' })).toBeInViewport()
  })

  test('a reference opens in a popup', async ({ page }) => {
    await openArticle(page, 'Cattle')
    await page.locator('sup.reference a').first().click()

    await expect(page.locator('.reference-preview .ref-title')).toHaveText(t('reference-title', 1))
    await expect(page.locator('.reference-preview .ref-content')).toHaveText('Cattle reference text.')
    await softkeys(page).left.click()
    await expect(page.locator('.reference-preview')).toHaveCount(0)
  })

  test('a link shows a preview, Read opens it and Backspace comes back', async ({ page }) => {
    await openArticle(page, 'Cattle')
    await page.locator('.article-content a[title="Dairy cattle"]').click()

    await expect(page.locator('.article-preview .preview-title')).toHaveText('Dairy cattle')
    await expect(page.locator('.article-preview .preview-text')).toHaveText('Cattle bred for milk.')
    await expect(softkeys(page).center).toHaveText(t('softkey-read'))
    await softkeys(page).center.click()

    await expect(page).toHaveURL(/#\/article\/en\/Dairy_cattle$/)
    await expect(page.locator('.article .title').first()).toHaveText('Dairy cattle')

    // Backspace walks back through the articles read in this session.
    await press(page, 'Backspace')
    await expect(page).toHaveURL(/#\/article\/en\/Cattle$/)
    await expect(page.locator('.article .title').first()).toHaveText('Cattle')
  })

  test('the Options menu', async ({ page }) => {
    await openArticle(page, 'Cattle')
    await press(page, 'SoftRight')

    const menu = page.locator('.menu .item .title')
    await expect(page.locator('.menu .header')).toHaveText(t('header-menu'))
    await expect(menu).toContainText([t('search-placeholder'), t('menu-save'), t('menu-saved-articles'), t('article-action-sections')])

    await press(page, 'SoftLeft')
    await expect(page.locator('.menu')).toHaveCount(0)
  })

  test('an unknown article shows the error screen', async ({ page }) => {
    await page.goto('./#/article/en/No_such_article_here')
    await expect(page.locator('.article-content')).toHaveCount(0)
    await expect(page.locator('.error, .article-error, img[src*="article-error"]').first()).toBeVisible()
  })
})
