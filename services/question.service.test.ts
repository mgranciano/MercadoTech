import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockSupabase } from './test-utils/supabase-mock'

let mockClient: any

vi.mock('@/lib/supabase/client', () => {
  return {
    createClient: () => mockClient,
  }
})

import { listByProduct, create, answer } from './question.service'

describe('question.service', () => {
  beforeEach(() => { mockClient = null })

  it('listByProduct retorna preguntas del producto ordenadas descendente', async () => {
    mockClient = mockSupabase({
      questions: {
        data: [
          { id: 'q1', product_id: 'p1', question: '¿Funciona?', created_at: '2024-08-30' },
          { id: 'q2', product_id: 'p1', question: '¿Garantía?', created_at: '2024-08-29' },
        ],
      },
    })
    const questions = await listByProduct('p1', mockClient)
    expect(questions).toHaveLength(2)
    expect(questions[0].question).toBe('¿Funciona?')
  })

  it('create inserta pregunta con product_id y user_id', async () => {
    mockClient = mockSupabase({
      questions: {
        data: [
          { id: 'q1', product_id: 'p1', user_id: 'user1', question: '¿Tiene garantía?' },
        ],
      },
    })
    const question = await create('p1', 'user1', '¿Tiene garantía?', mockClient)
    expect(question.question).toBe('¿Tiene garantía?')
    const inserts = mockClient.inserts('questions')
    expect(inserts[0].product_id).toBe('p1')
    expect(inserts[0].user_id).toBe('user1')
  })

  it('answer actualiza pregunta con respuesta y timestamp', async () => {
    mockClient = mockSupabase({
      questions: {
        data: [
          {
            id: 'q1',
            product_id: 'p1',
            question: '¿Funciona?',
            answer: 'Sí, perfectamente',
            answered_at: '2024-08-31T10:00:00Z',
          },
        ],
      },
    })
    const question = await answer('q1', 'Sí, perfectamente', mockClient)
    expect(question.answer).toBe('Sí, perfectamente')
    const updates = mockClient.updates('questions')
    expect(updates[0].answer).toBe('Sí, perfectamente')
  })
})
