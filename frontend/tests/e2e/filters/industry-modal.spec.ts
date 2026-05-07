import { expect, test } from '../../fixtures/app.fixture'

test.describe('Industry modal', () => {
  test('opens with three cards and all six fields', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Industry', exact: true }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Industry', exact: true })).toBeVisible()

    await expect(
      dialog.getByRole('textbox', { name: 'Industry organization type', exact: true })
    ).toBeVisible()
    await expect(
      dialog.getByRole('textbox', { name: 'Industry exclude organization types', exact: true })
    ).toBeVisible()
    await expect(
      dialog.getByRole('textbox', { name: 'Industry company industry', exact: true })
    ).toBeVisible()
    await expect(
      dialog.getByRole('textbox', { name: 'Industry exclude industries', exact: true })
    ).toBeVisible()
    await expect(
      dialog.getByRole('textbox', { name: 'Industry company activities keywords', exact: true })
    ).toBeVisible()
    await expect(
      dialog.getByRole('textbox', {
        name: 'Industry exclude company industries keywords',
        exact: true,
      })
    ).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Apply', exact: true })).toBeVisible()
  })

  test('only one no-options dropdown panel is visible at a time', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Industry', exact: true }).click()

    const dialog = page.getByRole('dialog')
    const noOptions = dialog.getByText('No options')

    const ensureOnePanelVisible = async (buttonName: string) => {
      const button = dialog.getByRole('button', { name: buttonName, exact: true })
      await button.click()
      if ((await noOptions.count()) === 0) {
        await button.click()
      }
      await expect(noOptions).toHaveCount(1)
    }

    await ensureOnePanelVisible('Organization Type dropdown')
    await ensureOnePanelVisible('Company Industry dropdown')
    await ensureOnePanelVisible('Company Activities & Keywords dropdown')
  })

  test('apply persists values and highlights industry chip', async ({ page }) => {
    await page.goto('/')
    const chip = page.getByRole('button', { name: 'Industry', exact: true })

    await chip.click()
    let dialog = page.getByRole('dialog')
    await dialog
      .getByRole('textbox', { name: 'Industry organization type', exact: true })
      .fill('Public Company')
    await dialog
      .getByRole('textbox', { name: 'Industry company industry', exact: true })
      .fill('Technology')
    await dialog
      .getByRole('textbox', { name: 'Industry company activities keywords', exact: true })
      .fill('AI, SaaS')
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()

    await expect(dialog).not.toBeVisible()
    await expect(chip).toHaveClass(/border-amber-500/)
    await expect(chip).toHaveClass(/bg-amber-50/)

    await chip.click()
    dialog = page.getByRole('dialog')
    await expect(
      dialog.getByRole('textbox', { name: 'Industry organization type', exact: true })
    ).toHaveValue('Public Company')
    await expect(
      dialog.getByRole('textbox', { name: 'Industry company industry', exact: true })
    ).toHaveValue('Technology')
    await expect(
      dialog.getByRole('textbox', { name: 'Industry company activities keywords', exact: true })
    ).toHaveValue('AI, SaaS')
  })
})
