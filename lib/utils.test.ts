import { describe, it, expect } from 'vitest'
import { cn, formatPrice } from './utils'

describe('cn (class merge)', () => {
  it('retorna clases vacías para entrada vacía', () => {
    expect(cn()).toBe('')
  })

  it('retorna clase única', () => {
    expect(cn('px-4')).toBe('px-4')
  })

  it('merge básico de clases', () => {
    expect(cn('px-4 py-2', 'bg-red-500')).toBe('px-4 py-2 bg-red-500')
  })

  it('resuelve conflictos Tailwind (último gana)', () => {
    expect(cn('px-4', 'px-2')).toBe('px-2')
  })

  it('maneja valores undefined y null', () => {
    expect(cn('px-4', undefined, null, 'py-2')).toBe('px-4 py-2')
  })

  it('maneja arrays de clases', () => {
    expect(cn(['px-4', 'py-2'], 'bg-red-500')).toBe('px-4 py-2 bg-red-500')
  })

  it('maneja objetos de clases condicionales', () => {
    expect(cn({ 'px-4': true, 'py-2': false })).toBe('px-4')
  })
})

describe('formatPrice', () => {
  it('formatea 0 correctamente', () => {
    expect(formatPrice(0)).toBe('S/ 0.00')
  })

  it('formatea números positivos simples', () => {
    expect(formatPrice(99.99)).toBe('S/ 99.99')
  })

  it('formatea con separador de miles', () => {
    expect(formatPrice(1299.90)).toBe('S/ 1,299.90')
  })

  it('formatea números grandes con separador de miles', () => {
    expect(formatPrice(129990)).toBe('S/ 129,990.00')
  })

  it('redondea a 2 decimales', () => {
    expect(formatPrice(99.999)).toBe('S/ 100.00')
  })

  it('redondea hacia abajo correctamente', () => {
    expect(formatPrice(99.994)).toBe('S/ 99.99')
  })

  it('maneja números negativos', () => {
    expect(formatPrice(-99.99)).toBe('-S/ 99.99')
  })

  it('maneja números negativos con separador de miles', () => {
    expect(formatPrice(-1299.90)).toBe('-S/ 1,299.90')
  })

  it('acepta entrada string', () => {
    expect(formatPrice('219.00')).toBe('S/ 219.00')
  })

  it('acepta string y convierte correctamente', () => {
    expect(formatPrice('1299.99')).toBe('S/ 1,299.99')
  })

  it('maneja string con miles', () => {
    expect(formatPrice('1000000.00')).toBe('S/ 1,000,000.00')
  })

  it('maneja string negativo', () => {
    expect(formatPrice('-500.00')).toBe('-S/ 500.00')
  })

  it('retorna S/ 0.00 para string inválido', () => {
    expect(formatPrice('notanumber')).toBe('S/ 0.00')
  })

  it('retorna S/ 0.00 para string vacío', () => {
    expect(formatPrice('')).toBe('S/ 0.00')
  })

  it('formatea 1 cent correctamente', () => {
    expect(formatPrice(0.01)).toBe('S/ 0.01')
  })

  it('formatea 1 centavo como string', () => {
    expect(formatPrice('0.01')).toBe('S/ 0.01')
  })

  it('maneja número con muchos decimales en entrada string', () => {
    expect(formatPrice('99.999')).toBe('S/ 100.00')
  })
})
