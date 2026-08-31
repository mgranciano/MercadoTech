import { test, expect } from '../fixtures/test'
import { HomePage } from '../pages/HomePage'

test.describe('Home Page', () => {
  test('home page loads and displays product grid', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.navigate()
    await homePage.isLoaded()

    // Verify grid is visible
    const productGrid = page.getByTestId('shop-product-grid')
    await expect(productGrid).toBeVisible()

    // Verify at least one product is displayed
    const productCount = await homePage.getProductCount()
    expect(productCount).toBeGreaterThan(0)
  })

  test('product count is correct', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.navigate()
    await homePage.isLoaded()

    const count = await homePage.getProductCount()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('navigation menu is visible', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.navigate()
    await homePage.isLoaded()

    // Check for navigation elements
    const homeLink = page.getByTestId('nav-home-link')
    await expect(homeLink).toBeVisible()
  })
})
