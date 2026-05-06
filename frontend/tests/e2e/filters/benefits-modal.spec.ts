import { expect, test } from '../../fixtures/app.fixture'

const BENEFITS_OPTIONS = [
  'Generous Paid Time Off',
  '401k Matching',
  'Retirement Plan',
  'Visa Sponsorship',
  'Four Day Work Week',
  'Generous Parental Leave',
  'Tuition Reimbursement',
  'Relocation Assistance',
] as const

test.describe('Benefits & Perks modal', () => {
  test('opens with title, all options, and apply button', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Benefits & Perks', exact: true }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Benefits & Perks', exact: true })).toBeVisible()
    for (const option of BENEFITS_OPTIONS) {
      await expect(dialog.getByRole('checkbox', { name: option, exact: true })).toBeVisible()
    }
    await expect(dialog.getByRole('button', { name: 'Apply', exact: true })).toBeVisible()
  })

  test('checkboxes support independent multi-select', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Benefits & Perks', exact: true }).click()

    const dialog = page.getByRole('dialog')
    const first = dialog.getByRole('checkbox', { name: 'Generous Paid Time Off', exact: true })
    const second = dialog.getByRole('checkbox', { name: '401k Matching', exact: true })

    await expect(first).toHaveAttribute('aria-checked', 'false')
    await expect(second).toHaveAttribute('aria-checked', 'false')

    await first.click()
    await second.click()

    await expect(first).toHaveAttribute('aria-checked', 'true')
    await expect(second).toHaveAttribute('aria-checked', 'true')
  })

  test('apply persists selection and keeps chip highlighted', async ({ page }) => {
    await page.goto('/')
    const chip = page.getByRole('button', { name: 'Benefits & Perks', exact: true })

    await chip.click()
    let dialog = page.getByRole('dialog')
    await dialog.getByRole('checkbox', { name: 'Retirement Plan', exact: true }).click()
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()
    await expect(dialog).not.toBeVisible()
    await expect(chip).toHaveClass(/text-primary/)
    await expect(chip).toHaveClass(/border-primary/)

    await chip.click()
    dialog = page.getByRole('dialog')
    await expect(
      dialog.getByRole('checkbox', { name: 'Retirement Plan', exact: true })
    ).toHaveAttribute('aria-checked', 'true')
  })
})
