import type { Page, Locator } from '@playwright/test'
import { BasePage } from './base.page'

export class FilterBarPage extends BasePage {
  readonly container: Locator

  constructor(page: Page) {
    super(page)
    // Second border-b element after the sticky header
    this.container = page.locator('div').filter({ hasText: 'Departments' }).first()
  }

  chip(label: string): Locator {
    return this.container.getByRole('button', { name: label, exact: true })
  }

  isChipActive(label: string): Promise<boolean> {
    return this.chip(label)
      .evaluate((el) => el.classList.contains('text-primary'))
  }
}
