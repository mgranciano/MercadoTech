/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import { buildContext, type ContextCandidate } from './context-builder'
import {
  CONTEXT_BUILDER_DEFAULT_MAX_SOURCES,
  CONTEXT_BUILDER_DEFAULT_MIN_SIMILARITY,
  CONTEXT_BUILDER_MIN_CONTENT_LENGTH,
  CONTEXT_BUILDER_DEFAULT_MAX_CONTEXT_CHARS,
  CONTEXT_BUILDER_MIN_TRUNCATED_SOURCE_CHARS,
} from '@/lib/constants/ai'

describe('buildContext (context builder puro)', () => {
  const query = '¿Cuál es la política de devoluciones?'

  const createCandidate = (
    overrides: Partial<ContextCandidate> = {}
  ): ContextCandidate => ({
    source_type: 'articulo_soporte',
    source_id: 'src-1',
    content: 'Este es un artículo de ayuda con información relevante sobre política de devoluciones.',
    metadata: { title: 'Política de Devoluciones' },
    similarity: 0.85,
    ...overrides,
  })

  it('retorna mensaje sin fuentes cuando la lista está vacía', () => {
    const result = buildContext(query, [])
    expect(result.userMessage).toContain('No se encontró contexto relevante')
    expect(result.sources).toHaveLength(0)
    expect(result.stats.contextTruncated).toBe(false)
    expect(result.stats.totalChars).toBe(0)
  })

  it('filtra candidatos bajo la similitud mínima', () => {
    const candidates = [
      createCandidate({ similarity: 0.2 }), // Bajo el umbral
      createCandidate({ similarity: 0.85 }), // Sobre el umbral
    ]
    const result = buildContext(query, candidates)
    expect(result.sources).toHaveLength(1)
    expect(result.sources[0].similarity).toBe(0.85)
  })

  it('filtra candidatos con contenido menor que el mínimo', () => {
    const candidates = [
      createCandidate({
        content: 'Muy corto',
        similarity: 0.85,
      }), // Bajo CONTEXT_BUILDER_MIN_CONTENT_LENGTH
      createCandidate({
        content: 'Este es un contenido que tiene suficientes caracteres para pasar el filtro de longitud mínima.',
        similarity: 0.85,
      }),
    ]
    const result = buildContext(query, candidates)
    expect(result.sources).toHaveLength(1)
  })

  it('ordena candidatos por similitud descendente', () => {
    const candidates = [
      createCandidate({ source_id: 'src-1', similarity: 0.6 }),
      createCandidate({ source_id: 'src-2', similarity: 0.9 }),
      createCandidate({ source_id: 'src-3', similarity: 0.75 }),
    ]
    const result = buildContext(query, candidates)
    expect(result.sources[0].source_id).toBe('src-2') // 0.9
    expect(result.sources[1].source_id).toBe('src-3') // 0.75
    expect(result.sources[2].source_id).toBe('src-1') // 0.6
  })

  it('respeta maxSources y corta el resto', () => {
    const candidates = Array.from({ length: 10 }, (_, i) =>
      createCandidate({
        source_id: `src-${i}`,
        similarity: 0.9 - i * 0.01, // Descendente
      })
    )
    const result = buildContext(query, candidates, {
      maxSources: 3,
    })
    expect(result.sources).toHaveLength(3)
  })

  it('acumula caracteres hasta alcanzar el presupuesto', () => {
    const charPerSource = 100
    const candidates = [
      createCandidate({
        source_id: 'src-1',
        content: 'a'.repeat(charPerSource),
        similarity: 0.9,
      }),
      createCandidate({
        source_id: 'src-2',
        content: 'b'.repeat(charPerSource),
        similarity: 0.85,
      }),
      createCandidate({
        source_id: 'src-3',
        content: 'c'.repeat(charPerSource),
        similarity: 0.8,
      }),
    ]
    const result = buildContext(query, candidates, {
      maxContextChars: 250, // Entra src-1 y src-2, pero no src-3
    })
    expect(result.sources).toHaveLength(2)
    expect(result.stats.totalChars).toBe(charPerSource * 2)
  })

  it('trunca última fuente si cabe completamente en el presupuesto restante', () => {
    const candidates = [
      createCandidate({
        source_id: 'src-1',
        content: 'a'.repeat(400),
        similarity: 0.9,
      }),
      createCandidate({
        source_id: 'src-2',
        content: 'b'.repeat(300),
        similarity: 0.85,
      }),
    ]
    const result = buildContext(query, candidates, {
      maxContextChars: 500, // 400 + 100 restante para src-2
      minTruncatedSourceChars: 100,
    })
    // src-1 entra completo (400), queda 100 caracteres, src-2 se trunca a 100
    expect(result.sources).toHaveLength(2)
    expect(result.stats.contextTruncated).toBe(true)
  })

  it('descarta última fuente si lo que resta es menor que minTruncatedSourceChars', () => {
    const candidates = [
      createCandidate({
        source_id: 'src-1',
        content: 'a'.repeat(400),
        similarity: 0.9,
      }),
      createCandidate({
        source_id: 'src-2',
        content: 'b'.repeat(300),
        similarity: 0.85,
      }),
    ]
    const result = buildContext(query, candidates, {
      maxContextChars: 450, // 400 + 50 restante < minTruncatedSourceChars (200)
      minTruncatedSourceChars: 200,
    })
    // src-1 entra completo (400), queda 50 chars < 200, src-2 se descarta entera
    expect(result.sources).toHaveLength(1)
    expect(result.sources[0].source_id).toBe('src-1')
    expect(result.stats.contextTruncated).toBe(true)
  })

  it('marca contextTruncated como true cuando se trunca', () => {
    const candidates = [
      createCandidate({
        source_id: 'src-1',
        content: 'a'.repeat(200),
        similarity: 0.9,
      }),
      createCandidate({
        source_id: 'src-2',
        content: 'b'.repeat(200),
        similarity: 0.85,
      }),
    ]
    const result = buildContext(query, candidates, {
      maxContextChars: 300, // Presupuesto alcanzado, src-2 no entra
    })
    expect(result.stats.contextTruncated).toBe(true)
  })

  it('marca contextTruncated como false cuando entra todo sin truncado', () => {
    const candidates = [
      createCandidate({
        source_id: 'src-1',
        content: 'a'.repeat(200),
        similarity: 0.9,
      }),
    ]
    const result = buildContext(query, candidates, {
      maxContextChars: 1000,
    })
    expect(result.stats.contextTruncated).toBe(false)
  })

  it('extrae title desde metadata', () => {
    const candidates = [
      createCandidate({
        source_id: 'src-1',
        metadata: { title: 'Artículo de Ayuda' },
      }),
    ]
    const result = buildContext(query, candidates)
    expect(result.sources[0].title).toBe('Artículo de Ayuda')
  })

  it('usa fallback a primeros 40 chars del contenido si falta title', () => {
    const content = 'Este es el contenido del artículo sin título meta'
    const candidates = [
      createCandidate({
        source_id: 'src-1',
        content,
        metadata: {},
      }),
    ]
    const result = buildContext(query, candidates)
    expect(result.sources[0].title).toBe(content.slice(0, 40))
  })

  it('incluye la query numerada en el mensaje final', () => {
    const candidates = [createCandidate()]
    const result = buildContext(query, candidates)
    expect(result.userMessage).toContain(query)
  })

  it('numera fuentes comenzando en 1', () => {
    const candidates = [
      createCandidate({
        source_id: 'src-1',
        metadata: { title: 'Primera Fuente' },
      }),
      createCandidate({
        source_id: 'src-2',
        metadata: { title: 'Segunda Fuente' },
      }),
    ]
    const result = buildContext(query, candidates)
    expect(result.userMessage).toContain('[1] Primera Fuente')
    expect(result.userMessage).toContain('[2] Segunda Fuente')
  })

  it('acumula totalChars correctamente', () => {
    const candidates = [
      createCandidate({
        source_id: 'src-1',
        content: 'a'.repeat(100),
      }),
      createCandidate({
        source_id: 'src-2',
        content: 'b'.repeat(150),
      }),
    ]
    const result = buildContext(query, candidates, {
      maxContextChars: 1000,
    })
    expect(result.stats.totalChars).toBe(250)
  })

  it('maneja minSimilarity custom', () => {
    const candidates = [
      createCandidate({ similarity: 0.5 }),
      createCandidate({ source_id: 'src-2', similarity: 0.6 }),
    ]
    const result = buildContext(query, candidates, {
      minSimilarity: 0.55,
    })
    expect(result.sources).toHaveLength(1)
    expect(result.sources[0].source_id).toBe('src-2')
  })

  it('maneja minContentLength custom', () => {
    const candidates = [
      createCandidate({
        content: 'a'.repeat(10), // Bajo
      }),
      createCandidate({
        source_id: 'src-2',
        content: 'b'.repeat(50), // Sobre
      }),
    ]
    const result = buildContext(query, candidates, {
      minContentLength: 30,
    })
    expect(result.sources).toHaveLength(1)
    expect(result.sources[0].source_id).toBe('src-2')
  })

  it('filtra TODO cuando todo está bajo similitud', () => {
    const candidates = [
      createCandidate({ similarity: 0.1 }),
      createCandidate({ source_id: 'src-2', similarity: 0.2 }),
    ]
    const result = buildContext(query, candidates, {
      minSimilarity: 0.5,
    })
    expect(result.sources).toHaveLength(0)
    expect(result.userMessage).toContain('No se encontró contexto relevante')
  })

  it('detiene acumulación cuando presupuesto llega a cero', () => {
    const candidates = [
      createCandidate({
        source_id: 'src-1',
        content: 'a'.repeat(200),
      }),
      createCandidate({
        source_id: 'src-2',
        content: 'b'.repeat(200),
      }),
      createCandidate({
        source_id: 'src-3',
        content: 'c'.repeat(200),
      }),
    ]
    const result = buildContext(query, candidates, {
      maxContextChars: 200,
    })
    expect(result.sources).toHaveLength(1)
    expect(result.stats.contextTruncated).toBe(true)
  })
})
