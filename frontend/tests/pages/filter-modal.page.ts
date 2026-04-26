import type { Page, Locator } from '@playwright/test'
import { BasePage } from './base.page'

export class FilterModalPage extends BasePage {
  readonly dialog: Locator
  readonly title: Locator
  readonly locationSearchInput: Locator
  readonly applyButton: Locator

  constructor(page: Page) {
    super(page)
    this.dialog = page.getByRole('dialog')
    this.title = page.getByRole('heading', { name: 'Locations & Environments' })
    this.locationSearchInput = page.getByPlaceholder(
      'Search cities, states, countries, or continents'
    )
    this.applyButton = page.getByRole('button', { name: 'Apply' })
  }

  workplaceCheckbox(type: 'Remote' | 'Hybrid' | 'Onsite'): Locator {
    return this.dialog.getByRole('checkbox', { name: type })
  }

  async close() {
    await this.applyButton.click()
  }
}
