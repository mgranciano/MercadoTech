import type { SupabaseClient } from '@supabase/supabase-js'

interface MockResponse<T> {
  data?: T
  error?: { message: string }
}

interface QueryBuilder {
  select: (cols?: string) => QueryBuilder
  eq: (col: string, val: any) => QueryBuilder
  maybeSingle: () => Promise<MockResponse<any>>
  single: () => Promise<MockResponse<any>>
  order: (col: string, opts?: any) => QueryBuilder
  insert: (data: any) => Promise<MockResponse<any>>
  update: (data: any) => QueryBuilder
  delete: () => QueryBuilder
  rpc: (fn: string, params: any) => Promise<MockResponse<any>>
}

export interface MockSupabaseOptions {
  [table: string]: {
    [method: string]: any
  }
}

export function mockSupabase(options: MockSupabaseOptions = {}): any {
  const calls: any[] = []

  const createQueryBuilder = (table: string): QueryBuilder => {
    let query = { table, conditions: [] } as any

    return {
      select: (cols?: string) => {
        query.select = cols
        return createQueryBuilder(table)
      },

      eq: (col: string, val: any) => {
        query.conditions.push({ type: 'eq', col, val })
        return createQueryBuilder(table)
      },

      order: (col: string, opts?: any) => {
        query.order = { col, ...opts }
        return createQueryBuilder(table)
      },

      maybeSingle: async () => {
        calls.push({ operation: 'select', table, ...query })
        const data = options[table]?.maybeSingle || null
        if (options[table]?.error) {
          return { error: options[table].error }
        }
        return { data }
      },

      single: async () => {
        calls.push({ operation: 'select', table, ...query })
        const data = options[table]?.single
        if (options[table]?.error) {
          return { error: options[table].error }
        }
        if (!data) {
          return { error: { message: 'no rows returned' } }
        }
        return { data }
      },

      insert: async (data: any) => {
        calls.push({ operation: 'insert', table, data })
        if (options[table]?.insertError) {
          return { error: options[table].insertError }
        }
        return { data }
      },

      update: (data: any) => {
        calls.push({ operation: 'update', table, data, conditions: query.conditions })
        const builder: QueryBuilder = {
          select: () => builder,
          eq: (col: string, val: any) => {
            query.conditions.push({ type: 'eq', col, val })
            return builder
          },
          order: () => builder,
          maybeSingle: async () => {
            if (options[table]?.updateError) {
              return { error: options[table].updateError }
            }
            return { data }
          },
          single: async () => {
            if (options[table]?.updateError) {
              return { error: options[table].updateError }
            }
            return { data }
          },
          insert: async () => ({ data }),
          update: (d: any) => {
            calls.push({ operation: 'update', table, data: d })
            return builder
          },
          delete: () => builder,
          rpc: async () => ({ data }),
        }
        return builder
      },

      delete: () => {
        const builder: QueryBuilder = {
          select: () => builder,
          eq: (col: string, val: any) => {
            query.conditions.push({ type: 'eq', col, val })
            return builder
          },
          order: () => builder,
          maybeSingle: async () => ({ data: null }),
          single: async () => ({ data: null }),
          insert: async () => ({ data: null }),
          update: () => builder,
          delete: () => builder,
          rpc: async () => ({ data: null }),
        }
        return builder
      },

      rpc: async (fn: string, params: any) => {
        calls.push({ operation: 'rpc', fn, params })
        if (options[fn]?.error) {
          return { error: options[fn].error }
        }
        return { data: options[fn]?.data || null }
      },
    }
  }

  const supabase: any = {
    from: (table: string) => createQueryBuilder(table),

    rpc: async (fn: string, params: any) => {
      calls.push({ operation: 'rpc', fn, params })
      if (options[fn]?.error) {
        return { error: options[fn].error }
      }
      return { data: options[fn]?.data || null }
    },

    // Helpers para verificar llamadas en tests
    calls: () => calls,
    updates: (table: string) => {
      return calls.filter((c) => c.operation === 'update' && c.table === table).map((c) => c.data)
    },
    inserts: (table: string) => {
      return calls.filter((c) => c.operation === 'insert' && c.table === table).map((c) => c.data)
    },
    deletes: (table: string) => {
      return calls.filter((c) => c.operation === 'delete' && c.table === table).length
    },
    rpcs: (fn?: string) => {
      return calls.filter((c) => c.operation === 'rpc' && (!fn || c.fn === fn))
    },
  }

  return supabase as SupabaseClient
}
