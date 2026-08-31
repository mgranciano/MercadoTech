/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockSupabase } from './test-utils/supabase-mock'

let mockClient: any

vi.mock('@/services/product.service', () => ({
  mapProductToDetails: vi.fn(async (p) => ({ ...p, price: Number(p.price) })),
}))

vi.mock('@/lib/supabase/client', () => {
  return {
    createClient: () => mockClient,
  }
})

import { isFavorite, toggle, listMine } from './favorite.service'

describe('favorite.service', () => {
  beforeEach(() => { mockClient = null })

  it('isFavorite retorna true si existe favorito', async () => {
    mockClient = mockSupabase({
      favorites: { data: [{ id: 'fav1', product_id: 'p1' }] },
    })
    const result = await isFavorite('p1', 'user1', mockClient)
    expect(result).toBe(true)
  })

  it('isFavorite retorna false si no existe', async () => {
    mockClient = mockSupabase({
      favorites: { data: [] },
    })
    const result = await isFavorite('p1', 'user1', mockClient)
    expect(result).toBe(false)
  })

  it('toggle agrega favorito si no existe', async () => {
    mockClient = mockSupabase({
      favorites: { data: [] },
    })
    const result = await toggle('p1', 'user1', mockClient)
    expect(result).toBe(true)
    const inserts = mockClient.inserts('favorites')
    expect(inserts).toHaveLength(1)
  })

  it('toggle elimina favorito si existe', async () => {
    mockClient = mockSupabase({
      favorites: { data: [{ id: 'fav1' }] },
    })
    const result = await toggle('p1', 'user1', mockClient)
    expect(result).toBe(false)
    const calls = mockClient.calls()
    expect(calls.some((c: any) => c.operation === 'delete')).toBe(true)
  })

  it('listMine retorna favoritos ordenados descendente', async () => {
    mockClient = mockSupabase({
      favorites: {
        data: [
          {
            created_at: '2024-08-30',
            products: {
              id: 'p1',
              title: 'Laptop',
              price: '1299.99',
              product_images: [],
              reviews: [],
            },
          },
          {
            created_at: '2024-08-29',
            products: {
              id: 'p2',
              title: 'Mouse',
              price: '50',
              product_images: [],
              reviews: [],
            },
          },
        ],
      },
    })
    const favorites = await listMine('user1', mockClient)
    expect(favorites).toHaveLength(2)
    expect(favorites[0].title).toBe('Laptop')
  })

  it('listMine filtra productos nulos (no accesibles por RLS)', async () => {
    mockClient = mockSupabase({
      favorites: {
        data: [
          {
            created_at: '2024-08-30',
            products: {
              id: 'p1',
              title: 'Laptop',
              price: '1299.99',
              product_images: [],
              reviews: [],
            },
          },
          {
            created_at: '2024-08-29',
            products: null,
          },
        ],
      },
    })
    const favorites = await listMine('user1', mockClient)
    expect(favorites).toHaveLength(1)
  })
})
