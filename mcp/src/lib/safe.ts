// Utilidades de seguridad: validación de entrada, sanitización, límites.

import type { ToolResultContent } from './tool-result.js'
import { errorResult } from './tool-result.js'

export function validateString(
  value: unknown,
  name: string,
  opts: { minLength?: number; maxLength?: number } = {}
): string {
  if (typeof value !== 'string') {
    throw new Error(`${name} debe ser string, recibido ${typeof value}.`)
  }

  const { minLength = 0, maxLength = 10000 } = opts

  if (value.length < minLength) {
    throw new Error(`${name} debe tener al menos ${minLength} caracteres.`)
  }

  if (value.length > maxLength) {
    throw new Error(`${name} no puede exceder ${maxLength} caracteres.`)
  }

  return value
}

export function validateNumber(
  value: unknown,
  name: string,
  opts: { min?: number; max?: number } = {}
): number {
  const num = Number(value)
  if (isNaN(num)) {
    throw new Error(`${name} debe ser un número válido.`)
  }

  const { min, max } = opts
  if (min !== undefined && num < min) {
    throw new Error(`${name} debe ser >= ${min}.`)
  }

  if (max !== undefined && num > max) {
    throw new Error(`${name} debe ser <= ${max}.`)
  }

  return num
}

// Envoltura de seguridad: convierte excepciones de funciones de herramientas
// en ToolResultContent de error.
export function safe<T>(
  handler: (input: T) => Promise<ToolResultContent>
): (input: T) => Promise<ToolResultContent> {
  return async (input: T) => {
    try {
      return await handler(input)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return errorResult(message)
    }
  }
}
