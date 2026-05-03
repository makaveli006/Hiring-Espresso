import { test, expect } from '../../fixtures/app.fixture'

test.describe('Salary modal', () => {
  test('opens with title, undisclosed card, and sticky apply footer', async ({ page }) => {
    await page.goto('/')
    const salaryButton = page.getByRole('button', { name: 'Salary', exact: true })
    await salaryButton.scrollIntoViewIfNeeded()
    await salaryButton.click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Salary', exact: true })).toBeVisible()
    await expect(
      dialog.getByText('Undisclosed Salary Preference', { exact: true })
    ).toBeVisible()
    await expect(
      dialog.getByText('Hide jobs with undisclosed salaries', { exact: true })
    ).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Apply', exact: true })).toBeVisible()
  })

  test('simple mode shows desired compensation fields by default', async ({ page }) => {
    await page.goto('/')
    const salaryButton = page.getByRole('button', { name: 'Salary', exact: true })
    await salaryButton.scrollIntoViewIfNeeded()
    await salaryButton.click()

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('button', { name: 'Advanced Mode', exact: true })).toBeVisible()
    await expect(dialog.getByText('Desired Compensation', { exact: true })).toBeVisible()

    const amountInput = dialog.getByLabel('Desired compensation amount')
    const frequencySelect = dialog.getByLabel('Desired compensation frequency')

    await expect(amountInput).toHaveAttribute('placeholder', 'Enter amount')
    await expect(frequencySelect).toHaveValue('Yearly')
  })

  test('advanced mode shows compensation cards and listed filter sections', async ({ page }) => {
    await page.goto('/')
    const salaryButton = page.getByRole('button', { name: 'Salary', exact: true })
    await salaryButton.scrollIntoViewIfNeeded()
    await salaryButton.click()

    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Advanced Mode', exact: true }).click()

    await expect(dialog.getByRole('button', { name: 'Simple Mode', exact: true })).toBeVisible()
    await expect(dialog.getByText('Minimum Compensation', { exact: true })).toBeVisible()
    await expect(dialog.getByText('Maximum Compensation', { exact: true })).toBeVisible()
    await expect(
      dialog.getByText('If a job offers $X - $Y, this controls the $X part.', { exact: true })
    ).toBeVisible()
    await expect(
      dialog.getByText('If a job offers $X - $Y, this controls the $Y part.', { exact: true })
    ).toBeVisible()
    await expect(dialog.getByPlaceholder('No Min')).toHaveCount(2)
    await expect(dialog.getByPlaceholder('No Max')).toHaveCount(2)
    await expect(dialog.getByText('Listed Frequency', { exact: true })).toBeVisible()
    await expect(dialog.getByText('Listed Currency', { exact: true })).toBeVisible()
  })

  test('listed frequency pills switch active selection', async ({ page }) => {
    await page.goto('/')
    const salaryButton = page.getByRole('button', { name: 'Salary', exact: true })
    await salaryButton.scrollIntoViewIfNeeded()
    await salaryButton.click()

    const dialog = page.getByRole('dialog')

    const frequencyGroup = dialog.getByTestId('listed-frequency-group')
    const anyPill = frequencyGroup.getByRole('button', { name: 'Any', exact: true })
    const hourlyPill = frequencyGroup.getByRole('button', { name: 'Hourly', exact: true })

    await expect(anyPill).toHaveClass(/bg-pink-500/)
    await hourlyPill.click({ force: true })
    await expect(hourlyPill).toHaveClass(/bg-pink-500/)
    await expect(anyPill).not.toHaveClass(/bg-pink-500/)
  })

  test('listed currency supports open, search, select, and clear', async ({ page }) => {
    await page.goto('/')
    const salaryButton = page.getByRole('button', { name: 'Salary', exact: true })
    await salaryButton.scrollIntoViewIfNeeded()
    await salaryButton.click()

    const dialog = page.getByRole('dialog')

    const currencyInput = dialog.getByRole('textbox', { name: 'Listed Currency', exact: true })
    const currencyControl = dialog.getByTestId('listed-currency-control')

    await currencyControl.scrollIntoViewIfNeeded()
    await currencyControl.click({ force: true })
    await expect(currencyControl).toHaveClass(/border-blue-500/)
    await expect(dialog.getByTestId('listed-currency-menu')).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'usd', exact: true })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'eur', exact: true })).toBeVisible()

    await currencyInput.fill('in')
    await expect(dialog.getByRole('button', { name: 'inr', exact: true })).toBeVisible()
    const inrOption = dialog.getByRole('button', { name: 'inr', exact: true })
    await inrOption.scrollIntoViewIfNeeded()
    await inrOption.click({ force: true })

    await expect(currencyInput).toHaveValue('inr')
    await dialog.getByRole('button', { name: 'Clear listed currency', exact: true }).click({ force: true })
    await expect(currencyInput).toHaveValue('Any')
  })

  test('apply closes modal and keeps applied simple salary value', async ({ page }) => {
    await page.goto('/')
    const salaryChip = page.getByRole('button', { name: 'Salary', exact: true })

    await salaryChip.scrollIntoViewIfNeeded()
    await salaryChip.click()
    const dialog = page.getByRole('dialog')
    const amountInput = dialog.getByLabel('Desired compensation amount')
    await amountInput.fill('120000')
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click({ force: true })

    await expect(dialog).not.toBeVisible()
    await expect(salaryChip).toHaveClass(/text-primary/)

    await salaryChip.click()
    await expect(dialog).toBeVisible()
    await expect(dialog.getByLabel('Desired compensation amount')).toHaveValue('120000')
  })

  test('salary chip stays highlighted when only listed frequency and currency are applied', async ({ page }) => {
    await page.goto('/')
    const salaryChip = page.getByRole('button', { name: 'Salary', exact: true })

    await salaryChip.scrollIntoViewIfNeeded()
    await salaryChip.click()

    const dialog = page.getByRole('dialog')
    const frequencyGroup = dialog.getByTestId('listed-frequency-group')
    await frequencyGroup.getByRole('button', { name: 'Hourly', exact: true }).click({ force: true })

    const currencyControl = dialog.getByTestId('listed-currency-control')
    await currencyControl.scrollIntoViewIfNeeded()
    await currencyControl.click({ force: true })
    const inrOption = dialog.getByRole('button', { name: 'inr', exact: true })
    await inrOption.scrollIntoViewIfNeeded()
    await inrOption.click({ force: true })

    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()

    await expect(dialog).not.toBeVisible()
    await expect(salaryChip).toHaveClass(/text-primary/)
  })

  test('salary chip stays highlighted when minimum or maximum compensation values are applied', async ({ page }) => {
    await page.goto('/')
    const salaryChip = page.getByRole('button', { name: 'Salary', exact: true })

    await salaryChip.scrollIntoViewIfNeeded()
    await salaryChip.click()

    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Advanced Mode', exact: true }).click({ force: true })

    await dialog.getByLabel('Minimum compensation minimum amount').fill('50000')
    await dialog.getByLabel('Maximum compensation maximum amount').fill('120000')
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click({ force: true })

    await expect(dialog).not.toBeVisible()
    await expect(salaryChip).toHaveClass(/text-primary/)
  })

  test('clear all resets salary modal fields and clears salary chip highlight after apply', async ({ page }) => {
    await page.goto('/')
    const salaryChip = page.getByRole('button', { name: 'Salary', exact: true })

    await salaryChip.scrollIntoViewIfNeeded()
    await salaryChip.click()

    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Desired compensation amount').fill('90000')

    const frequencyGroup = dialog.getByTestId('listed-frequency-group')
    await frequencyGroup.getByRole('button', { name: 'Hourly', exact: true }).click({ force: true })

    const currencyControl = dialog.getByTestId('listed-currency-control')
    await currencyControl.scrollIntoViewIfNeeded()
    await currencyControl.click({ force: true })
    const inrOption = dialog.getByRole('button', { name: 'inr', exact: true })
    await inrOption.scrollIntoViewIfNeeded()
    await inrOption.click({ force: true })

    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()
    await expect(dialog).not.toBeVisible()
    await expect(salaryChip).toHaveClass(/text-primary/)

    await salaryChip.click()
    await expect(dialog).toBeVisible()

    await dialog.getByRole('button', { name: 'Clear all', exact: true }).click({ force: true })
    await expect(dialog.getByLabel('Desired compensation amount')).toHaveValue('')

    const anyPill = dialog
      .getByTestId('listed-frequency-group')
      .getByRole('button', { name: 'Any', exact: true })
    await expect(anyPill).toHaveClass(/bg-pink-500/)

    const listedCurrencyInput = dialog.getByRole('textbox', { name: 'Listed Currency', exact: true })
    await expect(listedCurrencyInput).toHaveValue('Any')

    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()
    await expect(dialog).not.toBeVisible()
    await expect(salaryChip).not.toHaveClass(/text-primary/)
  })
})
