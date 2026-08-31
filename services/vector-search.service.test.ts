/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockSupabase } from './test-utils/supabase-mock'

let mockClient: any

vi.mock('@/lib/ai/embeddings', () => ({
  generateEmbedding: vi.fn(async () => Array(384).fill(0.1)),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockClient,
}))

import { searchProducts } from './vector-search.service'

describe('vector-search.service', () => {
  beforeEach(() => { mockClient = null })
  it('busca por similitud con RPC match_knowledge', async () => {
    mockClient = mockSupabase({
      match_knowledge: { data: [{ source_id: 'p1', similarity: 0.85 }] },
    })
    await searchProducts('query', mockClient)
    expect(mockClient.rpcs('match_knowledge').length).toBeGreaterThan(0)
  })
})
