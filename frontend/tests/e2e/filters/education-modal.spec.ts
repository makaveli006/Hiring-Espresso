import { expect, test } from '../../fixtures/app.fixture'

test.describe('Education modal', () => {
  test('opens with degree sections, majors rows, and apply button', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Education', exact: true }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Education', exact: true })).toBeVisible()

    await expect(dialog.getByText("Associate's Degree", { exact: true })).toBeVisible()
    await expect(dialog.getByText("Bachelor's Degree", { exact: true })).toBeVisible()
    await expect(dialog.getByText("Master's Degree", { exact: true })).toBeVisible()
    await expect(dialog.getByText('Doctorate Degree', { exact: true })).toBeVisible()

    await expect(dialog.getByText("Associate's Degree Majors", { exact: true })).toBeVisible()
    await expect(dialog.getByText("Bachelor's Degree Majors", { exact: true })).toBeVisible()
    await expect(dialog.getByText('Doctorate Degree Majors', { exact: true })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Apply', exact: true })).toBeVisible()
  })

  test('single-select requirement buttons per degree', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Education', exact: true }).click()

    const dialog = page.getByRole('dialog')
    const associatesRequired = dialog.getByRole('button', { name: /Required/, exact: false }).first()
    const associatesPreferred = dialog.getByRole('button', { name: /Preferred/, exact: false }).first()

    await associatesRequired.click()
    await expect(associatesRequired.locator('span').first()).toHaveClass(/bg-pink-500/)

    await associatesPreferred.click()
    await expect(associatesPreferred.locator('span').first()).toHaveClass(/bg-pink-500/)
    await expect(associatesRequired.locator('span').first()).not.toHaveClass(/bg-pink-500/)
  })

  test('majors rows expand and collapse placeholder', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Education', exact: true }).click()

    const dialog = page.getByRole('dialog')
    const associatesMajors = dialog.getByRole('button', {
      name: "Associate's Degree Majors",
      exact: true,
    })

    await associatesMajors.click()
    await expect(dialog.getByText('No major options yet.', { exact: true })).toBeVisible()

    await associatesMajors.click()
    await expect(dialog.getByText('No major options yet.', { exact: true })).toHaveCount(0)
  })

  test('apply persists selections and highlights chip', async ({ page }) => {
    await page.goto('/')
    const chip = page.getByRole('button', { name: 'Education', exact: true })

    await chip.click()
    let dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Required', exact: true }).first().click()
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()

    await expect(chip).toHaveClass(/text-primary/)
    await expect(chip).toHaveClass(/border-primary/)

    await chip.click()
    dialog = page.getByRole('dialog')
    await expect(
      dialog.getByRole('button', { name: 'Required', exact: true }).first().locator('span').first()
    ).toHaveClass(/bg-pink-500/)
  })

  test('all not mentioned clears chip highlight', async ({ page }) => {
    await page.goto('/')
    const chip = page.getByRole('button', { name: 'Education', exact: true })

    await chip.click()
    let dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Preferred', exact: true }).nth(1).click()
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()
    await expect(chip).toHaveClass(/text-primary/)

    await chip.click()
    dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Not Mentioned', exact: true }).nth(0).click()
    await dialog.getByRole('button', { name: 'Not Mentioned', exact: true }).nth(1).click()
    await dialog.getByRole('button', { name: 'Not Mentioned', exact: true }).nth(2).click()
    await dialog.getByRole('button', { name: 'Not Mentioned', exact: true }).nth(3).click()
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()

    await expect(chip).not.toHaveClass(/text-primary/)
    await expect(chip).not.toHaveClass(/border-primary/)
  })
})
