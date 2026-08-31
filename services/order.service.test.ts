import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockSupabase } from './test-utils/supabase-mock'

let mockClient: any

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockClient,
}))

import { checkout } from './order.service'

describe('order.service', () => {
  beforeEach(() => {
    mockClient = null
  })

  it('checkout llama RPC create_order_from_cart', async () => {
    mockClient = mockSupabase({
      create_order_from_cart: { data: 'order-123' },
    })

    const result = await checkout('buyer1', mockClient)

    const rpcs = mockClient.rpcs('create_order_from_cart')
    expect(rpcs).toHaveLength(1)
    expect(rpcs[0].params.p_buyer_id).toBe('buyer1')
  })

})
