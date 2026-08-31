import { Page, expect } from '@playwright/test'
import type { TestUser } from '../data/users'

export class LoginPage {
  constructor(private page: Page) {}

  async login(user: TestUser) {
    await this.page.goto('/login')
    await this.page.getByTestId('auth-email').fill(user.email)
    await this.page.getByTestId('auth-password').fill(user.password)
    await this.page.getByTestId('auth-submit').click()
    // Wait for navigation to complete
    await this.page.waitForURL((url) => !url.toString().includes('/login'))
    // Wait for user menu to appear (indicates successful login)
    await expect(this.page.getByTestId('nav-user-menu')).toBeVisible()
  }

  async navigateToRegister() {
    await this.page.goto('/register')
  }

  async register(user: Partial<TestUser> & { password: string }) {
    await this.navigateToRegister()
    await this.page.getByTestId('auth-email').fill(user.email || '')
    await this.page.getByTestId('auth-display-name').fill(user.displayName || '')
    await this.page.getByTestId('auth-password').fill(user.password)
    await this.page.getByTestId('auth-submit').click()
    await this.page.waitForURL((url) => !url.toString().includes('/register'))
  }
}
