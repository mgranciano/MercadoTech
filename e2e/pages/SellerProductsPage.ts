import { Page } from '@playwright/test'

export class SellerProductsPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/vendedor/productos')
    await this.page.getByTestId('seller-products-container').waitFor()
  }

  async getProductCount() {
    const products = await this.page.locator('[data-testid^="seller-product-row-"]').count()
    return products
  }

  async getProductName(productIndex: number) {
    const nameCell = this.page.locator('[data-testid^="seller-product-name-"]').nth(productIndex)
    return nameCell.textContent()
  }

  async getProductStatus(productIndex: number) {
    const statusCell = this.page.locator('[data-testid^="seller-product-status-"]').nth(productIndex)
    return statusCell.textContent()
  }

  async getProductStock(productIndex: number) {
    const stockCell = this.page.locator('[data-testid^="seller-product-stock-"]').nth(productIndex)
    return parseInt((await stockCell.textContent()) || '0')
  }

  async editProduct(productIndex: number) {
    const editBtn = this.page.locator('[data-testid^="seller-product-edit-btn-"]').nth(productIndex)
    await editBtn.click()
    await this.page.waitForURL((url) => url.toString().includes('/editar'))
  }

  async toggleProductActive(productIndex: number) {
    const toggleBtn = this.page.locator('[data-testid^="seller-product-toggle-"]').nth(productIndex)
    await toggleBtn.click()
    await this.page.waitForTimeout(300)
  }

  async deleteProduct(productIndex: number) {
    const deleteBtn = this.page.locator('[data-testid^="seller-product-delete-btn-"]').nth(productIndex)
    await deleteBtn.click()
    await this.page.getByTestId('seller-product-confirm-delete-btn').click()
    await this.page.waitForTimeout(300)
  }

  async publishNewProduct() {
    await this.page.getByTestId('seller-publish-new-btn').click()
    await this.page.waitForURL((url) => url.toString().includes('/publicar'))
  }

  async sortByName() {
    await this.page.getByTestId('seller-products-sort-name').click()
  }

  async sortByStock() {
    await this.page.getByTestId('seller-products-sort-stock').click()
  }
}
