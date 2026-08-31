import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockSupabase } from './test-utils/supabase-mock'

let mockClient: any

// Mockear createClient ANTES de importar el service
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockClient,
}))

import { addItem, updateQuantity } from './cart.service'

describe('cart.service (anclas de Decisión 5 y 6.3)', () => {
  beforeEach(() => {
    mockClient = null
  })

  describe('addItem', () => {
    it('inserta producto nuevo', async () => {
      mockClient = mockSupabase({
        products: { single: { stock: 10 } },
        cart_items: { maybeSingle: null },
      })

      await addItem('user1', 'prod1', 3)

      const inserts = mockClient.inserts('cart_items')
      expect(inserts).toHaveLength(1)
      expect(inserts[0].user_id).toBe('user1')
      expect(inserts[0].product_id).toBe('prod1')
      expect(inserts[0].quantity).toBe(3)
    })

    it('suma duplicado y recorta al stock (ANCLA Decisión 5)', async () => {
      // Comportamiento real: 3 + 5 = 8, pero stock=4 → Math.min(8, 4) = 4
      mockClient = mockSupabase({
        products: { single: { stock: 4 } },
        cart_items: { maybeSingle: { id: 'ci1', quantity: 3 } },
      })

      await addItem('user1', 'prod1', 5)

      const updates = mockClient.updates('cart_items')
      expect(updates).toHaveLength(1)
      expect(updates[0].quantity).toBe(4) // El verdadero ancla
    })

    it('suma duplicado SIN recorte si stock es suficiente', async () => {
      mockClient = mockSupabase({
        products: { single: { stock: 100 } },
        cart_items: { maybeSingle: { id: 'ci1', quantity: 10 } },
      })

      await addItem('user1', 'prod1', 20)

      const updates = mockClient.updates('cart_items')
      expect(updates[0].quantity).toBe(30)
    })

    it('recorta cantidad de nuevo item al stock disponible', async () => {
      mockClient = mockSupabase({
        products: { single: { stock: 10 } },
        cart_items: { maybeSingle: null },
      })

      await addItem('user1', 'prod1', 50)

      const inserts = mockClient.inserts('cart_items')
      expect(inserts[0].quantity).toBe(10) // Math.min(50, 10)
    })
  })

  describe('updateQuantity', () => {
    it('actualiza la cantidad del item', async () => {
      mockClient = mockSupabase({})

      await updateQuantity('item1', 5)

      const updates = mockClient.updates('cart_items')
      expect(updates).toHaveLength(1)
      expect(updates[0].quantity).toBe(5)
    })
  })
})
