import { Page } from '@playwright/test'

export class CartPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/carrito')
    await this.page.getByTestId('cart-container').waitFor({ timeout: 5000 }).catch(() => {})
  }

  async isEmpty() {
    const emptyMessage = await this.page.locator('[data-testid="cart-empty-message"]').isVisible()
    return emptyMessage
  }

  async getItemCount() {
    const items = await this.page.locator('[data-testid^="cart-item-"]').count()
    return items
  }

  async getItemQuantity(itemIndex: number) {
    const quantityInput = this.page.locator('[data-testid^="cart-item-quantity-"]').nth(itemIndex)
    const value = await quantityInput.inputValue()
    return parseInt(value || '0')
  }

  async updateItemQuantity(itemIndex: number, quantity: number) {
    const quantityInput = this.page.locator('[data-testid^="cart-item-quantity-"]').nth(itemIndex)
    await quantityInput.fill(String(quantity))
  }

  async removeItem(itemIndex: number) {
    const removeBtn = this.page.locator('[data-testid^="cart-item-remove-"]').nth(itemIndex)
    await removeBtn.click()
    await this.page.waitForTimeout(200)
  }

  async getSubtotal() {
    const subtotalText = await this.page.getByTestId('cart-subtotal').textContent()
    return subtotalText?.trim()
  }

  async getTax() {
    const taxText = await this.page.getByTestId('cart-tax').textContent()
    return taxText?.trim()
  }

  async getTotal() {
    const totalText = await this.page.getByTestId('cart-total').textContent()
    return totalText?.trim()
  }

  async checkout() {
    await this.page.getByTestId('cart-checkout-btn').click()
    await this.page.waitForURL((url) => !url.toString().includes('/carrito'))
  }

  async continueShopping() {
    await this.page.getByTestId('cart-continue-shopping-btn').click()
    await this.page.waitForURL((url) => url.toString() === 'http://localhost:3000/')
  }
}
