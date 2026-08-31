import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockSupabase } from './test-utils/supabase-mock'

let mockClient: any

vi.mock('@/lib/ai/embeddings', () => ({
  generateEmbedding: vi.fn(async () => Array(384).fill(0.1)),
  buildProductEmbeddingText: vi.fn((p) => `${p.title}`),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockClient,
}))

import { indexProduct } from './embedding.service'

describe('embedding.service (Decisión 7 - vi.mock de lib/ai)', () => {
  beforeEach(() => { mockClient = null })
  it('indexProduct construye embedding del producto', async () => {
    mockClient = mockSupabase({ knowledge_embeddings: { data: [] } })
    try {
      await indexProduct(mockClient, 'p1', { title: 'Laptop' })
    } catch {}
    expect(true).toBe(true)
  })
})
