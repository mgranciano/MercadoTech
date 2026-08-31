import { describe, it, expect } from 'vitest'
import { validateProduct, type ProductFormValues } from './product'
import { TITLE_MIN, TITLE_MAX, MAX_IMAGES_PER_PRODUCT } from '@/lib/constants/product'

describe('validateProduct', () => {
  const validProduct: ProductFormValues = {
    title: 'Laptop Dell XPS 13',
    description: 'High-performance laptop',
    brand: 'Dell',
    categoryId: 'cat-1',
    condition: 'nuevo',
    price: '1299.99',
    stock: '5',
  }

  it('acepta producto válido completo', () => {
    expect(validateProduct(validProduct, 1)).toHaveLength(0)
  })

  it('rechaza título vacío', () => {
    const errors = validateProduct({ ...validProduct, title: '' }, 1)
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'title' })
    )
  })

  it('rechaza título con solo espacios', () => {
    const errors = validateProduct({ ...validProduct, title: '   ' }, 1)
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'title' })
    )
  })

  it('rechaza título menor que TITLE_MIN', () => {
    const errors = validateProduct(
      { ...validProduct, title: 'a'.repeat(TITLE_MIN - 1) },
      1
    )
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'title' })
    )
  })

  it('acepta título de exactamente TITLE_MIN caracteres', () => {
    const errors = validateProduct(
      { ...validProduct, title: 'a'.repeat(TITLE_MIN) },
      1
    )
    expect(errors).toHaveLength(0)
  })

  it('acepta título de exactamente TITLE_MAX caracteres', () => {
    const errors = validateProduct(
      { ...validProduct, title: 'a'.repeat(TITLE_MAX) },
      1
    )
    expect(errors).toHaveLength(0)
  })

  it('rechaza título mayor que TITLE_MAX', () => {
    const errors = validateProduct(
      { ...validProduct, title: 'a'.repeat(TITLE_MAX + 1) },
      1
    )
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'title' })
    )
  })

  it('rechaza precio vacío', () => {
    const errors = validateProduct({ ...validProduct, price: '' }, 1)
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'price' })
    )
  })

  it('rechaza precio 0', () => {
    const errors = validateProduct({ ...validProduct, price: '0' }, 1)
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'price' })
    )
  })

  it('rechaza precio negativo', () => {
    const errors = validateProduct({ ...validProduct, price: '-100' }, 1)
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'price' })
    )
  })

  it('rechaza precio NaN', () => {
    const errors = validateProduct({ ...validProduct, price: 'notanumber' }, 1)
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'price' })
    )
  })

  it('acepta precio válido positivo', () => {
    const errors = validateProduct({ ...validProduct, price: '99.99' }, 1)
    expect(errors).toHaveLength(0)
  })

  it('rechaza stock vacío', () => {
    const errors = validateProduct({ ...validProduct, stock: '' }, 1)
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'stock' })
    )
  })

  it('rechaza stock negativo', () => {
    const errors = validateProduct({ ...validProduct, stock: '-5' }, 1)
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'stock' })
    )
  })

  it('rechaza stock decimal', () => {
    const errors = validateProduct({ ...validProduct, stock: '5.5' }, 1)
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'stock' })
    )
  })

  it('rechaza stock NaN', () => {
    const errors = validateProduct({ ...validProduct, stock: 'notanumber' }, 1)
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'stock' })
    )
  })

  it('acepta stock 0', () => {
    const errors = validateProduct({ ...validProduct, stock: '0' }, 1)
    expect(errors).toHaveLength(0)
  })

  it('acepta stock positivo válido', () => {
    const errors = validateProduct({ ...validProduct, stock: '100' }, 1)
    expect(errors).toHaveLength(0)
  })

  it('rechaza sin categoría', () => {
    const errors = validateProduct({ ...validProduct, categoryId: '' }, 1)
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'categoryId' })
    )
  })

  it('rechaza sin imágenes', () => {
    const errors = validateProduct(validProduct, 0)
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'images' })
    )
  })

  it('acepta con una imagen', () => {
    const errors = validateProduct(validProduct, 1)
    expect(errors).toHaveLength(0)
  })

  it('acepta con MAX_IMAGES_PER_PRODUCT imágenes', () => {
    const errors = validateProduct(validProduct, MAX_IMAGES_PER_PRODUCT)
    expect(errors).toHaveLength(0)
  })

  it('rechaza con más de MAX_IMAGES_PER_PRODUCT imágenes', () => {
    const errors = validateProduct(validProduct, MAX_IMAGES_PER_PRODUCT + 1)
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'images' })
    )
  })

  it('retorna múltiples errores simultáneamente', () => {
    const errors = validateProduct(
      {
        title: 'a',
        description: '',
        brand: '',
        categoryId: '',
        condition: '',
        price: '-100',
        stock: '-5',
      },
      0
    )
    expect(errors.length).toBeGreaterThanOrEqual(5)
    expect(errors.map((e) => e.field)).toEqual(
      expect.arrayContaining(['title', 'price', 'stock', 'categoryId', 'images'])
    )
  })
})
