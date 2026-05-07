import { expect, test } from '../../fixtures/app.fixture'

const SECURITY_CLEARANCE_OPTIONS = [
  'No explicit reference to clearance',
  'Confidential',
  'Secret',
  'Top Secret',
  'Top Secret/SCI',
  'Public Trust',
  'Interim Clearances',
  'Other',
] as const

test.describe('Security Clearance modal', () => {
  test('opens with title, options, and apply button', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Security Clearance', exact: true }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Security Clearance', exact: true })).toBeVisible()

    for (const option of SECURITY_CLEARANCE_OPTIONS) {
      await expect(dialog.getByRole('checkbox', { name: option, exact: true })).toBeVisible()
    }

    await expect(dialog.getByRole('button', { name: 'Apply', exact: true })).toBeVisible()
  })

  test('defaults to all selected when no filter is saved', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Security Clearance', exact: true }).click()

    const dialog = page.getByRole('dialog')
    for (const option of SECURITY_CLEARANCE_OPTIONS) {
      await expect(dialog.getByRole('checkbox', { name: option, exact: true })).toHaveAttribute(
        'aria-checked',
        'true'
      )
    }
  })

  test('apply subset persists and highlights chip', async ({ page }) => {
    await page.goto('/')
    const chip = page.getByRole('button', { name: 'Security Clearance', exact: true })

    await chip.click()
    let dialog = page.getByRole('dialog')

    await dialog.getByRole('checkbox', { name: 'No explicit reference to clearance', exact: true }).click()
    await dialog.getByRole('checkbox', { name: 'Public Trust', exact: true }).click()
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()

    await expect(dialog).not.toBeVisible()
    await expect(chip).toHaveClass(/text-primary/)
    await expect(chip).toHaveClass(/border-primary/)

    await chip.click()
    dialog = page.getByRole('dialog')
    await expect(
      dialog.getByRole('checkbox', { name: 'No explicit reference to clearance', exact: true })
    ).toHaveAttribute('aria-checked', 'false')
    await expect(
      dialog.getByRole('checkbox', { name: 'Public Trust', exact: true })
    ).toHaveAttribute('aria-checked', 'false')
  })

  test('re-selecting all clears active chip state', async ({ page }) => {
    await page.goto('/')
    const chip = page.getByRole('button', { name: 'Security Clearance', exact: true })

    await chip.click()
    let dialog = page.getByRole('dialog')

    await dialog.getByRole('checkbox', { name: 'Secret', exact: true }).click()
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()
    await expect(chip).toHaveClass(/text-primary/)

    await chip.click()
    dialog = page.getByRole('dialog')
    await dialog.getByRole('checkbox', { name: 'Secret', exact: true }).click()
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()

    await expect(dialog).not.toBeVisible()
    await expect(chip).not.toHaveClass(/text-primary/)
    await expect(chip).not.toHaveClass(/border-primary/)
  })
})
