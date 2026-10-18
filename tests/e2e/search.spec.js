import { test, expect, press, search, softkeys, t, phoneOnly } from './support/test.js'

const results = page => page.locator('.search .item[data-selectable]')

test.describe('search', () => {
  test('lists results, with a thumbnail when there is one', async ({ page }) => {
    await search(page, 'cattle')

    await expect(results(page)).toHaveCount(2)
    await expect(results(page).nth(0).locator('.title')).toHaveText('Cattle')
    await expect(results(page).nth(0).locator('.img')).toBeVisible()
    await expect(results(page).nth(1).locator('.title')).toHaveText('Dairy cattle')
    await expect(results(page).nth(1).locator('.img')).toHaveCount(0)
  })

  test('says so when nothing matches', async ({ page }) => {
    await search(page, 'adf23cv111111')
    await expect(page.locator('.search .empty')).toHaveText(t('no-result-found'))
  })

  test('opens a result with the keypad and comes back to the results', async ({ page }) => {
    await search(page, 'cattle')
    await expect(results(page)).toHaveCount(2)

    await expect(softkeys(page).center).toHaveText('')
    await press(page, 'ArrowDown')
    await expect(softkeys(page).center).toHaveText(t('centerkey-select'))
    await press(page, 'Enter')

    await expect(page).toHaveURL(/#\/article\/en\/Cattle$/)
    await expect(page.locator('.article .title').first()).toHaveText('Cattle')

    await softkeys(page).left.click()
    await expect(results(page)).toHaveCount(2)
    await expect(page.locator('.search input[type=text]')).toHaveValue('cattle')
  })

  test('arrow keys move between the input and the results', async ({ page }, testInfo) => {
    phoneOnly(testInfo)
    await search(page, 'cattle')
    await expect(results(page)).toHaveCount(2)

    await press(page, 'ArrowDown')
    await expect(results(page).nth(0)).toHaveAttribute('nav-selected', 'true')
    await press(page, 'ArrowDown')
    await expect(results(page).nth(1)).toHaveAttribute('nav-selected', 'true')
    await press(page, 'ArrowUp', 2)
    await expect(page.locator('.search input[type=text]')).toHaveAttribute('nav-selected', 'true')
    await expect(softkeys(page).center).toHaveText('')
  })

  test('Backspace on a result clears the search', async ({ page }) => {
    await search(page, 'cattle')
    await expect(results(page)).toHaveCount(2)
    await press(page, 'ArrowDown')
    await press(page, 'Backspace')

    await expect(page.locator('.search .listview')).toHaveCount(0)
    await expect(page.locator('.search input[type=text]')).toHaveValue('')
  })

  test('the End call key clears the search too', async ({ page }) => {
    await search(page, 'cattle')
    await expect(results(page)).toHaveCount(2)
    await press(page, 'ArrowDown')
    await press(page, 'EndCall')

    await expect(page.locator('.search .listview')).toHaveCount(0)
  })

  test('softkeys open tips and settings', async ({ page }) => {
    await page.goto('./')
    await expect(softkeys(page).left).toHaveText(t('softkey-tips'))
    await softkeys(page).left.click()
    await expect(page).toHaveURL(/#\/tips$/)

    await page.goBack()
    await expect(softkeys(page).right).toHaveText(t('softkey-settings'))
    await softkeys(page).right.click()
    await expect(page).toHaveURL(/#\/settings$/)
  })
})
