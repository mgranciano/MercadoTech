import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockSupabase } from './test-utils/supabase-mock'

let mockClient: any

vi.mock('@/lib/supabase/client', () => {
  return {
    createClient: () => mockClient,
  }
})

import { getPublicUrl, uploadProductImage, deleteProductImage, saveImageOrder } from './storage.service'

describe('storage.service', () => {
  beforeEach(() => { mockClient = null })

  it('getPublicUrl devuelve URL pública del archivo', async () => {
    mockClient = mockSupabase({})
    const url = await getPublicUrl('product-images', 'seller1/prod1/img.jpg', mockClient)
    expect(url).toContain('product-images/seller1/prod1/img.jpg')
  })

  it('uploadProductImage construye path con seller/product/position', async () => {
    mockClient = mockSupabase({})
    const file = new File(['data'], 'image.jpg', { type: 'image/jpeg' })
    const path = await uploadProductImage(file, 'seller1', 'prod1', 0, mockClient)
    expect(path).toBe('seller1/prod1/0.jpg')
  })

  it('uploadProductImage extrae extensión del archivo', async () => {
    mockClient = mockSupabase({})
    const file = new File(['data'], 'photo.png', { type: 'image/png' })
    const path = await uploadProductImage(file, 'seller1', 'prod1', 1, mockClient)
    expect(path).toContain('.png')
  })

  it('deleteProductImage borra archivo y registro de BD', async () => {
    mockClient = mockSupabase({})
    await deleteProductImage('seller1/prod1/0.jpg', mockClient)
    const deletes = mockClient.calls().filter((c: any) => c.operation === 'delete')
    expect(deletes.length).toBeGreaterThan(0)
  })

  it('saveImageOrder hace upsert de todas las imágenes', async () => {
    mockClient = mockSupabase({})
    const items = [
      { id: 'img1', product_id: 'p1', image_path: 'seller1/p1/0.jpg', position: 0 },
      { id: 'img2', product_id: 'p1', image_path: 'seller1/p1/1.jpg', position: 1 },
    ]
    await saveImageOrder(items, mockClient)
    const upserts = mockClient.calls().filter((c: any) => c.operation === 'upsert')
    expect(upserts.length).toBeGreaterThan(0)
  })
})
