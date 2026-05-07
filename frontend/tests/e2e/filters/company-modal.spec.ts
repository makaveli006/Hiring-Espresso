import { expect, test } from '../../fixtures/app.fixture'

test.describe('Company modal', () => {
  test('opens with both cards and all fields', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Company', exact: true }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Company', exact: true })).toBeVisible()
    await expect(dialog.getByRole('textbox', { name: 'Company names', exact: true })).toBeVisible()
    await expect(
      dialog.getByRole('textbox', { name: 'Exclude company names', exact: true })
    ).toBeVisible()
    await expect(
      dialog.getByRole('textbox', { name: 'Company HQ countries', exact: true })
    ).toBeVisible()
    await expect(dialog.getByRole('textbox', { name: 'Exclude HQ countries', exact: true })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Apply', exact: true })).toBeVisible()
  })

  test('only one dropdown no-options panel is visible at a time', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Company', exact: true }).click()

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

    await ensureOnePanelVisible('Company Name dropdown')
    await ensureOnePanelVisible('Company HQ Country dropdown')
  })

  test('apply persists values and highlights company chip', async ({ page }) => {
    await page.goto('/')
    const chip = page.getByRole('button', { name: 'Company', exact: true })

    await chip.click()
    let dialog = page.getByRole('dialog')
    await dialog.getByRole('textbox', { name: 'Company names', exact: true }).fill('OpenAI')
    await dialog.getByRole('textbox', { name: 'Company HQ countries', exact: true }).fill('United States')
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()

    await expect(dialog).not.toBeVisible()
    await expect(chip).toHaveClass(/border-amber-500/)
    await expect(chip).toHaveClass(/bg-amber-50/)

    await chip.click()
    dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('textbox', { name: 'Company names', exact: true })).toHaveValue(
      'OpenAI'
    )
    await expect(
      dialog.getByRole('textbox', { name: 'Company HQ countries', exact: true })
    ).toHaveValue('United States')
  })
})
