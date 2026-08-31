import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockSupabase } from './test-utils/supabase-mock'

let mockClient: any

vi.mock('@/lib/ai/embeddings', () => ({
  generateEmbedding: vi.fn(async () => Array(384).fill(0.1)),
  buildProductEmbeddingText: vi.fn((p) => `${p.title} from ${p.description}`),
  buildSupportArticleEmbeddingText: vi.fn((a) => `${a.title}: ${a.content}`),
}))

vi.mock('@/lib/supabase/client', () => {
  return {
    createClient: () => mockClient,
  }
})

import { indexProduct, indexSupportArticle, removeEmbedding } from './embedding.service'

describe('embedding.service (Decisión 7 - vi.mock de lib/ai)', () => {
  beforeEach(() => { mockClient = null })

  it('indexProduct consulta producto y hace upsert de embedding', async () => {
    mockClient = mockSupabase({
      products: {
        data: [
          {
            id: 'p1',
            title: 'Laptop',
            description: 'Fast laptop',
            price: '1299',
            categories: { name: 'Electrónica' },
          },
        ],
      },
    })
    await indexProduct(mockClient, 'p1')
    const upserts = mockClient.calls().filter((c: any) => c.operation === 'upsert')
    expect(upserts.length).toBeGreaterThan(0)
  })

  it('indexProduct lanza si producto no existe', async () => {
    mockClient = mockSupabase({
      products: { error: { message: 'not found' } },
    })
    await expect(indexProduct(mockClient, 'nonexistent')).rejects.toThrow()
  })

  it('indexSupportArticle consulta artículo y hace upsert', async () => {
    mockClient = mockSupabase({
      support_articles: {
        data: [
          {
            id: 'a1',
            title: 'FAQ',
            content: 'Questions answered',
          },
        ],
      },
    })
    await indexSupportArticle(mockClient, 'a1')
    const upserts = mockClient.calls().filter((c: any) => c.operation === 'upsert')
    expect(upserts.length).toBeGreaterThan(0)
  })

  it('indexSupportArticle lanza si artículo no existe', async () => {
    mockClient = mockSupabase({
      support_articles: { error: { message: 'not found' } },
    })
    await expect(indexSupportArticle(mockClient, 'nonexistent')).rejects.toThrow()
  })

  it('removeEmbedding borra embedding por source_type y source_id', async () => {
    mockClient = mockSupabase({})
    await removeEmbedding(mockClient, 'producto', 'p1')
    const deletes = mockClient.calls().filter((c: any) => c.operation === 'delete')
    expect(deletes.length).toBeGreaterThan(0)
  })
})
