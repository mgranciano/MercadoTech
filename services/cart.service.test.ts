/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockSupabase } from './test-utils/supabase-mock'

let mockClient: any

vi.mock('@/services/storage.service', () => ({
  getPublicUrl: vi.fn(async () => 'https://example.com/image.jpg'),
}))

vi.mock('@/lib/supabase/client', () => {
  return {
    createClient: () => mockClient,
  }
})

import { getItems, addItem, updateQuantity, removeItem, clear } from './cart.service'

describe('cart.service', () => {
  beforeEach(() => { mockClient = null })

  it('getItems retorna items del carrito con productos', async () => {
    mockClient = mockSupabase({
      cart_items: {
        data: [
          {
            id: 'ci1',
            product_id: 'p1',
            quantity: 2,
            products: {
              title: 'Laptop',
              price: 1299.99,
              stock: 10,
              is_active: true,
              product_images: [{ image_path: 'img.jpg', position: 0 }],
            },
          },
        ],
      },
    })
    const items = await getItems('user1', mockClient)
    expect(items).toHaveLength(1)
    expect(items[0].productId).toBe('p1')
    expect(items[0].quantity).toBe(2)
    expect(items[0].product?.price).toBe(1299.99)
  })

  it('getItems filtra por user_id y ordena por created_at', async () => {
    mockClient = mockSupabase({
      cart_items: {
        data: [
          {
            id: 'ci1',
            product_id: 'p1',
            quantity: 1,
            products: { title: 'A', price: 100, stock: 10, is_active: true, product_images: [] },
          },
          {
            id: 'ci2',
            product_id: 'p2',
            quantity: 2,
            products: { title: 'B', price: 200, stock: 20, is_active: true, product_images: [] },
          },
        ],
      },
    })
    const items = await getItems('user1', mockClient)
    expect(items).toHaveLength(2)
    expect(mockClient.calls()).toHaveLength(1)
    const call = mockClient.calls()[0]
    expect(call.conditions.some((c: any) => c.col === 'user_id')).toBe(true)
  })

  it('getItems maneja producto nulo en carrito', async () => {
    mockClient = mockSupabase({
      cart_items: {
        data: [
          {
            id: 'ci1',
            product_id: 'p-deleted',
            quantity: 1,
            products: null,
          },
        ],
      },
    })
    const items = await getItems('user1', mockClient)
    expect(items[0].product).toBeNull()
  })

  it('addItem inserta producto nuevo', async () => {
    mockClient = mockSupabase({
      products: { data: [{ id: 'p1', stock: 10 }] },
      cart_items: { data: [] },
    })
    await addItem('user1', 'p1', 3, mockClient)
    const inserts = mockClient.inserts('cart_items')
    expect(inserts).toHaveLength(1)
    expect(inserts[0].quantity).toBe(3)
  })

  it('addItem suma duplicado y recorta al stock', async () => {
    mockClient = mockSupabase({
      products: { data: [{ id: 'p1', stock: 4 }] },
      cart_items: { data: [{ id: 'ci1', quantity: 3 }] },
    })
    await addItem('user1', 'p1', 5, mockClient)
    const updates = mockClient.updates('cart_items')
    expect(updates[0].quantity).toBe(4)
  })

  it('addItem suma sin recorte si stock suficiente', async () => {
    mockClient = mockSupabase({
      products: { data: [{ id: 'p1', stock: 100 }] },
      cart_items: { data: [{ id: 'ci1', quantity: 10 }] },
    })
    await addItem('user1', 'p1', 20, mockClient)
    const updates = mockClient.updates('cart_items')
    expect(updates[0].quantity).toBe(30)
  })

  it('addItem recorta cantidad de nuevo item al stock', async () => {
    mockClient = mockSupabase({
      products: { data: [{ id: 'p1', stock: 10 }] },
      cart_items: { data: [] },
    })
    await addItem('user1', 'p1', 50, mockClient)
    const inserts = mockClient.inserts('cart_items')
    expect(inserts[0].quantity).toBe(10)
  })

  it('updateQuantity actualiza cantidad del item', async () => {
    mockClient = mockSupabase({})
    await updateQuantity('ci1', 5, mockClient)
    const updates = mockClient.updates('cart_items')
    expect(updates).toHaveLength(1)
    expect(updates[0].quantity).toBe(5)
  })

  it('removeItem elimina item con eq(id)', async () => {
    mockClient = mockSupabase({})
    await removeItem('ci1', mockClient)
    expect(mockClient.calls().some((c: any) => c.operation === 'delete')).toBe(true)
  })

  it('clear elimina todos los items del usuario', async () => {
    mockClient = mockSupabase({})
    await clear('user1', mockClient)
    const calls = mockClient.calls()
    expect(calls.some((c: any) => c.operation === 'delete')).toBe(true)
  })
})
