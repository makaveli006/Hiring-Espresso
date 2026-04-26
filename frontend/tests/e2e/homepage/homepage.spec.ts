import { test, expect } from '../../fixtures/app.fixture'
import { ONSITE_JOBS, REMOTE_JOBS } from '../../utils/test-data'

test.describe('Homepage layout', () => {
  test('renders header, filter bar, main content, and footer', async ({ homePage }) => {
    await expect(homePage.header).toBeVisible()
    await expect(homePage.main).toBeVisible()
    await expect(homePage.footer).toBeVisible()
  })

  test('shows "Latest Jobs in India" carousel', async ({ homePage }) => {
    const carousel = homePage.carousel('Latest Jobs in India')
    await expect(carousel).toBeVisible()
  })

  test('shows "Remote Jobs" carousel', async ({ homePage }) => {
    const carousel = homePage.carousel('Remote Jobs')
    await expect(carousel).toBeVisible()
  })

  test('latest jobs carousel contains onsite job titles', async ({ homePage }) => {
    const titles = homePage.jobTitlesInCarousel('Latest Jobs in India')
    await expect(titles).toHaveCount(ONSITE_JOBS.length)
    await expect(titles.first()).toContainText(ONSITE_JOBS[0].title.slice(0, 20))
  })

  test('remote jobs carousel contains remote job titles', async ({ homePage }) => {
    const titles = homePage.jobTitlesInCarousel('Remote Jobs')
    await expect(titles).toHaveCount(REMOTE_JOBS.length)
    await expect(titles.first()).toContainText(REMOTE_JOBS[0].title.slice(0, 20))
  })

  test('each carousel has left and right scroll buttons', async ({ homePage }) => {
    for (const title of ['Latest Jobs in India', 'Remote Jobs']) {
      const carousel = homePage.carousel(title)
      const buttons = carousel.getByRole('button')
      await expect(buttons).toHaveCount(2)
    }
  })

  test('page title is set', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/.+/)
  })
})
