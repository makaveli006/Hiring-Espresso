import { test, expect } from '../../fixtures/app.fixture'
import { ONSITE_JOBS, REMOTE_JOBS } from '../../utils/test-data'

test.describe('Job cards', () => {
  test('onsite job cards render with title and company', async ({ page }) => {
    await page.goto('/')
    for (const job of ONSITE_JOBS) {
      const card = page.locator('section').filter({ hasText: 'Latest Jobs in India' })
      await expect(card.getByRole('heading', { level: 3 }).filter({ hasText: job.title.slice(0, 15) })).toBeVisible()
    }
  })

  test('remote job cards render with title and company', async ({ page }) => {
    await page.goto('/')
    for (const job of REMOTE_JOBS) {
      const card = page.locator('section').filter({ hasText: 'Remote Jobs' })
      await expect(card.getByRole('heading', { level: 3 }).filter({ hasText: job.title.slice(0, 15) })).toBeVisible()
    }
  })

  test('job card shows workplace type badge', async ({ page }) => {
    await page.goto('/')
    // First onsite card should have "Onsite" badge
    const onsiteCarousel = page.locator('section').filter({ hasText: 'Latest Jobs in India' })
    await expect(onsiteCarousel.getByText('Onsite').first()).toBeVisible()

    // First remote card should have "Remote" badge
    const remoteCarousel = page.locator('section').filter({ hasText: 'Remote Jobs' })
    await expect(remoteCarousel.getByText('Remote').first()).toBeVisible()
  })

  test('job card shows commitment badge', async ({ page }) => {
    await page.goto('/')
    const carousel = page.locator('section').filter({ hasText: 'Latest Jobs in India' })
    await expect(carousel.getByText('Full Time').first()).toBeVisible()
  })

  test('job card shows company name', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Wipro').first()).toBeVisible()
    await expect(page.getByText('Cognizant').first()).toBeVisible()
  })

  test('job card shows posted time ago', async ({ page }) => {
    await page.goto('/')
    // Time-ago format: "3h" or "1d"
    const carousel = page.locator('section').filter({ hasText: 'Latest Jobs in India' })
    const firstCard = carousel.locator('.w-72').first()
    await expect(firstCard.locator('span').filter({ hasText: /\d+[hd]/ })).toBeVisible()
  })

  test('job card shows YOE badge when experience specified', async ({ page }) => {
    await page.goto('/')
    // Wipro DATA ANALYST has yoe_min: 5, yoe_max: 8 -> "5-8+ YOE"
    await expect(page.getByText(/5-8\+ YOE/).first()).toBeVisible()
  })

  test('save button toggles job saved state', async ({ page }) => {
    await page.goto('/')
    const carousel = page.locator('section').filter({ hasText: 'Latest Jobs in India' })
    const firstCard = carousel.locator('.w-72').first()
    const saveButton = firstCard.getByRole('button', { name: 'Save job' })

    await expect(saveButton).toBeVisible()
    await saveButton.click()
    await expect(firstCard.getByRole('button', { name: 'Unsave job' })).toBeVisible()
  })

  test('saved job button can be toggled back to unsaved', async ({ page }) => {
    await page.goto('/')
    const carousel = page.locator('section').filter({ hasText: 'Latest Jobs in India' })
    const firstCard = carousel.locator('.w-72').first()

    await firstCard.getByRole('button', { name: 'Save job' }).click()
    await firstCard.getByRole('button', { name: 'Unsave job' }).click()
    await expect(firstCard.getByRole('button', { name: 'Save job' })).toBeVisible()
  })

  test('save state persists across page reload (localStorage)', async ({ page }) => {
    await page.goto('/')
    const carousel = page.locator('section').filter({ hasText: 'Latest Jobs in India' })
    const firstCard = carousel.locator('.w-72').first()

    await firstCard.getByRole('button', { name: 'Save job' }).click()
    await page.reload()
    await page.waitForLoadState('networkidle')

    const reloadedCarousel = page.locator('section').filter({ hasText: 'Latest Jobs in India' })
    const reloadedCard = reloadedCarousel.locator('.w-72').first()
    await expect(reloadedCard.getByRole('button', { name: 'Unsave job' })).toBeVisible()
  })

  test('job posting link opens correctly', async ({ page }) => {
    await page.goto('/')
    const carousel = page.locator('section').filter({ hasText: 'Latest Jobs in India' })
    const firstCard = carousel.locator('.w-72').first()
    const postingLink = firstCard.getByRole('link', { name: 'Job Posting' })
    await expect(postingLink).toBeVisible()
    await expect(postingLink).toHaveAttribute('target', '_blank')
  })
})
