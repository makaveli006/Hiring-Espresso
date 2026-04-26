import type { Page } from '@playwright/test'

export abstract class BasePage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goto(path = '/') {
    await this.page.goto(path)
    await this.page.waitForLoadState('networkidle')
  }
}
