import { expect, test } from '../../fixtures/app.fixture'

test.describe('Stage & Funding modal', () => {
  test('opens with both cards and required fields', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Stage & Funding', exact: true }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Stage & Funding', exact: true })).toBeVisible()

    await expect(dialog.getByRole('textbox', { name: 'Stage investors', exact: true })).toBeVisible()
    await expect(
      dialog.getByRole('textbox', { name: 'Stage exclude investors', exact: true })
    ).toBeVisible()
    await expect(
      dialog.getByRole('textbox', { name: 'Stage latest round', exact: true })
    ).toBeVisible()
    await expect(
      dialog.getByRole('textbox', { name: 'Stage exclude latest round', exact: true })
    ).toBeVisible()
    await expect(
      dialog.getByRole('textbox', { name: 'Stage raised in or after year', exact: true })
    ).toBeVisible()
    await expect(
      dialog.getByRole('textbox', { name: 'Stage latest round amount raised', exact: true })
    ).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Apply', exact: true })).toBeVisible()
  })

  test('apply persists stage values and highlights chip', async ({ page }) => {
    await page.goto('/')
    const chip = page.getByRole('button', { name: 'Stage & Funding', exact: true })

    await chip.click()
    let dialog = page.getByRole('dialog')
    await dialog.getByRole('textbox', { name: 'Stage investors', exact: true }).fill('Sequoia')
    await dialog.getByRole('textbox', { name: 'Stage latest round', exact: true }).fill('Series A')
    await dialog
      .getByRole('textbox', { name: 'Stage raised in or after year', exact: true })
      .fill('2023')
    await dialog
      .getByRole('textbox', { name: 'Stage latest round amount raised', exact: true })
      .fill('25000000')
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()

    await expect(dialog).not.toBeVisible()
    await expect(chip).toHaveClass(/border-amber-500/)
    await expect(chip).toHaveClass(/bg-amber-50/)

    await chip.click()
    dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('textbox', { name: 'Stage investors', exact: true })).toHaveValue(
      'Sequoia'
    )
    await expect(
      dialog.getByRole('textbox', { name: 'Stage latest round', exact: true })
    ).toHaveValue('Series A')
    await expect(
      dialog.getByRole('textbox', { name: 'Stage raised in or after year', exact: true })
    ).toHaveValue('2023')
    await expect(
      dialog.getByRole('textbox', { name: 'Stage latest round amount raised', exact: true })
    ).toHaveValue('25000000')
  })
})
