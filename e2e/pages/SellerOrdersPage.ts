import { Page } from '@playwright/test'

export class SellerOrdersPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/vendedor/pedidos')
    await this.page.getByTestId('seller-orders-container').waitFor()
  }

  async getOrderCount() {
    const orders = await this.page.locator('[data-testid^="seller-order-card-"]').count()
    return orders
  }

  async getOrderStatus(orderIndex: number) {
    const statusBadge = this.page.locator('[data-testid^="seller-order-status-"]').nth(orderIndex)
    return statusBadge.textContent()
  }

  async getOrderItemCount(orderIndex: number) {
    const itemCount = this.page.locator('[data-testid^="seller-order-item-count-"]').nth(orderIndex)
    return parseInt((await itemCount.textContent()) || '0')
  }

  async getOrderTotal(orderIndex: number) {
    const totalText = this.page.locator('[data-testid^="seller-order-total-"]').nth(orderIndex)
    return totalText.textContent()
  }

  async viewOrderDetails(orderIndex: number) {
    const detailsBtn = this.page.locator('[data-testid^="seller-order-details-btn-"]').nth(orderIndex)
    await detailsBtn.click()
    await this.page.waitForTimeout(300)
  }

  async changeOrderStatus(orderIndex: number, newStatus: string) {
    const statusSelect = this.page.locator('[data-testid^="seller-order-status-select-"]').nth(orderIndex)
    await statusSelect.selectOption(newStatus)
    await this.page.waitForTimeout(300)
  }

  async filterByStatus(status: string) {
    const filterBtn = this.page.getByTestId(`seller-orders-filter-${status}`)
    await filterBtn.click()
    await this.page.waitForTimeout(300)
  }

  async searchOrder(orderId: string) {
    await this.page.getByTestId('seller-orders-search-input').fill(orderId)
    await this.page.waitForTimeout(300)
  }

  async sortByDate() {
    await this.page.getByTestId('seller-orders-sort-date').click()
  }

  async sortByAmount() {
    await this.page.getByTestId('seller-orders-sort-amount').click()
  }
}
