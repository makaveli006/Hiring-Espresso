import { test as base } from '@playwright/test'
import { HomePage } from '../pages/home.page'
import { HeaderPage } from '../pages/header.page'
import { FilterBarPage } from '../pages/filter-bar.page'
import { FilterModalPage } from '../pages/filter-modal.page'
import { mockJobsAPI } from '../utils/api-mocks'

type AppFixtures = {
  homePage: HomePage
  headerPage: HeaderPage
  filterBarPage: FilterBarPage
  filterModalPage: FilterModalPage
}

export const test = base.extend<AppFixtures>({
  homePage: async ({ page }, use) => {
    await mockJobsAPI(page)
    const home = new HomePage(page)
    await home.goto()
    await use(home)
  },
  headerPage: async ({ page }, use) => {
    await mockJobsAPI(page)
    await page.goto('/')
    await use(new HeaderPage(page))
  },
  filterBarPage: async ({ page }, use) => {
    await mockJobsAPI(page)
    await page.goto('/')
    await use(new FilterBarPage(page))
  },
  filterModalPage: async ({ page }, use) => {
    await mockJobsAPI(page)
    await page.goto('/')
    await use(new FilterModalPage(page))
  },
})

export { expect } from '@playwright/test'
