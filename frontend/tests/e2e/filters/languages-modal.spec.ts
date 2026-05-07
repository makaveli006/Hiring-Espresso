import { expect, test } from '../../fixtures/app.fixture'

test.describe('Languages modal', () => {
  test('opens with card, fields, and apply button', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Languages', exact: true }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Languages', exact: true })).toBeVisible()
    await expect(dialog.getByText('Language Requirements', { exact: true })).toBeVisible()
    await expect(dialog.getByText('Exclude Language Requirements', { exact: true })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Apply', exact: true })).toBeVisible()
    await expect(dialog.getByText('No options')).toHaveCount(0)
  })

  test('only one dropdown panel is open at a time', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Languages', exact: true }).click()

    const dialog = page.getByRole('dialog')
    const firstDropdown = dialog.getByRole('button', {
      name: 'Language Requirements dropdown',
      exact: true,
    })
    const secondDropdown = dialog.getByRole('button', {
      name: 'Exclude Language Requirements dropdown',
      exact: true,
    })

    await firstDropdown.click()
    await expect(dialog.getByText('No options')).toBeVisible()

    await secondDropdown.click()
    await expect(dialog.getByText('No options')).toBeVisible()
    await expect(dialog.getByText('No options')).toHaveCount(1)
  })

  test('dropdown remains closed after reopening modal until explicit click', async ({ page }) => {
    await page.goto('/')
    const chip = page.getByRole('button', { name: 'Languages', exact: true })

    await chip.click()
    let dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Language Requirements dropdown', exact: true }).click()
    await expect(dialog.getByText('No options')).toBeVisible()
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()

    await chip.click()
    dialog = page.getByRole('dialog')
    await expect(dialog.getByText('No options')).toHaveCount(0)
  })

  test('apply persists values and highlights chip', async ({ page }) => {
    await page.goto('/')
    const chip = page.getByRole('button', { name: 'Languages', exact: true })

    await chip.click()
    let dialog = page.getByRole('dialog')
    await dialog.getByRole('textbox', { name: 'Language requirements', exact: true }).fill('English, German')
    await dialog.getByRole('textbox', { name: 'Exclude language requirements', exact: true }).fill('Japanese')
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()

    await expect(dialog).not.toBeVisible()
    await expect(chip).toHaveClass(/text-primary/)
    await expect(chip).toHaveClass(/border-primary/)

    await chip.click()
    dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('textbox', { name: 'Language requirements', exact: true })).toHaveValue('English, German')
    await expect(dialog.getByRole('textbox', { name: 'Exclude language requirements', exact: true })).toHaveValue('Japanese')
  })

  test('clearing both fields removes chip highlight', async ({ page }) => {
    await page.goto('/')
    const chip = page.getByRole('button', { name: 'Languages', exact: true })

    await chip.click()
    let dialog = page.getByRole('dialog')
    await dialog.getByRole('textbox', { name: 'Language requirements', exact: true }).fill('English')
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()
    await expect(chip).toHaveClass(/text-primary/)

    await chip.click()
    dialog = page.getByRole('dialog')
    await dialog.getByRole('textbox', { name: 'Language requirements', exact: true }).fill('')
    await dialog.getByRole('textbox', { name: 'Exclude language requirements', exact: true }).fill('')
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()

    await expect(chip).not.toHaveClass(/text-primary/)
    await expect(chip).not.toHaveClass(/border-primary/)
  })
})
