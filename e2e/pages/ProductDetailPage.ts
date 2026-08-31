import { Page } from '@playwright/test'

export class ProductDetailPage {
  constructor(private page: Page) {}

  async navigateToProduct(productId: string) {
    await this.page.goto(`/producto/${productId}`)
    await this.page.getByTestId('product-title').waitFor()
  }

  async getTitle() {
    return this.page.getByTestId('product-title').textContent()
  }

  async getPrice() {
    const priceText = await this.page.getByTestId('product-price').textContent()
    return priceText?.trim()
  }

  async getStock() {
    const stockText = await this.page.getByTestId('product-stock').textContent()
    return parseInt(stockText || '0')
  }

  async setQuantity(quantity: number) {
    await this.page.getByTestId('product-quantity-select').selectOption(String(quantity))
  }

  async addToCart() {
    await this.page.getByTestId('product-add-to-cart-btn').click()
    // Wait for toast or confirmation
    await this.page.waitForTimeout(300)
  }

  async toggleFavorite() {
    await this.page.getByTestId('product-favorite-btn').click()
  }

  async viewImage(imageIndex: number) {
    const thumbnail = this.page.locator('[data-testid^="product-image-thumb-"]').nth(imageIndex)
    await thumbnail.click()
  }

  async getAverageRating() {
    const ratingText = await this.page.getByTestId('product-rating').textContent()
    return parseFloat(ratingText || '0')
  }

  async getReviewCount() {
    const countText = await this.page.getByTestId('product-review-count').textContent()
    return parseInt(countText || '0')
  }

  async scrollToReviews() {
    await this.page.getByTestId('product-reviews-section').scrollIntoViewIfNeeded()
  }

  async askQuestion(questionText: string) {
    await this.page.getByTestId('product-question-input').fill(questionText)
    await this.page.getByTestId('product-ask-btn').click()
    await this.page.waitForTimeout(300)
  }
}
