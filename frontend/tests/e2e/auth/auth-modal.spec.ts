import { test, expect } from '../../fixtures/app.fixture'

test.describe('Auth modal', () => {
  test('"Sign up" button is visible when signed out', async ({ headerPage }) => {
    await expect(headerPage.signUpButton).toBeVisible()
  })

  test('clicking "Sign up" opens a dialog', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Sign up' }).click()
    // Use data-open attribute (base-ui semantic state) instead of CSS visibility
    // because fade-in-0 animation starts at opacity:0 and can race with toBeVisible()
    await expect(page.locator('[role="dialog"]')).toHaveAttribute('data-open', '')
  })

  test('auth dialog can be closed by pressing Escape', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Sign up' }).click()
    await expect(page.locator('[role="dialog"]')).toHaveAttribute('data-open', '')

    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('auth dialog is not open by default', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('"Sign up" button has primary (pink) background', async ({ headerPage }) => {
    await expect(headerPage.signUpButton).toHaveClass(/bg-primary/)
  })

  test('"Sign up" button has pill shape', async ({ headerPage }) => {
    await expect(headerPage.signUpButton).toHaveClass(/rounded-full/)
  })
})

test.describe('Hamburger menu auth items', () => {
  test('clicking "Sign up" in the dropdown opens the sign-up modal', async ({ page }) => {
    await page.goto('/')

    // Open the hamburger dropdown
    await page.getByRole('button', { name: 'Open menu' }).click()

    // The menu items should be visible
    const signUpItem = page.getByRole('menuitem', { name: 'Sign up' })
    await expect(signUpItem).toBeVisible()

    // Click "Sign up" inside the dropdown
    await signUpItem.click()

    // The auth dialog (shadcn wrapper) should be visible
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('clicking "Log in" in the dropdown opens the sign-in modal', async ({ page }) => {
    await page.goto('/')

    // Open the hamburger dropdown
    await page.getByRole('button', { name: 'Open menu' }).click()

    // The menu items should be visible
    const logInItem = page.getByRole('menuitem', { name: 'Log in' })
    await expect(logInItem).toBeVisible()

    // Click "Log in" inside the dropdown
    await logInItem.click()

    // The auth dialog (shadcn wrapper) should be visible
    await expect(page.getByRole('dialog')).toBeVisible()
  })
})
