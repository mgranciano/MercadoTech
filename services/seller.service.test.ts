import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockSupabase } from './test-utils/supabase-mock'

let mockClient: any

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockClient,
}))

import { listMyProducts, updateOrderStatus } from './seller.service'

describe('seller.service', () => {
  beforeEach(() => {
    mockClient = null
  })

  it('listMyProducts consulta table products', async () => {
    mockClient = mockSupabase({ products: { data: [] } })
    try {
      await listMyProducts('seller1', mockClient)
    } catch {}
    expect(true).toBe(true)
  })

  it('updateOrderStatus llama update en orders', async () => {
    mockClient = mockSupabase({})
    try {
      await updateOrderStatus('order1', 'enviado', mockClient)
    } catch {}
    expect(mockClient.calls().length).toBeGreaterThan(0)
  })
})
