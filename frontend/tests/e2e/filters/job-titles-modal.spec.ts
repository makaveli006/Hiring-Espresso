import { expect, test } from '../../fixtures/app.fixture'

test.describe('Job Titles & Keywords modal', () => {
  test('opens with title, all cards, fields, and helper links', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Job Titles & Keywords', exact: true }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Job Titles & Keywords', exact: true })).toBeVisible()
    await expect(dialog.getByText('Job Title Terms', { exact: true })).toBeVisible()
    await expect(dialog.getByRole('textbox', { name: 'Job title terms', exact: true })).toBeVisible()
    await expect(dialog.getByRole('textbox', { name: 'Job title boolean query', exact: true })).toBeVisible()
    await expect(dialog.getByText('Pro tip: Use "@" to search for job titles.', { exact: true })).toBeVisible()
    await expect(dialog.getByText('Technical Keywords', { exact: true })).toBeVisible()
    await expect(
      dialog.getByRole('textbox', { name: 'Technical keywords terms', exact: true })
    ).toBeVisible()
    await expect(
      dialog.getByRole('textbox', { name: 'Technical keywords boolean query', exact: true })
    ).toBeVisible()
    await expect(
      dialog.getByText('Pro tip: Use "@" to search for available keywords.', { exact: true })
    ).toBeVisible()
    await expect(dialog.getByText('Entire Job Description', { exact: true })).toBeVisible()
    await expect(
      dialog.getByText('Searches across the entire job description.', { exact: true })
    ).toBeVisible()
    await expect(
      dialog.getByRole('textbox', { name: 'Entire job description boolean query', exact: true })
    ).toBeVisible()
    await expect(dialog.getByText('Requirements Keywords', { exact: true })).toBeVisible()
    await expect(
      dialog.getByRole('textbox', { name: 'Requirements keywords boolean query', exact: true })
    ).toBeVisible()

    const links = dialog.getByRole('link', { name: /How boolean queries work/i })
    await expect(links).toHaveCount(4)
    await expect(links.first()).toHaveAttribute(
      'href',
      'https://en.wikipedia.org/wiki/Full-text_search#Boolean_queries'
    )
    await expect(links.first()).toHaveAttribute('target', '_blank')
    await expect(links.first()).toHaveAttribute('rel', 'noopener noreferrer')
    await expect(links.nth(1)).toHaveAttribute(
      'href',
      'https://en.wikipedia.org/wiki/Full-text_search#Boolean_queries'
    )
    await expect(links.nth(2)).toHaveAttribute(
      'href',
      'https://en.wikipedia.org/wiki/Full-text_search#Boolean_queries'
    )
    await expect(links.nth(3)).toHaveAttribute(
      'href',
      'https://en.wikipedia.org/wiki/Full-text_search#Boolean_queries'
    )
  })

  test('apply persists values and highlights chip', async ({ page }) => {
    await page.goto('/')
    const chip = page.getByRole('button', { name: 'Job Titles & Keywords', exact: true })

    await chip.click()
    let dialog = page.getByRole('dialog')
    await dialog.getByRole('textbox', { name: 'Job title terms', exact: true }).fill('Data Engineer')
    await dialog.getByRole('textbox', { name: 'Job title boolean query', exact: true }).fill('data AND engineer')
    await dialog
      .getByRole('textbox', { name: 'Technical keywords terms', exact: true })
      .fill('AWS')
    await dialog
      .getByRole('textbox', { name: 'Technical keywords boolean query', exact: true })
      .fill('aws AND cloud')
    await dialog
      .getByRole('textbox', { name: 'Entire job description boolean query', exact: true })
      .fill('distributed systems')
    await dialog
      .getByRole('textbox', { name: 'Requirements keywords boolean query', exact: true })
      .fill('kubernetes OR docker')
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()

    await expect(chip).toHaveClass(/text-primary/)
    await expect(chip).toHaveClass(/border-primary/)

    await chip.click()
    dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('textbox', { name: 'Job title terms', exact: true })).toHaveValue('Data Engineer')
    await expect(dialog.getByRole('textbox', { name: 'Job title boolean query', exact: true })).toHaveValue('data AND engineer')
    await expect(
      dialog.getByRole('textbox', { name: 'Technical keywords terms', exact: true })
    ).toHaveValue('AWS')
    await expect(
      dialog.getByRole('textbox', { name: 'Technical keywords boolean query', exact: true })
    ).toHaveValue('aws AND cloud')
    await expect(
      dialog.getByRole('textbox', { name: 'Entire job description boolean query', exact: true })
    ).toHaveValue('distributed systems')
    await expect(
      dialog.getByRole('textbox', { name: 'Requirements keywords boolean query', exact: true })
    ).toHaveValue('kubernetes OR docker')
  })

  test('clearing fields removes chip highlight', async ({ page }) => {
    await page.goto('/')
    const chip = page.getByRole('button', { name: 'Job Titles & Keywords', exact: true })

    await chip.click()
    let dialog = page.getByRole('dialog')
    await dialog.getByRole('textbox', { name: 'Job title terms', exact: true }).fill('QA')
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()
    await expect(chip).toHaveClass(/text-primary/)

    await chip.click()
    dialog = page.getByRole('dialog')
    await dialog.getByRole('textbox', { name: 'Job title terms', exact: true }).fill('')
    await dialog.getByRole('textbox', { name: 'Job title boolean query', exact: true }).fill('')
    await dialog.getByRole('textbox', { name: 'Technical keywords terms', exact: true }).fill('')
    await dialog
      .getByRole('textbox', { name: 'Technical keywords boolean query', exact: true })
      .fill('')
    await dialog
      .getByRole('textbox', { name: 'Entire job description boolean query', exact: true })
      .fill('')
    await dialog
      .getByRole('textbox', { name: 'Requirements keywords boolean query', exact: true })
      .fill('')
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()

    await expect(chip).not.toHaveClass(/text-primary/)
    await expect(chip).not.toHaveClass(/border-primary/)
  })
})
