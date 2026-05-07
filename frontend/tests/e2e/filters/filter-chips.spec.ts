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

  test('company chips render inline after Encouraged to Apply', async ({ page }) => {
    await page.goto('/')

    const row = page.getByTestId('filter-chip-row')
    const labels = await row.getByRole('button').allTextContents()
    const normalized = labels.map((label) => label.trim())

    const encouragedIndex = normalized.indexOf('Encouraged to Apply')
    const companyIndex = normalized.indexOf('Company')

    expect(encouragedIndex).toBeGreaterThanOrEqual(0)
    expect(companyIndex).toBe(encouragedIndex + 1)
  })

  test('clicking a chip marks it as active', async ({ page }) => {
    await page.goto('/')
    // Use CSS locator: Radix Dialog aria-hides the background when a modal opens,
    // which makes getByRole fail. A CSS-based locator still resolves aria-hidden elements.
    const chip = page.locator('[data-testid="filter-chip-row"] button').filter({ hasText: /^Departments$/ })
    await chip.click()
    await expect(chip).toHaveClass(/text-primary/)
  })

  test('clicking an active chip deactivates it', async ({ page }) => {
    await page.goto('/')
    const chip = page.locator('[data-testid="filter-chip-row"] button').filter({ hasText: /^Salary$/ })
    await chip.click()
    await expect(chip).toHaveClass(/text-primary/)
    // The chip is behind the modal backdrop; close via Escape instead of re-clicking
    await page.keyboard.press('Escape')
    await expect(chip).not.toHaveClass(/text-primary/)
  })

  test('only one chip can be active at a time', async ({ page }) => {
    await page.goto('/')
    const departments = page.locator('[data-testid="filter-chip-row"] button').filter({ hasText: /^Departments$/ })
    const salary = page.locator('[data-testid="filter-chip-row"] button').filter({ hasText: /^Salary$/ })

    await departments.click()
    await expect(departments).toHaveClass(/text-primary/)

    // Close departments modal before clicking salary chip
    await page.keyboard.press('Escape')
    await salary.click()
    await expect(salary).toHaveClass(/text-primary/)
    await expect(departments).not.toHaveClass(/text-primary/)
  })

  test('active chip has primary border and background', async ({ page }) => {
    await page.goto('/')
    const chip = page.locator('[data-testid="filter-chip-row"] button').filter({ hasText: /^Experience$/ })
    await chip.click()
    await expect(chip).toHaveClass(/border-primary/)
    await expect(chip).toHaveClass(/bg-primary\/5/)
  })
})
