import { Page } from '@playwright/test'

export class HomePage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/')
  }

  async isLoaded() {
    await this.page.getByTestId('shop-product-grid').waitFor()
  }

  async getProductCount() {
    const products = await this.page.locator('[data-testid^="shop-product-card-"]').count()
    return products
  }

  async clickProduct(productIndex: number) {
    const product = this.page.locator('[data-testid^="shop-product-card-"]').nth(productIndex)
    await product.click()
  }

  async getProductByName(name: string) {
    return this.page.locator(`[data-testid="shop-product-card-${name}"]`)
  }

  async searchByQuery(query: string) {
    await this.page.getByTestId('shop-search-input').fill(query)
    await this.page.getByTestId('shop-search-submit').click()
    await this.page.waitForTimeout(500) // Wait for results
  }

  async filterByCategory(categorySlug: string) {
    await this.page.getByTestId(`shop-filter-category-${categorySlug}`).click()
  }

  async openCart() {
    await this.page.getByTestId('nav-cart-link-desktop').or(this.page.getByTestId('nav-cart-link-mobile')).first().click()
  }

  async openMyOrders() {
    await this.page.getByTestId('nav-orders-link').click()
  }

  async openSellerDashboard() {
    await this.page.getByTestId('nav-seller-link').click()
  }

  async logout() {
    await this.page.getByTestId('nav-user-menu').click()
    await this.page.getByTestId('nav-logout-btn').click()
  }
}
