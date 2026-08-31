/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import {
  buildRagUserMessage,
  SHOPPING_SYSTEM_INSTRUCTIONS,
  SUPPORT_SYSTEM_INSTRUCTIONS,
} from './prompts'

describe('buildRagUserMessage', () => {
  const query = '¿Cuál es tu mejor laptop para programar?'

  it('retorna mensaje claro cuando no hay fuentes', () => {
    const message = buildRagUserMessage(query, [])
    expect(message).toContain('No se encontró contexto relevante')
    expect(message).toContain(query)
  })

  it('numera fuentes comenzando en 1', () => {
    const sources = [
      { title: 'MacBook Pro M3', content: 'La mejor para desarrollo' },
      { title: 'Dell XPS 15', content: 'Excelente relación precio-rendimiento' },
    ]
    const message = buildRagUserMessage(query, sources)
    expect(message).toContain('[1] MacBook Pro M3')
    expect(message).toContain('[2] Dell XPS 15')
  })

  it('incluye contenido de cada fuente', () => {
    const sources = [{ title: 'Laptop A', content: 'Contenido especial de la fuente' }]
    const message = buildRagUserMessage(query, sources)
    expect(message).toContain('Contenido especial de la fuente')
  })

  it('separa fuentes con doble salto de línea', () => {
    const sources = [
      { title: 'Fuente 1', content: 'Contenido 1' },
      { title: 'Fuente 2', content: 'Contenido 2' },
    ]
    const message = buildRagUserMessage(query, sources)
    expect(message).toContain('[1] Fuente 1\nContenido 1\n\n[2] Fuente 2')
  })

  it('incluye la pregunta del usuario al final', () => {
    const sources = [{ title: 'Laptop', content: 'Especificaciones' }]
    const message = buildRagUserMessage(query, sources)
    expect(message).toContain(`Pregunta del usuario: "${query}"`)
  })

  it('maneja query con caracteres especiales', () => {
    const specialQuery = '¿Cuál es el precio del "XPS"?'
    const sources = [{ title: 'Precio', content: '$1000' }]
    const message = buildRagUserMessage(specialQuery, sources)
    expect(message).toContain(specialQuery)
  })

  it('maneja muchas fuentes', () => {
    const sources = Array.from({ length: 20 }, (_, i) => ({
      title: `Fuente ${i + 1}`,
      content: `Contenido ${i + 1}`,
    }))
    const message = buildRagUserMessage(query, sources)
    for (let i = 1; i <= 20; i++) {
      expect(message).toContain(`[${i}] Fuente ${i}`)
    }
  })

  it('maneja fuentes con contenido muy largo', () => {
    const longContent = 'a'.repeat(5000)
    const sources = [{ title: 'Gran Fuente', content: longContent }]
    const message = buildRagUserMessage(query, sources)
    expect(message).toContain(longContent)
  })

  it('preserva formato de contenido con saltos de línea', () => {
    const content = `Línea 1
Línea 2
Línea 3`
    const sources = [{ title: 'Multilinea', content }]
    const message = buildRagUserMessage(query, sources)
    expect(message).toContain(content)
  })

  it('estructura: Contexto disponible → fuentes numeradas → Pregunta del usuario', () => {
    const sources = [{ title: 'Fuente', content: 'Contenido' }]
    const message = buildRagUserMessage(query, sources)
    const contextIndex = message.indexOf('Contexto disponible:')
    const preguntaIndex = message.indexOf('Pregunta del usuario:')
    expect(contextIndex).toBeLessThan(preguntaIndex)
  })
})

describe('System Instructions - SHOPPING_SYSTEM_INSTRUCTIONS', () => {
  it('contiene instrucción de citar fuentes numeradas', () => {
    expect(SHOPPING_SYSTEM_INSTRUCTIONS).toContain('[')
    expect(SHOPPING_SYSTEM_INSTRUCTIONS).toContain(']')
  })

  it('contiene instrucción de no inventar productos', () => {
    expect(SHOPPING_SYSTEM_INSTRUCTIONS).toContain('Nunca inventes')
  })

  it('contiene instrucción de responder en español', () => {
    expect(SHOPPING_SYSTEM_INSTRUCTIONS).toContain('español')
  })

  it('es una cadena no vacía', () => {
    expect(SHOPPING_SYSTEM_INSTRUCTIONS).toBeTruthy()
    expect(SHOPPING_SYSTEM_INSTRUCTIONS.length).toBeGreaterThan(0)
  })
})

describe('System Instructions - SUPPORT_SYSTEM_INSTRUCTIONS', () => {
  it('contiene instrucción de sugerir crear ticket', () => {
    expect(SUPPORT_SYSTEM_INSTRUCTIONS).toContain('ticket')
  })

  it('contiene instrucción de citar fuentes numeradas', () => {
    expect(SUPPORT_SYSTEM_INSTRUCTIONS).toContain('[')
    expect(SUPPORT_SYSTEM_INSTRUCTIONS).toContain(']')
  })

  it('contiene instrucción de no inventar políticas', () => {
    expect(SUPPORT_SYSTEM_INSTRUCTIONS).toContain('Nunca inventes')
  })

  it('contiene instrucción de respuestas CORTAS', () => {
    expect(SUPPORT_SYSTEM_INSTRUCTIONS).toContain('CORTAS')
  })

  it('contiene instrucción de responder en español', () => {
    expect(SUPPORT_SYSTEM_INSTRUCTIONS).toContain('español')
  })

  it('es una cadena no vacía', () => {
    expect(SUPPORT_SYSTEM_INSTRUCTIONS).toBeTruthy()
    expect(SUPPORT_SYSTEM_INSTRUCTIONS.length).toBeGreaterThan(0)
  })

  it('mencion de agente de voz (sesión 8)', () => {
    expect(SUPPORT_SYSTEM_INSTRUCTIONS).toContain('voz')
  })
})
