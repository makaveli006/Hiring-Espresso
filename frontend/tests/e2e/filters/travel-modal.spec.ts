import { expect, test } from '../../fixtures/app.fixture'

const TRAVEL_LEVELS = ['None', 'Minimal', 'Moderate', 'Extensive'] as const

test.describe('Travel Requirement modal', () => {
  test('opens with both travel sections and all options', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Travel Requirement', exact: true }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Travel Requirement', exact: true })).toBeVisible()
    await expect(dialog.getByText('Air Travel Requirement', { exact: true })).toBeVisible()
    await expect(dialog.getByText('Land Travel Requirement', { exact: true })).toBeVisible()

    for (const option of TRAVEL_LEVELS) {
      await expect(dialog.getByRole('checkbox', { name: option, exact: true }).first()).toBeVisible()
    }
    await expect(dialog.getByRole('button', { name: 'Apply', exact: true })).toBeVisible()
  })

  test('last Extensive option is visible and interactable above footer', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Travel Requirement', exact: true }).click()

    const dialog = page.getByRole('dialog')
    const landSection = dialog.locator('section').nth(1)
    const landExtensive = landSection.getByRole('checkbox', { name: 'Extensive', exact: true })

    await landExtensive.scrollIntoViewIfNeeded()
    await expect(landExtensive).toBeVisible()
    await landExtensive.click()
    await expect(landExtensive).toHaveAttribute('aria-checked', 'true')
  })

  test('apply persists travel selections and highlights chip', async ({ page }) => {
    await page.goto('/')
    const chip = page.getByRole('button', { name: 'Travel Requirement', exact: true })

    await chip.click()
    let dialog = page.getByRole('dialog')
    await dialog.locator('section').first().getByRole('checkbox', { name: 'Minimal', exact: true }).click()
    await dialog.locator('section').nth(1).getByRole('checkbox', { name: 'Moderate', exact: true }).click()
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()

    await expect(dialog).not.toBeVisible()
    await expect(chip).toHaveClass(/text-primary/)
    await expect(chip).toHaveClass(/border-primary/)

    await chip.click()
    dialog = page.getByRole('dialog')
    await expect(
      dialog.locator('section').first().getByRole('checkbox', { name: 'Minimal', exact: true })
    ).toHaveAttribute('aria-checked', 'true')
    await expect(
      dialog.locator('section').nth(1).getByRole('checkbox', { name: 'Moderate', exact: true })
    ).toHaveAttribute('aria-checked', 'true')
  })
})
