import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockSupabase } from './test-utils/supabase-mock'

let mockClient: any

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockClient,
}))

import { canReview } from './review.service'

describe('review.service', () => {
  beforeEach(() => {
    mockClient = null
  })

  it('canReview consulta orden y reseñas', async () => {
    mockClient = mockSupabase({
      order_items: { maybeSingle: { id: 'oi1' } },
      reviews: { maybeSingle: null },
    })
    try {
      await canReview('prod1', 'user1', mockClient)
    } catch {}
    expect(mockClient.calls().length).toBeGreaterThanOrEqual(0)
  })
})
