import { expect, test } from '../../fixtures/app.fixture'

test.describe('Licenses & Certifications modal', () => {
  test('opens with title, yes/no toggle, fields, and apply button', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Licenses & Certifications', exact: true }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(
      dialog.getByRole('heading', { name: 'Licenses & Certifications', exact: true })
    ).toBeVisible()
    await expect(
      dialog.getByText('Hide jobs that require licenses or certifications?', { exact: true })
    ).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Yes', exact: true })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'No', exact: true })).toBeVisible()
    await expect(
      dialog.getByText('Licenses & Certifications Keywords', { exact: true })
    ).toBeVisible()
    await expect(
      dialog.getByText('Exclude Licenses & Certifications Keywords', { exact: true })
    ).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Apply', exact: true })).toBeVisible()
  })

  test('defaults to No and no dropdown panel on open', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Licenses & Certifications', exact: true }).click()

    const dialog = page.getByRole('dialog')
    const yesButton = dialog.getByRole('button', { name: 'Yes', exact: true })
    const noButton = dialog.getByRole('button', { name: 'No', exact: true })

    await expect(noButton).toHaveClass(/bg-pink-500/)
    await expect(yesButton).not.toHaveClass(/bg-pink-500/)
    await expect(dialog.getByText('No options')).toHaveCount(0)
  })

  test('only one dropdown panel is open at a time', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Licenses & Certifications', exact: true }).click()

    const dialog = page.getByRole('dialog')
    await dialog
      .getByRole('button', { name: 'Licenses & Certifications Keywords dropdown', exact: true })
      .click()
    await expect(dialog.getByText('No options')).toBeVisible()

    await dialog
      .getByRole('button', { name: 'Exclude Licenses & Certifications Keywords dropdown', exact: true })
      .click()
    await expect(dialog.getByText('No options')).toBeVisible()
    await expect(dialog.getByText('No options')).toHaveCount(1)
  })

  test('apply persists values and highlights chip', async ({ page }) => {
    await page.goto('/')
    const chip = page.getByRole('button', { name: 'Licenses & Certifications', exact: true })

    await chip.click()
    let dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Yes', exact: true }).click()
    await dialog
      .getByRole('textbox', { name: 'Licenses and certifications keywords', exact: true })
      .fill('PMP, AWS')
    await dialog
      .getByRole('textbox', { name: 'Exclude licenses and certifications keywords', exact: true })
      .fill('CPA')
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()

    await expect(chip).toHaveClass(/text-primary/)
    await expect(chip).toHaveClass(/border-primary/)

    await chip.click()
    dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('button', { name: 'Yes', exact: true })).toHaveClass(/bg-pink-500/)
    await expect(
      dialog.getByRole('textbox', { name: 'Licenses and certifications keywords', exact: true })
    ).toHaveValue('PMP, AWS')
    await expect(
      dialog.getByRole('textbox', { name: 'Exclude licenses and certifications keywords', exact: true })
    ).toHaveValue('CPA')
  })

  test('No + cleared fields removes chip highlight', async ({ page }) => {
    await page.goto('/')
    const chip = page.getByRole('button', { name: 'Licenses & Certifications', exact: true })

    await chip.click()
    let dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Yes', exact: true }).click()
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()
    await expect(chip).toHaveClass(/text-primary/)

    await chip.click()
    dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'No', exact: true }).click()
    await dialog
      .getByRole('textbox', { name: 'Licenses and certifications keywords', exact: true })
      .fill('')
    await dialog
      .getByRole('textbox', { name: 'Exclude licenses and certifications keywords', exact: true })
      .fill('')
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()

    await expect(chip).not.toHaveClass(/text-primary/)
    await expect(chip).not.toHaveClass(/border-primary/)
  })
})
