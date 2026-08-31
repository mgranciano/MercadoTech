import { test as base, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'
import { testUsers } from '../data/users'

export interface TestFixtures {
  authenticatedBuyer: void
  authenticatedSeller: void
}

export const test = base.extend<TestFixtures>({
  authenticatedBuyer: async ({ page }, use) => {
    const loginPage = new LoginPage(page)
    await loginPage.login(testUsers.buyer)
    await use()
  },

  authenticatedSeller: async ({ page }, use) => {
    const loginPage = new LoginPage(page)
    await loginPage.login(testUsers.seller)
    await use()
  },
})

export { expect }
