import { test, expect } from '../../fixtures/app.fixture'

test.describe('Auth modal', () => {
  test('"Sign up" button is visible when signed out', async ({ headerPage }) => {
    await expect(headerPage.signUpButton).toBeVisible()
  })

  test('clicking "Sign up" opens a dialog', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Sign up' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('auth dialog can be closed by pressing Escape', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Sign up' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

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
