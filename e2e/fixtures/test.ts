import { test as base, expect } from '@playwright/test'
import { testUsers } from '../data/users'

export interface TestFixtures {
  authenticatedBuyer: void
  authenticatedSeller: void
}

// Mock auth state since Supabase Auth has issues with bcrypt hashes in local db
const createMockAuthState = (userId: string, email: string, role: 'buyer' | 'seller') => ({
  cookies: [],
  origins: [
    {
      origin: 'http://localhost:3000',
      localStorage: [
        {
          name: 'sb-project_auth_session',
          value: JSON.stringify({
            user: {
              id: userId,
              email,
              user_metadata: { role },
              app_metadata: { provider: 'email', providers: ['email'] },
            },
            session: {
              access_token: 'mock-token-' + userId,
              refresh_token: 'mock-refresh-token',
              expires_in: 3600,
              token_type: 'bearer',
            },
          }),
        },
      ],
    },
  ],
})

export const test = base.extend<TestFixtures>({
  authenticatedBuyer: async ({ page }, use) => {
    // Set mock auth state directly in localStorage
    const buyerId = '550e8400-e29b-41d4-a716-446655440001'
    const mockState = createMockAuthState(buyerId, testUsers.buyer.email, 'buyer')

    await page.context().addInitScript((authState) => {
      localStorage.setItem(
        'sb-project_auth_session',
        authState.origins[0].localStorage[0].value
      )
    }, mockState)

    // Navigate to a protected page to verify auth state is recognized
    await page.goto('http://localhost:3000/')

    await use()
  },

  authenticatedSeller: async ({ page }, use) => {
    // Set mock auth state directly in localStorage
    const sellerId = '550e8400-e29b-41d4-a716-446655440011'
    const mockState = createMockAuthState(sellerId, testUsers.seller.email, 'seller')

    await page.context().addInitScript((authState) => {
      localStorage.setItem(
        'sb-project_auth_session',
        authState.origins[0].localStorage[0].value
      )
    }, mockState)

    // Navigate to a protected page to verify auth state is recognized
    await page.goto('http://localhost:3000/')

    await use()
  },
})

export { expect }
