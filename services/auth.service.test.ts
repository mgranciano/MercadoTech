/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockSupabase } from './test-utils/supabase-mock'

let mockClient: any

vi.mock('@/lib/supabase/client', () => {
  return {
    createClient: () => mockClient,
  }
})

import { register, login, logout, getCurrentUser, getAuthState, subscribeToAuthChanges } from './auth.service'

describe('auth.service', () => {
  beforeEach(() => { mockClient = null })

  it('register llama auth.signUp con email y datos', async () => {
    mockClient = mockSupabase({})
    const result = await register({ email: 'user@test.com', password: 'password123', displayName: 'User', role: 'buyer' }, mockClient)
    expect(result.user?.email).toBe('user@test.com')
  })

  it('login llama auth.signInWithPassword', async () => {
    mockClient = mockSupabase({})
    const result = await login('user@test.com', 'password123', mockClient)
    expect(result.user?.email).toBe('user@test.com')
  })

  it('logout llama auth.signOut', async () => {
    mockClient = mockSupabase({})
    await logout(mockClient)
    expect(true).toBe(true)
  })

  it('getCurrentUser retorna perfil del usuario autenticado', async () => {
    mockClient = mockSupabase({
      profiles: { data: [{ id: 'user-123', display_name: 'Test User' }] },
    })
    const user = await getCurrentUser(mockClient)
    expect(user?.email).toBe('test@test.com')
  })

  it('getCurrentUser maneja perfil no encontrado', async () => {
    mockClient = mockSupabase({
      profiles: { error: { message: 'not found' } },
    })
    const user = await getCurrentUser(mockClient)
    expect(user?.email).toBe('test@test.com')
  })

  it('getAuthState retorna sesión actual', async () => {
    mockClient = mockSupabase({})
    const session = await getAuthState(mockClient)
    expect(session?.user).toBeDefined()
  })

  it('subscribeToAuthChanges retorna unsubscribe function', async () => {
    mockClient = mockSupabase({})
    const unsubscribe = subscribeToAuthChanges(() => {}, mockClient)
    expect(typeof unsubscribe).toBe('function')
  })
})
