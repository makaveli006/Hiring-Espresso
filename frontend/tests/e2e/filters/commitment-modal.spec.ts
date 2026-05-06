import { test, expect } from '../../fixtures/app.fixture'
import { COMMITMENT_TYPES } from '../../utils/test-data'

test.describe('Commitment modal', () => {
  test('opens with title, options, and footer controls', async ({ page }) => {
    await page.goto('/')
    const commitmentChip = page.getByRole('button', { name: 'Commitment', exact: true })
    await commitmentChip.click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Commitment', exact: true })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Clear all', exact: true })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Apply', exact: true })).toBeVisible()

    for (const option of COMMITMENT_TYPES) {
      await expect(dialog.getByText(option, { exact: true })).toBeVisible()
    }
  })

  test('checkboxes toggle selection state', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Commitment', exact: true }).click()

    const dialog = page.getByRole('dialog')
    const fullTimeCheckbox = dialog.getByRole('checkbox', { name: 'Full Time', exact: true })

    await expect(fullTimeCheckbox).toHaveAttribute('aria-checked', 'false')
    await fullTimeCheckbox.click()
    await expect(fullTimeCheckbox).toHaveAttribute('aria-checked', 'true')
  })

  test('apply closes modal and keeps commitment chip highlighted', async ({ page }) => {
    await page.goto('/')
    const commitmentChip = page.getByRole('button', { name: 'Commitment', exact: true })
    await commitmentChip.click()

    const dialog = page.getByRole('dialog')
    await dialog.getByRole('checkbox', { name: 'Full Time', exact: true }).click()
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()

    await expect(dialog).not.toBeVisible()
    await expect(commitmentChip).toHaveClass(/text-primary/)
    await expect(commitmentChip).toHaveClass(/border-primary/)
  })

  test('reopening modal reflects previously applied selections', async ({ page }) => {
    await page.goto('/')
    const commitmentChip = page.getByRole('button', { name: 'Commitment', exact: true })

    await commitmentChip.click()
    let dialog = page.getByRole('dialog')
    await dialog.getByRole('checkbox', { name: 'Contract', exact: true }).click()
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()
    await expect(dialog).not.toBeVisible()

    await commitmentChip.click()
    dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(
      dialog.getByRole('checkbox', { name: 'Contract', exact: true })
    ).toHaveAttribute('aria-checked', 'true')
  })

  test('clear all removes selections and clears chip highlight after apply', async ({ page }) => {
    await page.goto('/')
    const commitmentChip = page.getByRole('button', { name: 'Commitment', exact: true })

    await commitmentChip.click()
    let dialog = page.getByRole('dialog')
    await dialog.getByRole('checkbox', { name: 'Internship', exact: true }).click()
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()
    await expect(commitmentChip).toHaveClass(/text-primary/)

    await commitmentChip.click()
    dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Clear all', exact: true }).click()
    await expect(
      dialog.getByRole('checkbox', { name: 'Internship', exact: true })
    ).toHaveAttribute('aria-checked', 'false')
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()

    await expect(dialog).not.toBeVisible()
    await expect(commitmentChip).not.toHaveClass(/text-primary/)
  })
})
