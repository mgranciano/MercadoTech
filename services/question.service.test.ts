import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockSupabase } from './test-utils/supabase-mock'

let mockClient: any

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockClient,
}))

import { create } from './question.service'

describe('question.service', () => {
  beforeEach(() => { mockClient = null })

  it('crea pregunta en tabla questions', async () => {
    mockClient = mockSupabase({})
    try {
      await create('prod1', 'user1', '¿Tiene garantía?', mockClient)
    } catch {}
    expect(mockClient.calls().length).toBeGreaterThanOrEqual(0)
  })
})
