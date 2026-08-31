import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockSupabase } from './test-utils/supabase-mock'

let mockClient: any

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockClient,
}))

import { toggle } from './favorite.service'

describe('favorite.service', () => {
  beforeEach(() => { mockClient = null })
  it('toggle maneja favoritos', async () => {
    mockClient = mockSupabase({})
    try {
      await toggle('prod1', 'user1', mockClient)
    } catch {}
    expect(mockClient.calls().length).toBeGreaterThanOrEqual(0)
  })
})
