import { test, expect } from '../../fixtures/app.fixture'

test.describe('Search bar', () => {
  test('search input is visible in the header', async ({ headerPage }) => {
    await expect(headerPage.searchInput).toBeVisible()
  })

  test('search input accepts text', async ({ headerPage }) => {
    await headerPage.searchInput.fill('software engineer')
    await expect(headerPage.searchInput).toHaveValue('software engineer')
  })

  test('search input can be cleared', async ({ headerPage }) => {
    await headerPage.searchInput.fill('developer')
    await headerPage.searchInput.clear()
    await expect(headerPage.searchInput).toHaveValue('')
  })

  test('search input has correct placeholder', async ({ headerPage }) => {
    await expect(headerPage.searchInput).toHaveAttribute('placeholder', 'Search')
  })

  test('search input is focusable', async ({ headerPage }) => {
    await headerPage.searchInput.click()
    await expect(headerPage.searchInput).toBeFocused()
  })

  test('typing updates the input value in real time', async ({ headerPage }) => {
    await headerPage.searchInput.pressSequentially('react', { delay: 50 })
    await expect(headerPage.searchInput).toHaveValue('react')
  })
})
