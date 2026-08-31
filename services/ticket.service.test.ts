import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockSupabase } from './test-utils/supabase-mock'

let mockClient: any

vi.mock('@/lib/supabase/client', () => {
  return {
    createClient: () => mockClient,
  }
})

import { listMine } from './ticket.service'

describe('ticket.service', () => {
  beforeEach(() => { mockClient = null })

  it('listMine retorna tickets del usuario ordenados descendente', async () => {
    mockClient = mockSupabase({
      support_tickets: {
        data: [
          { id: 't1', user_id: 'user1', status: 'open', created_at: '2024-08-30' },
          { id: 't2', user_id: 'user1', status: 'closed', created_at: '2024-08-29' },
        ],
      },
    })
    const tickets = await listMine('user1', mockClient)
    expect(tickets).toHaveLength(2)
    expect(tickets[0].status).toBe('open')
  })

  it('listMine filtra por user_id', async () => {
    mockClient = mockSupabase({
      support_tickets: {
        data: [],
      },
    })
    await listMine('user1', mockClient)
    const calls = mockClient.calls()
    expect(calls[0].conditions.some((c: any) => c.col === 'user_id')).toBe(true)
  })

  it('listMine maneja error devolviendo array vacío', async () => {
    mockClient = mockSupabase({
      support_tickets: { error: { message: 'db error' } },
    })
    const tickets = await listMine('user1', mockClient)
    expect(tickets).toEqual([])
  })
})
