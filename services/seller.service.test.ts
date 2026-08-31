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

import { listMyProducts, getMyProductById, createProduct, updateProduct, toggleActive, deleteProduct, addProductImage, listMyOrders, updateOrderStatus } from './seller.service'

describe('seller.service', () => {
  beforeEach(() => { mockClient = null })

  it('listMyProducts filtra por seller_id', async () => {
    mockClient = mockSupabase({
      products: {
        data: [
          {
            id: 'p1',
            seller_id: 'seller1',
            title: 'Laptop',
            price: '1299.99',
            product_images: [{ image_path: 'img.jpg', position: 0 }],
          },
        ],
      },
    })
    const products = await listMyProducts('seller1', mockClient)
    expect(products).toHaveLength(1)
    expect(products[0].title).toBe('Laptop')
  })

  it('listMyProducts ordena por created_at descendente', async () => {
    mockClient = mockSupabase({ products: { data: [] } })
    await listMyProducts('seller1', mockClient)
    const calls = mockClient.calls()
    expect(calls[0].order.col).toBe('created_at')
    expect(calls[0].order.ascending).toBe(false)
  })

  it('getMyProductById filtra por id y seller_id', async () => {
    mockClient = mockSupabase({
      products: {
        data: [
          { id: 'p1', seller_id: 'seller1', title: 'Laptop', price: '999.99' },
        ],
      },
    })
    const product = await getMyProductById('seller1', 'p1', mockClient)
    expect(product).not.toBeNull()
    expect(product?.title).toBe('Laptop')
    expect(product?.price).toBe(999.99)
  })

  it('createProduct inserta con datos del input', async () => {
    mockClient = mockSupabase({
      products: {
        data: [
          { id: 'p1', seller_id: 'seller1', title: 'New', price: '500' },
        ],
      },
    })
    const product = await createProduct('seller1', {
      categoryId: 'cat1',
      title: 'New',
      description: 'Desc',
      brand: 'Brand',
      condition: 'new',
      price: 500,
      stock: 10,
    }, mockClient)
    expect(product.title).toBe('New')
    const inserts = mockClient.inserts('products')
    expect(inserts[0].seller_id).toBe('seller1')
  })

  it('updateProduct actualiza campos del producto', async () => {
    mockClient = mockSupabase({
      products: {
        data: [
          { id: 'p1', title: 'Updated', price: '600' },
        ],
      },
    })
    const product = await updateProduct('p1', {
      categoryId: 'cat1',
      title: 'Updated',
      description: 'Desc',
      brand: 'Brand',
      condition: 'like-new',
      price: 600,
      stock: 5,
    }, mockClient)
    expect(product.title).toBe('Updated')
    const updates = mockClient.updates('products')
    expect(updates[0].title).toBe('Updated')
  })

  it('toggleActive actualiza is_active', async () => {
    mockClient = mockSupabase({})
    await toggleActive('p1', false, mockClient)
    const updates = mockClient.updates('products')
    expect(updates[0].is_active).toBe(false)
  })

  it('deleteProduct elimina por id', async () => {
    mockClient = mockSupabase({})
    await deleteProduct('p1', mockClient)
    const calls = mockClient.calls()
    expect(calls[0].operation).toBe('delete')
  })

  it('addProductImage inserta en product_images', async () => {
    mockClient = mockSupabase({
      product_images: {
        data: [
          { id: 'img1', product_id: 'p1', image_path: 'img.jpg', position: 0 },
        ],
      },
    })
    const image = await addProductImage('p1', 'img.jpg', 0, mockClient)
    expect(image.image_path).toBe('img.jpg')
  })

  it('listMyOrders agrupa items por order_id', async () => {
    mockClient = mockSupabase({
      order_items: {
        data: [
          {
            id: 'oi1',
            order_id: 'o1',
            product_id: 'p1',
            title_snapshot: 'Product 1',
            price_snapshot: '100',
            quantity: 2,
            orders: { status: 'entregado', created_at: '2024-08-30' },
          },
          {
            id: 'oi2',
            order_id: 'o1',
            product_id: 'p2',
            title_snapshot: 'Product 2',
            price_snapshot: '50',
            quantity: 1,
            orders: { status: 'entregado', created_at: '2024-08-30' },
          },
        ],
      },
    })
    const orders = await listMyOrders('seller1', mockClient)
    expect(orders).toHaveLength(1)
    expect(orders[0].items).toHaveLength(2)
    expect(orders[0].sellerTotal).toBe(250) // 100*2 + 50*1
  })

  it('updateOrderStatus actualiza order status', async () => {
    mockClient = mockSupabase({})
    await updateOrderStatus('o1', 'enviado', mockClient)
    const updates = mockClient.updates('orders')
    expect(updates[0].status).toBe('enviado')
  })
})
