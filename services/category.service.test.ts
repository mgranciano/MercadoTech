/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockSupabase } from './test-utils/supabase-mock'

let mockClient: any

vi.mock('@/lib/supabase/client', () => {
  return {
    createClient: () => mockClient,
  }
})

import { listCategories, getCategoryBySlug } from './category.service'

describe('category.service', () => {
  beforeEach(() => { mockClient = null })

  it('listCategories retorna todas las categorías ordenadas por nombre', async () => {
    mockClient = mockSupabase({
      categories: {
        data: [
          { id: 'c1', name: 'Electrónica', slug: 'electronica' },
          { id: 'c2', name: 'Accesorios', slug: 'accesorios' },
        ],
      },
    })
    const categories = await listCategories(mockClient)
    expect(categories).toHaveLength(2)
    expect(categories[0].name).toBe('Electrónica')
  })

  it('listCategories ordena por name ascendente', async () => {
    mockClient = mockSupabase({
      categories: { data: [] },
    })
    await listCategories(mockClient)
    const calls = mockClient.calls()
    expect(calls[0].order.col).toBe('name')
    expect(calls[0].order.ascending).toBe(true)
  })

  it('getCategoryBySlug filtra por slug', async () => {
    mockClient = mockSupabase({
      categories: {
        data: [
          { id: 'c1', name: 'Electrónica', slug: 'electronica' },
        ],
      },
    })
    const category = await getCategoryBySlug('electronica', mockClient)
    expect(category).not.toBeNull()
    expect(category?.name).toBe('Electrónica')
  })

  it('getCategoryBySlug retorna null si no encuentra', async () => {
    mockClient = mockSupabase({
      categories: { error: { message: 'not found' } },
    })
    const category = await getCategoryBySlug('nonexistent', mockClient)
    expect(category).toBeNull()
  })
})
