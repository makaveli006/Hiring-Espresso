import { expect, test } from '../../fixtures/app.fixture'

const SHIFT_ROWS = [
  'Morning / Day / First Shift',
  'Afternoon / Evening / Second Shift',
  'Overnight / Graveyard / Third Shift',
] as const

const SHIFT_OPTIONS = ['Required', 'Optional', 'Not Indicated'] as const

test.describe('Shifts & Schedules modal', () => {
  test('opens with title, three rows, and apply button', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Shifts & Schedules', exact: true }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Shifts & Schedules', exact: true })).toBeVisible()

    for (const row of SHIFT_ROWS) {
      await expect(dialog.getByText(row, { exact: true })).toBeVisible()
      for (const option of SHIFT_OPTIONS) {
        await expect(dialog.getByRole('button', { name: `${row} ${option}`, exact: true })).toBeVisible()
      }
    }
    await expect(dialog.getByText('Weekend Availability', { exact: true })).toBeVisible()
    await expect(dialog.getByText('Holiday Availability', { exact: true })).toBeVisible()
    await expect(dialog.getByText('Overtime Availability', { exact: true })).toBeVisible()
    await expect(dialog.getByText('Oncall Requirements', { exact: true })).toBeVisible()
    await expect(
      dialog.getByRole('button', { name: 'Weekend Availability Required', exact: true })
    ).toBeVisible()
    await expect(
      dialog.getByRole('button', { name: "Weekend Availability Doesn't Matter", exact: true })
    ).toHaveAttribute('aria-pressed', 'true')
    await expect(
      dialog.getByRole('button', { name: "Holiday Availability Doesn't Matter", exact: true })
    ).toHaveAttribute('aria-pressed', 'true')
    await expect(
      dialog.getByRole('button', { name: "Overtime Availability Doesn't Matter", exact: true })
    ).toHaveAttribute('aria-pressed', 'true')
    await expect(
      dialog.getByRole('checkbox', { name: 'None', exact: true })
    ).toHaveAttribute('aria-checked', 'true')
    await expect(
      dialog.getByRole('checkbox', {
        name: 'Occasional (once a month or less)',
        exact: true,
      })
    ).toHaveAttribute('aria-checked', 'true')
    await expect(
      dialog.getByRole('checkbox', {
        name: 'Regular (once a week or more)',
        exact: true,
      })
    ).toHaveAttribute('aria-checked', 'true')

    await expect(dialog.getByRole('button', { name: 'Apply', exact: true })).toBeVisible()
  })

  test('single-select per row and toggle-off on second click', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Shifts & Schedules', exact: true }).click()

    const dialog = page.getByRole('dialog')
    const morningRequired = dialog.getByRole('button', {
      name: 'Morning / Day / First Shift Required',
      exact: true,
    })
    const morningOptional = dialog.getByRole('button', {
      name: 'Morning / Day / First Shift Optional',
      exact: true,
    })

    await morningRequired.click()
    await expect(morningRequired).toHaveAttribute('aria-pressed', 'true')

    await morningOptional.click()
    await expect(morningOptional).toHaveAttribute('aria-pressed', 'true')
    await expect(morningRequired).toHaveAttribute('aria-pressed', 'false')

    await morningOptional.click()
    await expect(morningOptional).toHaveAttribute('aria-pressed', 'false')
  })

  test('apply persists and chip highlights', async ({ page }) => {
    await page.goto('/')
    const chip = page.getByRole('button', { name: 'Shifts & Schedules', exact: true })

    await chip.click()
    let dialog = page.getByRole('dialog')
    await dialog
      .getByRole('button', { name: 'Morning / Day / First Shift Required', exact: true })
      .click()
    await dialog
      .getByRole('button', { name: 'Overnight / Graveyard / Third Shift Optional', exact: true })
      .click()
    await dialog.getByRole('button', { name: 'Weekend Availability Required', exact: true }).click()
    await dialog
      .getByRole('button', { name: 'Holiday Availability Not Indicated', exact: true })
      .click()
    await dialog.getByRole('button', { name: 'Overtime Availability Required', exact: true }).click()
    await dialog
      .getByRole('checkbox', { name: 'None', exact: true })
      .click()
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()

    await expect(dialog).not.toBeVisible()
    await expect(chip).toHaveClass(/text-primary/)
    await expect(chip).toHaveClass(/border-primary/)

    await chip.click()
    dialog = page.getByRole('dialog')
    await expect(
      dialog.getByRole('button', { name: 'Morning / Day / First Shift Required', exact: true })
    ).toHaveAttribute('aria-pressed', 'true')
    await expect(
      dialog.getByRole('button', { name: 'Overnight / Graveyard / Third Shift Optional', exact: true })
    ).toHaveAttribute('aria-pressed', 'true')
    await expect(
      dialog.getByRole('button', { name: 'Weekend Availability Required', exact: true })
    ).toHaveAttribute('aria-pressed', 'true')
    await expect(
      dialog.getByRole('button', { name: 'Holiday Availability Not Indicated', exact: true })
    ).toHaveAttribute('aria-pressed', 'true')
    await expect(
      dialog.getByRole('button', { name: 'Overtime Availability Required', exact: true })
    ).toHaveAttribute('aria-pressed', 'true')
    await expect(
      dialog.getByRole('checkbox', { name: 'None', exact: true })
    ).toHaveAttribute('aria-checked', 'false')
  })

  test("doesn't matter clears strict availability filters", async ({ page }) => {
    await page.goto('/')
    const chip = page.getByRole('button', { name: 'Shifts & Schedules', exact: true })

    await chip.click()
    let dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Weekend Availability Required', exact: true }).click()
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()
    await expect(chip).toHaveClass(/text-primary/)

    await chip.click()
    dialog = page.getByRole('dialog')
    await dialog
      .getByRole('button', { name: "Weekend Availability Doesn't Matter", exact: true })
      .click()
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()

    await chip.click()
    dialog = page.getByRole('dialog')
    await expect(
      dialog.getByRole('button', { name: "Weekend Availability Doesn't Matter", exact: true })
    ).toHaveAttribute('aria-pressed', 'true')
  })
})
