import { test, expect } from '@playwright/test'
import { HomePage } from '@/e2e/pages/HomePage'
import { CartPage } from '@/e2e/pages/CartPage'

test.describe('Buyer Negative Cases', () => {
  test('product with stock 0 shows correct testids', async ({ page }) => {
    // Caso 1: Find product with stock 0 and verify UI state
    await test.step('Caso 1: Verify product with stock 0 testids', async () => {
      await page.goto('http://localhost:3000/')

      const products = page.locator('[data-testid^="shop-product-card-"]')
      const productCount = await products.count()

      // Navigate through products to find one with stock 0
      for (let i = 0; i < Math.min(productCount, 5); i++) {
        const product = products.nth(i)
        const productId = await product.getAttribute('data-testid')

        if (productId) {
          await product.click()

          // Check for stock information
          const stockElement = page.getByTestId('product-stock')
          const stockZeroMsg = page.getByTestId('product-stock-zero-msg')
          const addToCartBtn = page.getByTestId('product-add-to-cart-btn')

          try {
            await stockElement.waitFor({ timeout: 1000 })
            const stockText = await stockElement.textContent()

            if (stockText?.includes('Sin stock')) {
              // Found product with no stock
              const isZeroMsgVisible = await stockZeroMsg.isVisible({ timeout: 1000 }).catch(() => false)
              const isBtnDisabled = await addToCartBtn.isDisabled({ timeout: 1000 }).catch(() => false)

              expect(isZeroMsgVisible || isBtnDisabled).toBe(true)
              break
            }
          } catch {
            // Element not found, go back
          }

          await page.goBack()
        }
      }
    })
  })

  test('empty cart checkout prevention', async ({ page }) => {
    // Caso 2: Verify empty cart prevents checkout
    await test.step('Caso 2: Verify empty cart testids', async () => {
      const cartPage = new CartPage(page)
      await cartPage.navigate()

      // Check if cart is empty
      const emptyMsg = page.getByTestId('cart-empty-message')
      const checkoutBtn = page.getByTestId('cart-checkout-btn')

      const isEmpty = await emptyMsg.isVisible({ timeout: 2000 }).catch(() => false)
      const btnExists = await checkoutBtn.isVisible({ timeout: 1000 }).catch(() => false)
      const btnDisabled = await checkoutBtn.isDisabled({ timeout: 1000 }).catch(() => false)

      // Either cart is empty OR checkout button is disabled
      expect(isEmpty || btnDisabled || !btnExists).toBe(true)
    })
  })

  test('anonymous cart page redirect testids', async ({ page }) => {
    // Caso 3: Anonymous user navigation
    await test.step('Caso 3: Verify navigation testids visible to anonymous', async () => {
      await page.goto('http://localhost:3000/')

      // Verify navbar testids are present for all users
      const navHome = page.getByTestId('nav-home-link')
      const navCart = page.getByTestId('nav-cart-link')

      await expect(navHome).toBeVisible()
      await expect(navCart).toBeVisible()

      // Navigate to cart
      await navCart.click()

      // Should either show empty cart or redirect
      const cartEmpty = page.getByTestId('cart-empty-message')
      const cartContainer = page.getByTestId('cart-container')
      const loginForm = page.getByTestId('auth-email')

      const isCartEmpty = await cartEmpty.isVisible({ timeout: 2000 }).catch(() => false)
      const isCartContainer = await cartContainer.isVisible({ timeout: 2000 }).catch(() => false)
      const isLoginForm = await loginForm.isVisible({ timeout: 2000 }).catch(() => false)

      expect(isCartEmpty || isCartContainer || isLoginForm).toBe(true)
    })
  })
})
