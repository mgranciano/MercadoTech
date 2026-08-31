import { Page, expect } from '@playwright/test'
import type { TestUser } from '../data/users'

export class LoginPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/login')
  }

  async login(emailOrUser: string | TestUser, password?: string) {
    const email = typeof emailOrUser === 'string' ? emailOrUser : emailOrUser.email
    const pwd = typeof emailOrUser === 'string' ? password! : emailOrUser.password

    await this.page.goto('/login', { waitUntil: 'networkidle' })

    // Fill and submit form
    await this.page.getByTestId('auth-email').fill(email)
    await this.page.getByTestId('auth-password').fill(pwd)
    await this.page.getByTestId('auth-submit').click()

    // Wait for either successful navigation OR nav menu appearing
    // Try both conditions with reasonable timeout
    const navigationPromise = this.page.waitForURL((url) => !url.toString().includes('/login'), { timeout: 5000 }).catch(() => null)
    const userMenuPromise = this.page.getByTestId('nav-user-menu').waitFor({ timeout: 5000 }).catch(() => null)

    const [navResult, menuResult] = await Promise.allSettled([navigationPromise, userMenuPromise])

    // If user menu appeared, login was successful
    const isLoggedIn = menuResult.status === 'fulfilled' && menuResult.value

    if (!isLoggedIn) {
      // Check if we got an error message
      const errorMsg = await this.page.locator('text=/error|failed|invalid/i').textContent({ timeout: 1000 }).catch(() => null)
      throw new Error(`Login failed for ${email}${errorMsg ? ': ' + errorMsg : ''}`)
    }
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
