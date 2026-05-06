import { test, expect } from '../../fixtures/app.fixture'

const SIZE_OPTIONS = [
  '1 - 10 employees',
  '11 - 50 employees',
  '51 - 200 employees',
  '201 - 500 employees',
  '501 - 1000 employees',
  '1001 - 2000 employees',
  '2001 - 5000 employees',
  '5001 - 10000 employees',
  '10001+ employees',
] as const

test.describe('Size modal', () => {
  test('opens with title, all option, size options, and apply button', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Size', exact: true }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Size', exact: true })).toBeVisible()
    await expect(dialog.getByRole('checkbox', { name: 'All', exact: true })).toBeVisible()
    for (const option of SIZE_OPTIONS) {
      await expect(dialog.getByRole('checkbox', { name: option, exact: true })).toBeVisible()
    }
    await expect(dialog.getByRole('button', { name: 'Apply', exact: true })).toBeVisible()
  })

  test('defaults to All checked and unchecks All when specific size is selected', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Size', exact: true }).click()

    const dialog = page.getByRole('dialog')
    const all = dialog.getByRole('checkbox', { name: 'All', exact: true })
    const first = dialog.getByRole('checkbox', { name: '1 - 10 employees', exact: true })

    await expect(all).toHaveAttribute('aria-checked', 'true')
    await first.click()
    await expect(first).toHaveAttribute('aria-checked', 'true')
    await expect(all).toHaveAttribute('aria-checked', 'false')
  })

  test('reverts to All when all specific options are unchecked', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Size', exact: true }).click()

    const dialog = page.getByRole('dialog')
    const all = dialog.getByRole('checkbox', { name: 'All', exact: true })
    const first = dialog.getByRole('checkbox', { name: '1 - 10 employees', exact: true })

    await first.click()
    await expect(all).toHaveAttribute('aria-checked', 'false')
    await first.click()
    await expect(first).toHaveAttribute('aria-checked', 'false')
    await expect(all).toHaveAttribute('aria-checked', 'true')
  })

  test('clicking All clears specific selections', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Size', exact: true }).click()

    const dialog = page.getByRole('dialog')
    const all = dialog.getByRole('checkbox', { name: 'All', exact: true })
    const first = dialog.getByRole('checkbox', { name: '1 - 10 employees', exact: true })
    const second = dialog.getByRole('checkbox', { name: '11 - 50 employees', exact: true })

    await first.click()
    await second.click()
    await expect(first).toHaveAttribute('aria-checked', 'true')
    await expect(second).toHaveAttribute('aria-checked', 'true')

    await all.click()
    await expect(all).toHaveAttribute('aria-checked', 'true')
    await expect(first).toHaveAttribute('aria-checked', 'false')
    await expect(second).toHaveAttribute('aria-checked', 'false')
  })

  test('apply persists specific selections and marks Size chip active', async ({ page }) => {
    await page.goto('/')
    const sizeChip = page.getByRole('button', { name: 'Size', exact: true })
    await sizeChip.click()

    let dialog = page.getByRole('dialog')
    await dialog.getByRole('checkbox', { name: '51 - 200 employees', exact: true }).click()
    await dialog.getByRole('checkbox', { name: '201 - 500 employees', exact: true }).click()
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click({ force: true })
    await expect(dialog).not.toBeVisible()

    await expect(sizeChip).toHaveClass(/border-amber-500/)
    await expect(sizeChip).toHaveClass(/bg-amber-50/)

    await sizeChip.click()
    dialog = page.getByRole('dialog')
    await expect(
      dialog.getByRole('checkbox', { name: '51 - 200 employees', exact: true })
    ).toHaveAttribute('aria-checked', 'true')
    await expect(
      dialog.getByRole('checkbox', { name: '201 - 500 employees', exact: true })
    ).toHaveAttribute('aria-checked', 'true')
    await expect(dialog.getByRole('checkbox', { name: 'All', exact: true })).toHaveAttribute(
      'aria-checked',
      'false'
    )
  })
})
