/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import { validateLogin, validateRegister, type LoginInput, type RegisterInput } from './auth'

// Constantes extraídas del código bajo prueba (decisión de Sesión 6)
const PASSWORD_MIN_LENGTH = 8
const DISPLAY_NAME_MIN = 2
const DISPLAY_NAME_MAX = 60
const REGISTRABLE_ROLES = ['buyer', 'seller']

describe('validateLogin', () => {
  it('acepta email y password válidos', () => {
    const input: Partial<LoginInput> = {
      email: 'user@example.com',
      password: 'password123',
    }
    expect(validateLogin(input)).toHaveLength(0)
  })

  it('rechaza email vacío', () => {
    const input: Partial<LoginInput> = {
      email: '',
      password: 'password123',
    }
    const errors = validateLogin(input)
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'email' })
    )
  })

  it('rechaza email sin validar (espacio)', () => {
    const input: Partial<LoginInput> = {
      email: '   ',
      password: 'password123',
    }
    const errors = validateLogin(input)
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'email' })
    )
  })

  it('rechaza email inválido (sin @)', () => {
    const input: Partial<LoginInput> = {
      email: 'invalidemail',
      password: 'password123',
    }
    const errors = validateLogin(input)
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'email' })
    )
  })

  it('rechaza email inválido (sin dominio)', () => {
    const input: Partial<LoginInput> = {
      email: 'user@',
      password: 'password123',
    }
    const errors = validateLogin(input)
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'email' })
    )
  })

  it('rechaza password vacío', () => {
    const input: Partial<LoginInput> = {
      email: 'user@example.com',
      password: '',
    }
    const errors = validateLogin(input)
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'password' })
    )
  })

  it('rechaza password menor que 8 caracteres', () => {
    const input: Partial<LoginInput> = {
      email: 'user@example.com',
      password: 'a'.repeat(PASSWORD_MIN_LENGTH - 1),
    }
    const errors = validateLogin(input)
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'password' })
    )
  })

  it('acepta password de exactamente 8 caracteres', () => {
    const input: Partial<LoginInput> = {
      email: 'user@example.com',
      password: 'a'.repeat(PASSWORD_MIN_LENGTH),
    }
    expect(validateLogin(input)).toHaveLength(0)
  })
})

describe('validateRegister', () => {
  const validInput: Partial<RegisterInput> = {
    email: 'user@example.com',
    password: 'password123',
    displayName: 'John Doe',
    role: 'buyer',
  }

  it('acepta registro válido con rol buyer', () => {
    expect(validateRegister(validInput)).toHaveLength(0)
  })

  it('acepta registro válido con rol seller', () => {
    expect(validateRegister({ ...validInput, role: 'seller' })).toHaveLength(0)
  })

  it('rechaza email vacío', () => {
    const errors = validateRegister({ ...validInput, email: '' })
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'email' })
    )
  })

  it('rechaza email inválido', () => {
    const errors = validateRegister({ ...validInput, email: 'notanemail' })
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'email' })
    )
  })

  it('rechaza password vacío', () => {
    const errors = validateRegister({ ...validInput, password: '' })
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'password' })
    )
  })

  it('rechaza password menor que 8 caracteres', () => {
    const errors = validateRegister({
      ...validInput,
      password: 'a'.repeat(PASSWORD_MIN_LENGTH - 1),
    })
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'password' })
    )
  })

  it('acepta password de exactamente 8 caracteres', () => {
    const errors = validateRegister({
      ...validInput,
      password: 'a'.repeat(PASSWORD_MIN_LENGTH),
    })
    expect(errors).toHaveLength(0)
  })

  it('rechaza displayName vacío', () => {
    const errors = validateRegister({ ...validInput, displayName: '' })
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'displayName' })
    )
  })

  it('rechaza displayName con solo espacios', () => {
    const errors = validateRegister({ ...validInput, displayName: '   ' })
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'displayName' })
    )
  })

  it('rechaza displayName menor que 2 caracteres', () => {
    const errors = validateRegister({
      ...validInput,
      displayName: 'a'.repeat(DISPLAY_NAME_MIN - 1),
    })
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'displayName' })
    )
  })

  it('acepta displayName de exactamente 2 caracteres', () => {
    const errors = validateRegister({
      ...validInput,
      displayName: 'a'.repeat(DISPLAY_NAME_MIN),
    })
    expect(errors).toHaveLength(0)
  })

  it('acepta displayName de exactamente 60 caracteres', () => {
    const errors = validateRegister({
      ...validInput,
      displayName: 'a'.repeat(DISPLAY_NAME_MAX),
    })
    expect(errors).toHaveLength(0)
  })

  it('rechaza displayName mayor que 60 caracteres', () => {
    const errors = validateRegister({
      ...validInput,
      displayName: 'a'.repeat(DISPLAY_NAME_MAX + 1),
    })
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'displayName' })
    )
  })

  it('rechaza rol no especificado', () => {
    const errors = validateRegister({ ...validInput, role: undefined })
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'role' })
    )
  })

  it('rechaza rol admin', () => {
    const errors = validateRegister({
      ...validInput,
      role: 'admin' as any,
    })
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'role' })
    )
  })

  it('rechaza rol inválido', () => {
    const errors = validateRegister({
      ...validInput,
      role: 'invalid' as any,
    })
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'role' })
    )
  })

  it('retorna múltiples errores', () => {
    const errors = validateRegister({
      email: 'invalidemail',
      password: 'short',
      displayName: 'x',
      role: 'admin' as any,
    })
    expect(errors.length).toBeGreaterThanOrEqual(4)
    expect(errors.map((e) => e.field)).toEqual(
      expect.arrayContaining(['email', 'password', 'displayName', 'role'])
    )
  })
})
