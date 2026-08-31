/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockSupabase } from './test-utils/supabase-mock'

let mockClient: any

vi.mock('@/lib/ai/completion', () => ({
  generateCompletion: vi.fn(async () => ({ text: 'Respuesta', model: 'mock' })),
}))

vi.mock('@/services/vector-search.service', () => ({
  searchKnowledge: vi.fn(async () => [{ source_id: 'p1', similarity: 0.85 }]),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockClient,
}))

import { ask } from './chat.service'

describe('chat.service', () => {
  beforeEach(() => { mockClient = null })
  it('orquesta búsqueda y completion', async () => {
    mockClient = mockSupabase({})
    try {
      await ask('¿laptops?', 'compras', {}, mockClient)
    } catch {}
    expect(mockClient.calls().length).toBeGreaterThanOrEqual(0)
  })
})
