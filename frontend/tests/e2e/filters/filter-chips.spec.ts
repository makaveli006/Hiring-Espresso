import { test, expect } from '../../fixtures/app.fixture'
import { JOB_FILTER_CHIPS, COMPANY_FILTER_CHIPS } from '../../utils/test-data'

test.describe('Filter bar chips', () => {
  test('all job filter chips are visible', async ({ page }) => {
    await page.goto('/')
    for (const label of JOB_FILTER_CHIPS) {
      await expect(page.getByRole('button', { name: label, exact: true })).toBeVisible()
    }
  })

  test('all company filter chips are visible', async ({ page }) => {
    await page.goto('/')
    for (const label of COMPANY_FILTER_CHIPS) {
      await expect(page.getByRole('button', { name: label, exact: true })).toBeVisible()
    }
  })

  test('clicking a chip marks it as active', async ({ page }) => {
    await page.goto('/')
    const chip = page.getByRole('button', { name: 'Departments', exact: true })
    await chip.click()
    await expect(chip).toHaveClass(/text-primary/)
  })

  test('clicking an active chip deactivates it', async ({ page }) => {
    await page.goto('/')
    const chip = page.getByRole('button', { name: 'Salary', exact: true })
    await chip.click()
    await expect(chip).toHaveClass(/text-primary/)
    await chip.click()
    await expect(chip).not.toHaveClass(/text-primary/)
  })

  test('only one chip can be active at a time', async ({ page }) => {
    await page.goto('/')
    const departments = page.getByRole('button', { name: 'Departments', exact: true })
    const salary = page.getByRole('button', { name: 'Salary', exact: true })

    await departments.click()
    await expect(departments).toHaveClass(/text-primary/)

    await salary.click()
    await expect(salary).toHaveClass(/text-primary/)
    await expect(departments).not.toHaveClass(/text-primary/)
  })

  test('active chip has primary border and background', async ({ page }) => {
    await page.goto('/')
    const chip = page.getByRole('button', { name: 'Experience', exact: true })
    await chip.click()
    await expect(chip).toHaveClass(/border-primary/)
    await expect(chip).toHaveClass(/bg-primary\/5/)
  })
})
