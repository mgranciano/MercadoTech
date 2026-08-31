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

import { getProductById, listActiveProducts, getProductImages, registerView, mapProductToDetails } from './product.service'

describe('product.service', () => {
  beforeEach(() => { mockClient = null })

  it('mapProductToDetails convierte price string a number', async () => {
    const product = {
      id: 'p1',
      title: 'Laptop',
      price: '1299.99',
      product_images: [],
      reviews: [],
    } as any
    const result = await mapProductToDetails(product)
    expect(result.price).toBe(1299.99)
    expect(typeof result.price).toBe('number')
  })

  it('mapProductToDetails calcula average_rating', async () => {
    const product = {
      id: 'p1',
      title: 'Laptop',
      price: '1000',
      product_images: [],
      reviews: [{ rating: 4 }, { rating: 5 }, { rating: 3 }],
    } as any
    const result = await mapProductToDetails(product)
    expect(result.average_rating).toBe(4)
    expect(result.review_count).toBe(3)
  })

  it('listActiveProducts filtra por is_active', async () => {
    mockClient = mockSupabase({
      products: {
        data: [
          {
            id: 'p1',
            title: 'Laptop',
            price: '1299.99',
            is_active: true,
            product_images: [],
            reviews: [],
          },
        ],
      },
    })
    const result = await listActiveProducts({}, 10, mockClient)
    expect(result.items).toHaveLength(1)
    expect(result.items[0].title).toBe('Laptop')
  })

  it('listActiveProducts aplica filtros de categoría y precio', async () => {
    mockClient = mockSupabase({
      products: { data: [] },
    })
    await listActiveProducts(
      { categoryId: 'cat1', minPrice: 100, maxPrice: 5000 },
      10,
      mockClient
    )
    const calls = mockClient.calls()
    const conditions = calls[0]?.conditions || []
    expect(conditions.some((c: any) => c.col === 'category_id')).toBe(true)
    expect(conditions.some((c: any) => c.col === 'price' && c.type === 'gte')).toBe(true)
    expect(conditions.some((c: any) => c.col === 'price' && c.type === 'lte')).toBe(true)
  })

  it('listActiveProducts ordena por precio descendente', async () => {
    mockClient = mockSupabase({
      products: { data: [] },
    })
    await listActiveProducts({ sort: 'precio_desc' }, 10, mockClient)
    const calls = mockClient.calls()
    expect(calls[0]?.order).toBeDefined()
    expect(calls[0].order.col).toBe('price')
  })

  it('listActiveProducts aplica paginación con range', async () => {
    mockClient = mockSupabase({
      products: { data: [] },
    })
    await listActiveProducts({ page: 2 }, 20, mockClient)
    const calls = mockClient.calls()
    expect(calls[0]?.range).toEqual({ from: 20, to: 39 })
  })

  it('getProductById retorna producto con detalles', async () => {
    mockClient = mockSupabase({
      products: {
        data: [
          {
            id: 'p1',
            title: 'Laptop',
            price: '1299.99',
            product_images: [{ image_path: 'img.jpg', position: 0 }],
            reviews: [{ rating: 5 }],
          },
        ],
      },
    })
    const result = await getProductById('p1', mockClient)
    expect(result).not.toBeNull()
    expect(result?.title).toBe('Laptop')
    expect(result?.price).toBe(1299.99)
  })

  it('getProductById retorna null si no encuentra producto', async () => {
    mockClient = mockSupabase({
      products: { error: { message: 'not found' } },
    })
    const result = await getProductById('nonexistent', mockClient)
    expect(result).toBeNull()
  })

  it('getProductImages retorna imagenes ordenadas por position', async () => {
    mockClient = mockSupabase({
      product_images: {
        data: [
          { id: 'img2', image_path: 'img2.jpg', position: 1 },
          { id: 'img1', image_path: 'img1.jpg', position: 0 },
        ],
      },
    })
    const result = await getProductImages('p1', mockClient)
    expect(result).toHaveLength(2)
    expect(result[0].image_url).toBe('https://example.com/image.jpg')
  })

  it('registerView inserta en product_views', async () => {
    mockClient = mockSupabase({})
    await registerView('p1', 'user1', mockClient)
    const inserts = mockClient.inserts('product_views')
    expect(inserts).toHaveLength(1)
    expect(inserts[0].product_id).toBe('p1')
    expect(inserts[0].user_id).toBe('user1')
  })
})
