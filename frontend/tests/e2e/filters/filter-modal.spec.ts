import { test, expect } from '../../fixtures/app.fixture'
import { WORKPLACE_TYPES } from '../../utils/test-data'

test.describe('Filter modal (Locations & Environments)', () => {
  test('opens when LocationPill is clicked', async ({ page }) => {
    await page.goto('/')
    const locationPill = page.locator('header button').filter({ hasText: 'India' })
    await locationPill.click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Locations & Environments' })).toBeVisible()
  })

  test('shows location search input', async ({ filterModalPage, page }) => {
    const locationPill = page.locator('header button').filter({ hasText: 'India' })
    await locationPill.click()
    await expect(filterModalPage.locationSearchInput).toBeVisible()
  })

  test('shows all workplace type checkboxes', async ({ filterModalPage, page }) => {
    const locationPill = page.locator('header button').filter({ hasText: 'India' })
    await locationPill.click()

    for (const type of WORKPLACE_TYPES) {
      const label = page.getByRole('dialog').getByText(type, { exact: true })
      await expect(label).toBeVisible()
    }
  })

  test('toggling Remote checkbox updates selection', async ({ filterModalPage, page }) => {
    const locationPill = page.locator('header button').filter({ hasText: 'India' })
    await locationPill.click()

    const dialog = page.getByRole('dialog')
    const remoteLabel = dialog.locator('label').filter({ hasText: /^Remote$/ })
    const remoteCheckbox = remoteLabel.locator('[role="checkbox"]')

    await expect(remoteCheckbox).not.toHaveAttribute('data-checked')
    await remoteLabel.click()
    await expect(remoteCheckbox).toHaveAttribute('data-checked')
  })

  test('Apply button closes the modal', async ({ filterModalPage, page }) => {
    const locationPill = page.locator('header button').filter({ hasText: 'India' })
    await locationPill.click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await filterModalPage.applyButton.click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('modal can be closed with Escape key', async ({ page }) => {
    await page.goto('/')
    const locationPill = page.locator('header button').filter({ hasText: 'India' })
    await locationPill.click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('selected workplace type appears as badge in filter bar', async ({ page }) => {
    await page.goto('/')
    const locationPill = page.locator('header button').filter({ hasText: 'India' })
    await locationPill.click()

    const dialog = page.getByRole('dialog')
    const remoteLabel = dialog.locator('label').filter({ hasText: /^Remote$/ })
    await remoteLabel.click()
    await page.getByRole('button', { name: 'Apply' }).click()

    await expect(page.locator('span').filter({ hasText: /^remote$/ })).toBeVisible()
  })

  test('location search input accepts text', async ({ page }) => {
    await page.goto('/')
    const locationPill = page.locator('header button').filter({ hasText: 'India' })
    await locationPill.click()

    const locationInput = page.getByPlaceholder(
      'Search cities, states, countries, or continents'
    )
    await locationInput.fill('Mumbai')
    await expect(locationInput).toHaveValue('Mumbai')
  })
})
