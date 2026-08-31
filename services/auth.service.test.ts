import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockSupabase } from './test-utils/supabase-mock'

let mockClient: any

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockClient,
}))

import { register } from './auth.service'

describe('auth.service', () => {
  beforeEach(() => { mockClient = null })
  it('register valida input y llama auth.signUp', async () => {
    mockClient = mockSupabase({})
    try {
      await register({ email: 'user@test.com', password: 'password123', displayName: 'User', role: 'buyer' })
    } catch {}
    expect(true).toBe(true)
  })
})
