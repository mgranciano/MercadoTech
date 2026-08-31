import { Page } from '@playwright/test'

export class OrdersPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/pedidos')
    await this.page.getByTestId('orders-container').waitFor({ timeout: 5000 }).catch(() => {})
  }

  async isEmpty() {
    const emptyMessage = await this.page.locator('[data-testid="orders-empty-message"]').isVisible()
    return emptyMessage
  }

  async getOrderCount() {
    const orders = await this.page.locator('[data-testid^="orders-order-card-"]').count()
    return orders
  }

  async getOrderStatus(orderIndex: number) {
    const statusBadge = this.page.locator('[data-testid^="orders-order-status-"]').nth(orderIndex)
    return statusBadge.textContent()
  }

  async getOrderTotal(orderIndex: number) {
    const totalText = this.page.locator('[data-testid^="orders-order-total-"]').nth(orderIndex)
    return totalText.textContent()
  }

  async viewOrderDetails(orderIndex: number) {
    const detailsBtn = this.page.locator('[data-testid^="orders-order-details-btn-"]').nth(orderIndex)
    await detailsBtn.click()
    await this.page.waitForURL((url) => url.toString().includes('/pedidos/'))
  }

  async filterByStatus(status: string) {
    const filterBtn = this.page.getByTestId(`orders-filter-${status}`)
    await filterBtn.click()
    await this.page.waitForTimeout(300)
  }

  async cancelOrder(orderIndex: number) {
    const cancelBtn = this.page.locator('[data-testid^="orders-cancel-btn-"]').nth(orderIndex)
    await cancelBtn.click()
    await this.page.getByTestId('orders-confirm-cancel-btn').click()
    await this.page.waitForTimeout(300)
  }

  async searchOrder(orderId: string) {
    await this.page.getByTestId('orders-search-input').fill(orderId)
    await this.page.waitForTimeout(300)
  }
}
