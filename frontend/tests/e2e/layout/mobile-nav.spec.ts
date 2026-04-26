import { test, expect } from '@playwright/test'

test.describe('Mobile navigation bar', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('is visible on mobile viewport', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('nav.fixed.bottom-0')).toBeVisible()
  })

  test('has Home link', async ({ page }) => {
    await page.goto('/')
    const nav = page.locator('nav.fixed.bottom-0')
    await expect(nav.locator('a[href="/"]')).toBeVisible()
  })

  test('has Saved link', async ({ page }) => {
    await page.goto('/')
    const nav = page.locator('nav.fixed.bottom-0')
    await expect(nav.locator('a[href="/saved"]')).toBeVisible()
  })

  test('has Messages link', async ({ page }) => {
    await page.goto('/')
    const nav = page.locator('nav.fixed.bottom-0')
    await expect(nav.locator('a[href="/messages"]')).toBeVisible()
  })

  test('has Profile link', async ({ page }) => {
    await page.goto('/')
    const nav = page.locator('nav.fixed.bottom-0')
    await expect(nav.locator('a[href="/profile"]')).toBeVisible()
  })

  test('contains four navigation items', async ({ page }) => {
    await page.goto('/')
    const nav = page.locator('nav.fixed.bottom-0')
    await expect(nav.locator('a')).toHaveCount(4)
  })

  test('Home link is highlighted as active on homepage', async ({ page }) => {
    await page.goto('/')
    const nav = page.locator('nav.fixed.bottom-0')
    const homeLink = nav.locator('a[href="/"]')
    await expect(homeLink).toHaveClass(/text-primary/)
  })
})

test.describe('Mobile navigation bar on desktop', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('is hidden on desktop viewport', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('nav.fixed.bottom-0')).toBeHidden()
  })
})
