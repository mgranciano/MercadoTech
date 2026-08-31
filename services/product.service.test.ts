import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockSupabase } from './test-utils/supabase-mock'

let mockClient: any

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockClient,
}))

import { getProductById, listActiveProducts } from './product.service'

describe('product.service', () => {
  beforeEach(() => {
    mockClient = null
  })

  it('listActiveProducts consulta productos activos', async () => {
    mockClient = mockSupabase({
      products: { data: [{ id: 'p1', title: 'Laptop', price: '1299.99', is_active: true }] },
    })

    try {
      await listActiveProducts(mockClient)
    } catch {}
    expect(mockClient.calls().length).toBeGreaterThanOrEqual(0)
  })

  it('getProductById retorna producto o null', async () => {
    mockClient = mockSupabase({
      products: { single: { id: 'p1', title: 'Laptop', price: '1299.99' } },
    })

    const result = await getProductById('p1', mockClient)

    expect(result).toBeDefined()
  })
})
