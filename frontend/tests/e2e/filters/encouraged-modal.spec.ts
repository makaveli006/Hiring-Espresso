import { expect, test } from '../../fixtures/app.fixture'

test.describe('Encouraged to Apply modal', () => {
  test('opens with title, options, and apply button', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Encouraged to Apply', exact: true }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Encouraged to Apply', exact: true })).toBeVisible()
    await expect(dialog.getByRole('checkbox', { name: 'Military Veterans', exact: true })).toBeVisible()
    await expect(dialog.getByRole('checkbox', { name: 'Fair Chance', exact: true })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Apply', exact: true })).toBeVisible()
  })

  test('checkboxes toggle correctly', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Encouraged to Apply', exact: true }).click()

    const dialog = page.getByRole('dialog')
    const militaryVeterans = dialog.getByRole('checkbox', { name: 'Military Veterans', exact: true })
    const fairChance = dialog.getByRole('checkbox', { name: 'Fair Chance', exact: true })

    await expect(militaryVeterans).toHaveAttribute('aria-checked', 'false')
    await expect(fairChance).toHaveAttribute('aria-checked', 'false')

    await militaryVeterans.click()
    await expect(militaryVeterans).toHaveAttribute('aria-checked', 'true')

    await fairChance.click()
    await expect(fairChance).toHaveAttribute('aria-checked', 'true')
  })

  test('apply persists selection and highlights chip', async ({ page }) => {
    await page.goto('/')
    const chip = page.getByRole('button', { name: 'Encouraged to Apply', exact: true })

    await chip.click()
    let dialog = page.getByRole('dialog')
    await dialog.getByRole('checkbox', { name: 'Military Veterans', exact: true }).click()
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()
    await expect(dialog).not.toBeVisible()
    await expect(chip).toHaveClass(/text-primary/)
    await expect(chip).toHaveClass(/border-primary/)

    await chip.click()
    dialog = page.getByRole('dialog')
    await expect(
      dialog.getByRole('checkbox', { name: 'Military Veterans', exact: true })
    ).toHaveAttribute('aria-checked', 'true')
  })

  test('removes highlight when all selections are cleared and applied', async ({ page }) => {
    await page.goto('/')
    const chip = page.getByRole('button', { name: 'Encouraged to Apply', exact: true })

    await chip.click()
    let dialog = page.getByRole('dialog')
    await dialog.getByRole('checkbox', { name: 'Fair Chance', exact: true }).click()
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()
    await expect(chip).toHaveClass(/text-primary/)

    await chip.click()
    dialog = page.getByRole('dialog')
    const fairChance = dialog.getByRole('checkbox', { name: 'Fair Chance', exact: true })
    await fairChance.click()
    await expect(fairChance).toHaveAttribute('aria-checked', 'false')
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()

    await expect(dialog).not.toBeVisible()
    await expect(chip).not.toHaveClass(/text-primary/)
    await expect(chip).not.toHaveClass(/border-primary/)
  })
})
