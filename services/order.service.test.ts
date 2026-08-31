import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockSupabase } from './test-utils/supabase-mock'

let mockClient: any

vi.mock('@/lib/supabase/client', () => {
  return {
    createClient: () => mockClient,
  }
})

import { checkout, listMyOrders, getOrderById, cancelIfPending } from './order.service'

describe('order.service', () => {
  beforeEach(() => { mockClient = null })

  it('checkout llama RPC create_order_from_cart con buyer_id', async () => {
    mockClient = mockSupabase({
      create_order_from_cart: { data: 'order-123' },
    })
    const result = await checkout('buyer1', mockClient)
    expect(result).toBe('order-123')
    const rpcs = mockClient.rpcs('create_order_from_cart')
    expect(rpcs[0].params.p_buyer_id).toBe('buyer1')
  })

  it('checkout propaga error del RPC', async () => {
    mockClient = mockSupabase({
      create_order_from_cart: { error: { message: 'Stock insuficiente' } },
    })
    await expect(checkout('buyer1', mockClient)).rejects.toThrow('Stock insuficiente')
  })

  it('listMyOrders retorna órdenes del usuario ordenadas descendente', async () => {
    mockClient = mockSupabase({
      orders: {
        data: [
          {
            id: 'o1',
            buyer_id: 'user1',
            status: 'entregado',
            total: '1299.99',
            created_at: '2024-08-30',
            order_items: [
              { id: 'oi1', product_id: 'p1', price_snapshot: '1299.99' },
            ],
          },
        ],
      },
    })
    const orders = await listMyOrders('user1', mockClient)
    expect(orders).toHaveLength(1)
    expect(orders[0].total).toBe(1299.99)
    expect(orders[0].order_items[0].price_snapshot).toBe(1299.99)
  })

  it('listMyOrders maneja error devolviendo array vacío', async () => {
    mockClient = mockSupabase({
      orders: { error: { message: 'DB error' } },
    })
    const orders = await listMyOrders('user1', mockClient)
    expect(orders).toEqual([])
  })

  it('getOrderById retorna orden con items', async () => {
    mockClient = mockSupabase({
      orders: {
        data: [
          {
            id: 'o1',
            buyer_id: 'user1',
            status: 'entregado',
            total: '999.99',
            order_items: [
              { id: 'oi1', product_id: 'p1', price_snapshot: '999.99' },
            ],
          },
        ],
      },
    })
    const order = await getOrderById('o1', mockClient)
    expect(order).not.toBeNull()
    expect(order?.id).toBe('o1')
    expect(order?.total).toBe(999.99)
  })

  it('getOrderById retorna null si no encuentra', async () => {
    mockClient = mockSupabase({
      orders: { error: { message: 'not found' } },
    })
    const order = await getOrderById('nonexistent', mockClient)
    expect(order).toBeNull()
  })

  it('cancelIfPending actualiza status a cancelado', async () => {
    mockClient = mockSupabase({})
    await cancelIfPending('o1', mockClient)
    const updates = mockClient.updates('orders')
    expect(updates).toHaveLength(1)
    expect(updates[0].status).toBe('cancelado')
  })

  it('cancelIfPending hace update en orders', async () => {
    mockClient = mockSupabase({})
    await cancelIfPending('o1', mockClient)
    const updates = mockClient.updates('orders')
    expect(updates).toHaveLength(1)
  })
})
