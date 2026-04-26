import type { Page, Locator } from '@playwright/test'
import { BasePage } from './base.page'

export class HomePage extends BasePage {
  readonly header: Locator
  readonly main: Locator
  readonly footer: Locator

  constructor(page: Page) {
    super(page)
    this.header = page.locator('header')
    this.main = page.locator('main')
    this.footer = page.locator('footer')
  }

  async goto() {
    await super.goto('/')
  }

  carousel(title: string): Locator {
    return this.page.locator('section').filter({
      has: this.page.getByRole('heading', { name: title, level: 2 }),
    })
  }

  jobTitlesInCarousel(carouselTitle: string): Locator {
    return this.carousel(carouselTitle).getByRole('heading', { level: 3 })
  }

  scrollCarouselRight(carouselTitle: string): Promise<void> {
    return this.carousel(carouselTitle)
      .getByRole('button')
      .last()
      .click()
  }

  scrollCarouselLeft(carouselTitle: string): Promise<void> {
    return this.carousel(carouselTitle)
      .getByRole('button')
      .nth(-2)
      .click()
  }
}
