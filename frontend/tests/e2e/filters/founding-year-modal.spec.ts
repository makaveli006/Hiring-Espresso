import { test, expect } from '../../fixtures/app.fixture'

test.describe('Founding Year modal', () => {
  test('opens with title, range inputs, and apply button', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Founding Year', exact: true }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Founding Year', exact: true })).toBeVisible()
    await expect(dialog.getByText('Enter Founding Year Range', { exact: true })).toBeVisible()
    await expect(dialog.getByTestId('founding-year-min-input')).toBeVisible()
    await expect(dialog.getByTestId('founding-year-max-input')).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Apply', exact: true })).toBeVisible()
  })

  test('applies valid min and max years, persists on reopen, and marks chip active', async ({
    page,
  }) => {
    await page.goto('/')
    const foundingChip = page.getByRole('button', { name: 'Founding Year', exact: true })
    await foundingChip.click()

    let dialog = page.getByRole('dialog')
    await dialog.getByTestId('founding-year-min-input').fill('1995')
    await dialog.getByTestId('founding-year-max-input').fill('2010')
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()
    await expect(dialog).not.toBeVisible()

    await expect(foundingChip).toHaveClass(/border-amber-500/)
    await expect(foundingChip).toHaveClass(/bg-amber-50/)

    await foundingChip.click()
    dialog = page.getByRole('dialog')
    await expect(dialog.getByTestId('founding-year-min-input')).toHaveValue('1995')
    await expect(dialog.getByTestId('founding-year-max-input')).toHaveValue('2010')
  })

  test('supports Present max (blank max input) and persists open-ended range', async ({ page }) => {
    await page.goto('/')
    const foundingChip = page.getByRole('button', { name: 'Founding Year', exact: true })
    await foundingChip.click()

    let dialog = page.getByRole('dialog')
    await dialog.getByTestId('founding-year-min-input').fill('2001')
    await dialog.getByTestId('founding-year-max-input').fill('')
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()
    await expect(dialog).not.toBeVisible()

    await expect(foundingChip).toHaveClass(/border-amber-500/)

    await foundingChip.click()
    dialog = page.getByRole('dialog')
    await expect(dialog.getByTestId('founding-year-min-input')).toHaveValue('2001')
    await expect(dialog.getByTestId('founding-year-max-input')).toHaveValue('')
  })

  test('disables apply for invalid years and reversed ranges', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Founding Year', exact: true }).click()

    const dialog = page.getByRole('dialog')
    const applyButton = dialog.getByRole('button', { name: 'Apply', exact: true })

    await dialog.getByTestId('founding-year-min-input').fill('3020')
    await expect(applyButton).toBeDisabled()

    await dialog.getByTestId('founding-year-min-input').fill('2015')
    await dialog.getByTestId('founding-year-max-input').fill('2010')
    await expect(applyButton).toBeDisabled()
  })
})
