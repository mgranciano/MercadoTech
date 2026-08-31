/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockSupabase } from './test-utils/supabase-mock'

let mockClient: any

vi.mock('@/lib/supabase/client', () => {
  return {
    createClient: () => mockClient,
  }
})

import { listByProduct, getAverage, canReview, create } from './review.service'

describe('review.service', () => {
  beforeEach(() => { mockClient = null })

  it('listByProduct retorna reseñas del producto ordenadas descendente', async () => {
    mockClient = mockSupabase({
      reviews: {
        data: [
          { id: 'r1', product_id: 'p1', rating: 5, comment: 'Great', created_at: '2024-08-30' },
          { id: 'r2', product_id: 'p1', rating: 4, comment: 'Good', created_at: '2024-08-29' },
        ],
      },
    })
    const reviews = await listByProduct('p1', mockClient)
    expect(reviews).toHaveLength(2)
    expect(reviews[0].rating).toBe(5)
  })

  it('getAverage calcula promedio de ratings', async () => {
    mockClient = mockSupabase({
      reviews: {
        data: [
          { rating: 5 },
          { rating: 4 },
          { rating: 3 },
        ],
      },
    })
    const result = await getAverage('p1', mockClient)
    expect(result.average).toBe(4)
    expect(result.count).toBe(3)
  })

  it('getAverage devuelve 0 si no hay reseñas', async () => {
    mockClient = mockSupabase({
      reviews: { data: [] },
    })
    const result = await getAverage('p1', mockClient)
    expect(result.average).toBe(0)
    expect(result.count).toBe(0)
  })

  it('canReview retorna false si ya existe reseña', async () => {
    mockClient = mockSupabase({
      reviews: { data: [{ id: 'r1' }] },
    })
    const result = await canReview('p1', 'user1', mockClient)
    expect(result.allowed).toBe(false)
  })

  it('canReview retorna true si hay orden entregada sin reseña', async () => {
    mockClient = mockSupabase({
      reviews: { data: [] },
      order_items: {
        data: [
          {
            order_id: 'o1',
            product_id: 'p1',
            orders: { status: 'entregado', buyer_id: 'user1' },
          },
        ],
      },
    })
    const result = await canReview('p1', 'user1', mockClient)
    expect(result.allowed).toBe(true)
    expect(result.orderId).toBe('o1')
  })

  it('canReview retorna false si no hay orden entregada', async () => {
    mockClient = mockSupabase({
      reviews: { data: [] },
      order_items: {
        data: [
          {
            order_id: 'o1',
            product_id: 'p1',
            orders: { status: 'pendiente', buyer_id: 'user1' },
          },
        ],
      },
    })
    const result = await canReview('p1', 'user1', mockClient)
    expect(result.allowed).toBe(false)
  })

  it('create inserta reseña con todos los campos', async () => {
    mockClient = mockSupabase({
      reviews: {
        data: [
          {
            id: 'r1',
            product_id: 'p1',
            order_id: 'o1',
            buyer_id: 'user1',
            rating: 5,
            comment: 'Excellent',
          },
        ],
      },
    })
    const review = await create(
      {
        productId: 'p1',
        orderId: 'o1',
        buyerId: 'user1',
        rating: 5,
        comment: 'Excellent',
      },
      mockClient
    )
    expect(review.rating).toBe(5)
    expect(review.comment).toBe('Excellent')
    const inserts = mockClient.inserts('reviews')
    expect(inserts).toHaveLength(1)
  })
})
