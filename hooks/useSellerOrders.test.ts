/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import { validateStatusTransition } from './useSellerOrders'
import { ORDER_STATUS_FLOW } from '@/lib/constants/orders'

describe('useSellerOrders - kanban transition helper', () => {
  it('permite transición válida: pendiente → pagado', () => {
    expect(validateStatusTransition('pendiente', 'pagado')).toBe(true)
  })

  it('permite transición válida: pagado → enviado', () => {
    expect(validateStatusTransition('pagado', 'enviado')).toBe(true)
  })

  it('permite transición válida: enviado → entregado', () => {
    expect(validateStatusTransition('enviado', 'entregado')).toBe(true)
  })

  it('rechaza salto de dos pasos: pendiente → enviado', () => {
    expect(validateStatusTransition('pendiente', 'enviado')).toBe(false)
  })

  it('rechaza salto hacia atrás: enviado → pagado', () => {
    expect(validateStatusTransition('enviado', 'pagado')).toBe(false)
  })

  it('rechaza status inválido en origen', () => {
    expect(validateStatusTransition('status_inexistente', 'pagado')).toBe(false)
  })

  it('rechaza status inválido en destino', () => {
    expect(validateStatusTransition('pendiente', 'status_inexistente')).toBe(false)
  })

  it('respeta el orden exacto de ORDER_STATUS_FLOW', () => {
    // Verifica que todos los pasos válidos correspondan a +1 en el flow
    const validTransitions = [
      ['pendiente', 'pagado'],
      ['pagado', 'enviado'],
      ['enviado', 'entregado'],
    ]

    for (const [from, to] of validTransitions) {
      const fromIdx = ORDER_STATUS_FLOW.indexOf(from as any)
      const toIdx = ORDER_STATUS_FLOW.indexOf(to as any)
      expect(toIdx).toBe(fromIdx + 1)
    }
  })
})
