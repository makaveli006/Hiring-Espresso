import type { Page, Locator } from '@playwright/test'
import { BasePage } from './base.page'

export class HeaderPage extends BasePage {
  readonly logo: Locator
  readonly searchInput: Locator
  readonly locationPill: Locator
  readonly signUpButton: Locator
  readonly menuButton: Locator

  constructor(page: Page) {
    super(page)
    this.logo = page.locator('header a[href="/"]')
    this.searchInput = page.getByPlaceholder('Search')
    this.locationPill = page.locator('header button').filter({ hasText: 'India' })
    this.signUpButton = page.getByRole('button', { name: 'Sign up' })
    this.menuButton = page.getByRole('button', { name: 'Open menu' })
  }
}
