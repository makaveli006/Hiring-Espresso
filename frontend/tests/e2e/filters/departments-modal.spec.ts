import { test, expect } from '../../fixtures/app.fixture'

test.describe('Departments modal', () => {
  test('shows header, search, actions and sticky footer controls', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Departments', exact: true }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Departments', exact: true })).toBeVisible()
    await expect(dialog.getByPlaceholder('Search departments...')).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Expand All', exact: true })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Collapse All', exact: true })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Clear all', exact: true })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Apply', exact: true })).toBeVisible()
  })

  test('collapse all hides options and expand all shows them again', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Departments', exact: true }).click()

    const dialog = page.getByRole('dialog')
    const engineering = dialog.getByText('Engineering', { exact: true })

    await expect(engineering).toBeVisible()
    await dialog.getByRole('button', { name: 'Collapse All', exact: true }).click()
    await expect(engineering).not.toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Technology', exact: false })).toBeVisible()

    await dialog.getByRole('button', { name: 'Expand All', exact: true }).click()
    await expect(engineering).toBeVisible()
  })

  test('selecting checkbox creates pill and pill remove unchecks checkbox', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Departments', exact: true }).click()

    const dialog = page.getByRole('dialog')
    const engineeringCheckbox = dialog.getByRole('checkbox', { name: 'Engineering', exact: true })

    await engineeringCheckbox.click()
    await expect(engineeringCheckbox).toHaveAttribute('aria-checked', 'true')
    await expect(dialog.getByRole('button', { name: 'Remove Engineering', exact: true })).toBeVisible()
    await expect(dialog.getByRole('button', { name: /Technology \(1\/4\)/ })).toBeVisible()

    await dialog.getByRole('button', { name: 'Remove Engineering', exact: true }).click()
    await expect(engineeringCheckbox).toHaveAttribute('aria-checked', 'false')
    await expect(dialog.getByRole('button', { name: 'Remove Engineering', exact: true })).not.toBeVisible()
  })

  test('clear all removes selected pills and clears checkboxes', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Departments', exact: true }).click()

    const dialog = page.getByRole('dialog')
    const engineeringCheckbox = dialog.getByRole('checkbox', { name: 'Engineering', exact: true })
    const designCheckbox = dialog.getByRole('checkbox', { name: 'Design', exact: true })

    await engineeringCheckbox.click()
    await designCheckbox.click()
    await expect(dialog.getByRole('button', { name: 'Remove Engineering', exact: true })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Remove Design', exact: true })).toBeVisible()

    await dialog.getByRole('button', { name: 'Clear all', exact: true }).click()

    await expect(engineeringCheckbox).toHaveAttribute('aria-checked', 'false')
    await expect(designCheckbox).toHaveAttribute('aria-checked', 'false')
    await expect(dialog.getByRole('button', { name: 'Remove Engineering', exact: true })).not.toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Remove Design', exact: true })).not.toBeVisible()
  })

  test('search filters visible department options', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Departments', exact: true }).click()

    const dialog = page.getByRole('dialog')
    const searchInput = dialog.getByPlaceholder('Search departments...')

    await searchInput.fill('analytics')

    await expect(dialog.getByText('Data and Analytics', { exact: true })).toBeVisible()
    await expect(dialog.getByText('Engineering', { exact: true })).not.toBeVisible()
  })

  test('departments chip remains highlighted after apply when filters are selected', async ({
    page,
  }) => {
    await page.goto('/')

    const departmentsChip = page.getByRole('button', { name: 'Departments', exact: true })
    await departmentsChip.click()

    const dialog = page.getByRole('dialog')
    await dialog.getByRole('checkbox', { name: 'Engineering', exact: true }).click()
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()

    await expect(dialog).not.toBeVisible()
    await expect(departmentsChip).toHaveClass(/text-primary/)
    await expect(departmentsChip).toHaveClass(/border-primary/)
  })
})
