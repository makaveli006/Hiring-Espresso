import { test, expect } from '../../fixtures/app.fixture'
import type { Locator } from '@playwright/test'
import { EXPERIENCE_ROLE_TYPES, EXPERIENCE_SENIORITY_TYPES } from '../../utils/test-data'

async function setSliderValue(input: Locator, value: number) {
  const currentRaw = await input.inputValue()
  const current = Number(currentRaw)
  if (!Number.isFinite(current) || current === value) return

  const diff = value - current
  await input.focus()
  for (let i = 0; i < Math.abs(diff); i += 1) {
    await input.press(diff > 0 ? 'ArrowRight' : 'ArrowLeft')
  }
}

test.describe('Experience modal', () => {
  test('opens with title, sections, options, and footer controls', async ({ page }) => {
    await page.goto('/')
    const experienceChip = page.getByRole('button', { name: 'Experience', exact: true })
    await experienceChip.click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Experience', exact: true })).toBeVisible()
    await expect(dialog.getByText('Seniority', { exact: true })).toBeVisible()
    await expect(dialog.getByText('Role Type', { exact: true })).toBeVisible()
    await expect(dialog.getByTestId('experience-role-industry-slider')).toBeVisible()
    await expect(dialog.getByTestId('experience-management-slider')).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Clear all', exact: true })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Apply', exact: true })).toBeVisible()
    await expect(dialog.getByTestId('experience-role-industry-slider-min-thumb')).toBeVisible()
    await expect(dialog.getByTestId('experience-role-industry-slider-max-thumb')).toBeVisible()
    await expect(dialog.getByTestId('experience-management-slider-min-thumb')).toBeVisible()
    await expect(dialog.getByTestId('experience-management-slider-max-thumb')).toBeVisible()
    await expect(
      dialog.getByTestId('experience-role-industry-slider').getByText(
        "Exclude jobs that haven't mentioned this",
        { exact: true }
      )
    ).not.toBeVisible()
    await expect(
      dialog.getByTestId('experience-management-slider').getByText(
        "Exclude jobs that haven't mentioned this",
        { exact: true }
      )
    ).not.toBeVisible()

    const scrollArea = dialog.getByTestId('experience-scroll-area')
    const horizontalScrollAfterAttempt = await scrollArea.evaluate((element) => {
      const node = element as HTMLElement
      node.scrollLeft = 120
      return node.scrollLeft
    })
    expect(horizontalScrollAfterAttempt).toBe(0)

    for (const seniority of EXPERIENCE_SENIORITY_TYPES) {
      await expect(dialog.getByText(seniority, { exact: true })).toBeVisible()
    }
    for (const roleType of EXPERIENCE_ROLE_TYPES) {
      await expect(dialog.getByText(roleType, { exact: true })).toBeVisible()
    }
  })

  test('expands only the interacted card and reveals advanced controls', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Experience', exact: true }).click()

    const dialog = page.getByRole('dialog')
    const roleIndustrySlider = dialog.getByTestId('experience-role-industry-slider')
    const managementSlider = dialog.getByTestId('experience-management-slider')

    await setSliderValue(dialog.getByTestId('experience-role-industry-slider-min'), 3)
    await expect(dialog.getByTestId('experience-role-industry-slider-min')).toHaveValue('3')
    await setSliderValue(dialog.getByTestId('experience-role-industry-slider-max'), 12)

    await expect(
      roleIndustrySlider.getByText("Exclude jobs that haven't mentioned this", { exact: true })
    ).toBeVisible()
    await expect(roleIndustrySlider.getByTestId('experience-role-industry-slider-range-label')).toBeVisible()
    await expect(roleIndustrySlider.getByTestId('experience-role-industry-slider-reset')).toBeVisible()

    await expect(
      managementSlider.getByText("Exclude jobs that haven't mentioned this", { exact: true })
    ).not.toBeVisible()
    await expect(
      managementSlider.getByTestId('experience-management-slider-range-label')
    ).not.toBeVisible()
  })

  test('clicking thumb without value change does not expand card', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Experience', exact: true }).click()

    const dialog = page.getByRole('dialog')
    const roleIndustrySlider = dialog.getByTestId('experience-role-industry-slider')
    const minThumb = roleIndustrySlider.getByTestId('experience-role-industry-slider-min-thumb')
    const maxThumb = roleIndustrySlider.getByTestId('experience-role-industry-slider-max-thumb')

    await minThumb.click({ force: true })
    await maxThumb.click({ force: true })

    await expect(
      roleIndustrySlider.getByText("Exclude jobs that haven't mentioned this", { exact: true })
    ).not.toBeVisible()
    await expect(
      roleIndustrySlider.getByTestId('experience-role-industry-slider-range-label')
    ).not.toBeVisible()
  })

  test('expands when min changes from 0 to 1 or max changes from 20 to 19', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Experience', exact: true }).click()

    const dialog = page.getByRole('dialog')
    const roleIndustrySlider = dialog.getByTestId('experience-role-industry-slider')
    await setSliderValue(dialog.getByTestId('experience-role-industry-slider-min'), 1)
    await expect(
      roleIndustrySlider.getByText("Exclude jobs that haven't mentioned this", { exact: true })
    ).toBeVisible()

    await dialog.getByRole('button', { name: 'Clear all', exact: true }).click({ force: true })
    await expect(
      roleIndustrySlider.getByText("Exclude jobs that haven't mentioned this", { exact: true })
    ).not.toBeVisible()

    await setSliderValue(dialog.getByTestId('experience-role-industry-slider-max'), 19)
    await expect(
      roleIndustrySlider.getByText("Exclude jobs that haven't mentioned this", { exact: true })
    ).toBeVisible()
  })

  test('card reset collapses card back to default and clears exclude toggle', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Experience', exact: true }).click()

    const dialog = page.getByRole('dialog')
    const roleIndustrySlider = dialog.getByTestId('experience-role-industry-slider')
    await setSliderValue(dialog.getByTestId('experience-role-industry-slider-max'), 12)
    await roleIndustrySlider.getByTestId('experience-role-industry-slider-exclude-missing').click()
    await expect(
      roleIndustrySlider.getByTestId('experience-role-industry-slider-exclude-missing')
    ).toHaveAttribute('aria-checked', 'true')

    await roleIndustrySlider
      .getByTestId('experience-role-industry-slider-reset')
      .click({ force: true })

    await expect(dialog.getByTestId('experience-role-industry-slider-min')).toHaveValue('0')
    await expect(dialog.getByTestId('experience-role-industry-slider-max')).toHaveValue('20')
    await expect(
      roleIndustrySlider.getByText("Exclude jobs that haven't mentioned this", { exact: true })
    ).not.toBeVisible()
  })

  test('checkboxes toggle selection state for both sections', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Experience', exact: true }).click()

    const dialog = page.getByRole('dialog')
    const midLevelCheckbox = dialog.getByRole('checkbox', { name: 'Mid Level', exact: true })
    const managerCheckbox = dialog.getByRole('checkbox', { name: 'People Manager', exact: true })

    await expect(midLevelCheckbox).toHaveAttribute('aria-checked', 'false')
    await expect(managerCheckbox).toHaveAttribute('aria-checked', 'false')
    await midLevelCheckbox.click()
    await managerCheckbox.click()
    await expect(midLevelCheckbox).toHaveAttribute('aria-checked', 'true')
    await expect(managerCheckbox).toHaveAttribute('aria-checked', 'true')
  })

  test('apply closes modal and keeps experience chip highlighted', async ({ page }) => {
    await page.goto('/')
    const experienceChip = page.getByRole('button', { name: 'Experience', exact: true })
    await experienceChip.click()

    const dialog = page.getByRole('dialog')
    await dialog.getByRole('checkbox', { name: 'Entry Level', exact: true }).click()
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click({ force: true })

    await expect(dialog).not.toBeVisible()
    await expect(experienceChip).toHaveClass(/text-primary/)
    await expect(experienceChip).toHaveClass(/border-primary/)
  })

  test('reopening modal reflects previously applied seniority and role type selections', async ({
    page,
  }) => {
    await page.goto('/')
    const experienceChip = page.getByRole('button', { name: 'Experience', exact: true })
    await experienceChip.click()

    let dialog = page.getByRole('dialog')
    await dialog.getByRole('checkbox', { name: 'Senior Level', exact: true }).click()
    await dialog.getByRole('checkbox', { name: 'Individual Contributor', exact: true }).click()
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click({ force: true })
    await expect(dialog).not.toBeVisible()

    await experienceChip.click()
    dialog = page.getByRole('dialog')
    await expect(
      dialog.getByRole('checkbox', { name: 'Senior Level', exact: true })
    ).toHaveAttribute('aria-checked', 'true')
    await expect(
      dialog.getByRole('checkbox', { name: 'Individual Contributor', exact: true })
    ).toHaveAttribute('aria-checked', 'true')
  })

  test('multiple seniority selections persist after apply', async ({ page }) => {
    await page.goto('/')
    const experienceChip = page.getByRole('button', { name: 'Experience', exact: true })
    await experienceChip.click()

    let dialog = page.getByRole('dialog')
    await dialog.getByRole('checkbox', { name: 'Mid Level', exact: true }).click()
    await dialog.getByRole('checkbox', { name: 'Senior Level', exact: true }).click()
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click({ force: true })
    await expect(dialog).not.toBeVisible()

    await experienceChip.click()
    dialog = page.getByRole('dialog')
    await expect(
      dialog.getByRole('checkbox', { name: 'Mid Level', exact: true })
    ).toHaveAttribute('aria-checked', 'true')
    await expect(
      dialog.getByRole('checkbox', { name: 'Senior Level', exact: true })
    ).toHaveAttribute('aria-checked', 'true')
  })

  test('slider values persist after apply and reopen', async ({ page }) => {
    await page.goto('/')
    const experienceChip = page.getByRole('button', { name: 'Experience', exact: true })
    await experienceChip.click()

    let dialog = page.getByRole('dialog')
    const roleIndustryMin = dialog.getByTestId('experience-role-industry-slider-min')
    const roleIndustryMax = dialog.getByTestId('experience-role-industry-slider-max')
    const managementMin = dialog.getByTestId('experience-management-slider-min')
    const managementMax = dialog.getByTestId('experience-management-slider-max')

    await setSliderValue(roleIndustryMax, 11)
    await setSliderValue(roleIndustryMin, 2)
    await setSliderValue(managementMax, 9)
    await setSliderValue(managementMin, 4)

    await dialog.getByRole('button', { name: 'Apply', exact: true }).click({ force: true })
    await expect(dialog).not.toBeVisible()

    await experienceChip.click()
    dialog = page.getByRole('dialog')
    await expect(dialog.getByTestId('experience-role-industry-slider-min')).toHaveValue('2')
    await expect(dialog.getByTestId('experience-role-industry-slider-max')).toHaveValue('11')
    await expect(dialog.getByTestId('experience-management-slider-min')).toHaveValue('4')
    await expect(dialog.getByTestId('experience-management-slider-max')).toHaveValue('9')
  })

  test('clear all removes selections, yoe bounds, and chip highlight after apply', async ({
    page,
  }) => {
    await page.goto('/')
    const experienceChip = page.getByRole('button', { name: 'Experience', exact: true })

    await experienceChip.click()
    let dialog = page.getByRole('dialog')
    await dialog.getByRole('checkbox', { name: 'Entry Level', exact: true }).click()
    await dialog.getByRole('checkbox', { name: 'People Manager', exact: true }).click()
    await setSliderValue(dialog.getByTestId('experience-role-industry-slider-max'), 8)
    await setSliderValue(dialog.getByTestId('experience-role-industry-slider-min'), 1)
    await setSliderValue(dialog.getByTestId('experience-management-slider-max'), 7)
    await setSliderValue(dialog.getByTestId('experience-management-slider-min'), 2)
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click({ force: true })
    await expect(experienceChip).toHaveClass(/text-primary/)

    await experienceChip.click()
    dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Clear all', exact: true }).click({ force: true })
    await expect(
      dialog.getByRole('checkbox', { name: 'Entry Level', exact: true })
    ).toHaveAttribute('aria-checked', 'false')
    await expect(
      dialog.getByRole('checkbox', { name: 'People Manager', exact: true })
    ).toHaveAttribute('aria-checked', 'false')
    await expect(dialog.getByTestId('experience-role-industry-slider-min')).toHaveValue('0')
    await expect(dialog.getByTestId('experience-role-industry-slider-max')).toHaveValue('20')
    await expect(dialog.getByTestId('experience-management-slider-min')).toHaveValue('0')
    await expect(dialog.getByTestId('experience-management-slider-max')).toHaveValue('20')
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click({ force: true })

    await expect(experienceChip).not.toHaveClass(/text-primary/)
  })
})
