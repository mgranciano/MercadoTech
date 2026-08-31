import { test, expect } from '@playwright/test'

test.describe('Fase 6.6: Seller Negative Cases', () => {
  const BUYER1_EMAIL = 'buyer1@mercadotech.test'
  const BUYER1_PASSWORD = 'MercadoTech123!'

  test('buyer1 cannot access /vendedor/productos (access denied)', async ({ page }) => {
    await test.step('Buyer1 attempts to access seller dashboard', async () => {
      await page.goto('http://localhost:3000/login')
      await page.getByTestId('auth-email').fill(BUYER1_EMAIL)
      await page.getByTestId('auth-password').fill(BUYER1_PASSWORD)
      await page.getByTestId('auth-submit').click()

      // Wait for redirect to home (not login)
      await page.waitForURL('http://localhost:3000/', { timeout: 3000 }).catch(() => {})

      // Try to access seller dashboard
      await page.goto('http://localhost:3000/vendedor/productos')

      // Should redirect away or show error
      const currentUrl = page.url()
      const isNotSellerDashboard = !currentUrl.includes('/vendedor/productos')

      expect(isNotSellerDashboard).toBe(true)
    })
  })
})
