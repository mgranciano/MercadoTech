/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SupabaseClient } from '@supabase/supabase-js'

interface MockResponse<T> {
  data?: T
  error?: { message: string; code?: string }
  count?: number
}

interface QueryBuilder extends Promise<MockResponse<any>> {
  select: (cols?: string) => QueryBuilder
  eq: (col: string, val: any) => QueryBuilder
  neq: (col: string, val: any) => QueryBuilder
  lt: (col: string, val: any) => QueryBuilder
  lte: (col: string, val: any) => QueryBuilder
  gt: (col: string, val: any) => QueryBuilder
  gte: (col: string, val: any) => QueryBuilder
  or: (filter: string) => QueryBuilder
  order: (col: string, opts?: any) => QueryBuilder
  limit: (n: number) => QueryBuilder
  range: (from: number, to: number) => QueryBuilder
  maybeSingle: () => Promise<MockResponse<any>>
  single: () => Promise<MockResponse<any>>
  insert: (data: any) => Promise<MockResponse<any>>
  update: (data: any) => QueryBuilder
  delete: () => QueryBuilder
  upsert: (data: any) => Promise<MockResponse<any>>
  rpc: (fn: string, params: any) => Promise<MockResponse<any>>
}

export interface MockSupabaseOptions {
  [key: string]: any
}

export function mockSupabase(options: MockSupabaseOptions = {}): any {
  const calls: any[] = []

  class QueryBuilderImpl extends Promise<MockResponse<any>> {
    private state: any = { table: '', conditions: [], select: '*', order: null, limit: null, range: null }

    constructor(table: string, executor?: any) {
      super(executor || ((resolve) => resolve({ data: null })))
      this.state = { table, conditions: [], select: '*', order: null, limit: null, range: null }
    }

    select = (cols?: string): QueryBuilder => {
      this.state.select = cols || '*'
      return this as any
    }

    eq = (col: string, val: any): QueryBuilder => {
      this.state.conditions.push({ type: 'eq', col, val })
      return this as any
    }

    neq = (col: string, val: any): QueryBuilder => {
      this.state.conditions.push({ type: 'neq', col, val })
      return this as any
    }

    lt = (col: string, val: any): QueryBuilder => {
      this.state.conditions.push({ type: 'lt', col, val })
      return this as any
    }

    lte = (col: string, val: any): QueryBuilder => {
      this.state.conditions.push({ type: 'lte', col, val })
      return this as any
    }

    gt = (col: string, val: any): QueryBuilder => {
      this.state.conditions.push({ type: 'gt', col, val })
      return this as any
    }

    gte = (col: string, val: any): QueryBuilder => {
      this.state.conditions.push({ type: 'gte', col, val })
      return this as any
    }

    or = (filter: string): QueryBuilder => {
      this.state.conditions.push({ type: 'or', filter })
      return this as any
    }

    order = (col: string, opts?: any): QueryBuilder => {
      this.state.order = { col, ...opts }
      return this as any
    }

    limit = (n: number): QueryBuilder => {
      this.state.limit = n
      return this as any
    }

    range = (from: number, to: number): QueryBuilder => {
      this.state.range = { from, to }
      return this as any
    }

    maybeSingle = async (): Promise<MockResponse<any>> => {
      calls.push({ operation: 'select', ...this.state })
      const data = options[this.state.table]?.maybeSingle || options[this.state.table]?.data?.[0] || null
      if (options[this.state.table]?.error) {
        return { error: options[this.state.table].error }
      }
      return { data }
    }

    single = async (): Promise<MockResponse<any>> => {
      calls.push({ operation: 'select', ...this.state })
      const data = options[this.state.table]?.single || options[this.state.table]?.data?.[0]
      if (options[this.state.table]?.error) {
        return { error: options[this.state.table].error }
      }
      if (!data) {
        return { error: { message: 'no rows returned' } }
      }
      return { data }
    }

    insert = (data: any): QueryBuilder => {
      calls.push({ operation: 'insert', table: this.state.table, data })
      const builder = new InsertBuilder(this.state.table, data)
      return builder as any
    }

    update = (data: any): QueryBuilder => {
      calls.push({ operation: 'update', table: this.state.table, data, conditions: this.state.conditions })
      return new UpdateBuilder(this.state.table, data) as any
    }

    delete = (): QueryBuilder => {
      calls.push({ operation: 'delete', table: this.state.table, conditions: this.state.conditions })
      return new DeleteBuilder(this.state.table) as any
    }

    upsert = async (data: any): Promise<MockResponse<any>> => {
      calls.push({ operation: 'upsert', table: this.state.table, data })
      if (options[this.state.table]?.upsertError) {
        return { error: options[this.state.table].upsertError }
      }
      return { data: Array.isArray(data) ? data : [data] }
    }

    rpc = async (fn: string, params: any): Promise<MockResponse<any>> => {
      calls.push({ operation: 'rpc', fn, params })
      if (options[fn]?.error) {
        return { error: options[fn].error }
      }
      return { data: options[fn]?.data || null }
    }

    // Make this awaitable to return array data
    then = async (resolve?: any, reject?: any) => {
      try {
        calls.push({ operation: 'select', ...this.state })
        const data = options[this.state.table]?.data || []
        if (options[this.state.table]?.error) {
          return resolve?.({ error: options[this.state.table].error, data: undefined, count: null })
        }
        return resolve?.({ data, count: data.length })
      } catch (e) {
        return reject?.(e)
      }
    }

    catch = () => this as any
    finally = () => this as any
  }

  class InsertBuilder extends Promise<MockResponse<any>> {
    private state: any = { table: '', data: {} }

    constructor(table: string, data: any, executor?: any) {
      super(executor || ((resolve) => resolve({ data: null })))
      this.state = { table, data }
    }

    select = (): QueryBuilder => this as any
    eq = (): QueryBuilder => this as any
    neq = (): QueryBuilder => this as any
    lt = (): QueryBuilder => this as any
    lte = (): QueryBuilder => this as any
    gt = (): QueryBuilder => this as any
    gte = (): QueryBuilder => this as any
    or = (): QueryBuilder => this as any
    order = (): QueryBuilder => this as any
    limit = (): QueryBuilder => this as any
    range = (): QueryBuilder => this as any

    maybeSingle = async (): Promise<MockResponse<any>> => {
      if (options[this.state.table]?.insertError) {
        return { error: options[this.state.table].insertError }
      }
      return { data: this.state.data }
    }

    single = async (): Promise<MockResponse<any>> => {
      if (options[this.state.table]?.insertError) {
        return { error: options[this.state.table].insertError }
      }
      return { data: this.state.data }
    }

    insert = (): QueryBuilder => this as any
    update = (): QueryBuilder => this as any
    delete = (): QueryBuilder => this as any
    upsert = async (): Promise<MockResponse<any>> => ({ data: this.state.data })
    rpc = async (): Promise<MockResponse<any>> => ({ data: this.state.data })

    then = (resolve?: any) => resolve?.({ data: this.state.data })
    catch = () => this as any
    finally = () => this as any
  }

  class UpdateBuilder extends Promise<MockResponse<any>> {
    private state: any = { table: '', conditions: [], data: {} }

    constructor(table: string, data: any, executor?: any) {
      super(executor || ((resolve) => resolve({ data: null })))
      this.state = { table, conditions: [], data }
    }

    select = (): QueryBuilder => this as any
    eq = (col: string, val: any): QueryBuilder => {
      this.state.conditions.push({ type: 'eq', col, val })
      return this as any
    }
    neq = (): QueryBuilder => this as any
    lt = (): QueryBuilder => this as any
    lte = (): QueryBuilder => this as any
    gt = (): QueryBuilder => this as any
    gte = (): QueryBuilder => this as any
    or = (): QueryBuilder => this as any
    order = (): QueryBuilder => this as any
    limit = (): QueryBuilder => this as any
    range = (): QueryBuilder => this as any

    maybeSingle = async (): Promise<MockResponse<any>> => {
      if (options[this.state.table]?.updateError) {
        return { error: options[this.state.table].updateError }
      }
      return { data: this.state.data }
    }

    single = async (): Promise<MockResponse<any>> => {
      if (options[this.state.table]?.updateError) {
        return { error: options[this.state.table].updateError }
      }
      return { data: this.state.data }
    }

    insert = async (): Promise<MockResponse<any>> => ({ data: this.state.data })
    update = (): QueryBuilder => this as any
    delete = (): QueryBuilder => this as any
    upsert = async (): Promise<MockResponse<any>> => ({ data: this.state.data })
    rpc = async (): Promise<MockResponse<any>> => ({ data: this.state.data })

    then = (resolve?: any) => resolve?.({ data: this.state.data })
    catch = () => this as any
    finally = () => this as any
  }

  class DeleteBuilder extends Promise<MockResponse<any>> {
    private state: any = { table: '', conditions: [] }

    constructor(table: string, executor?: any) {
      super(executor || ((resolve) => resolve({ data: null })))
      this.state = { table, conditions: [] }
    }

    select = (): QueryBuilder => this as any
    eq = (col: string, val: any): QueryBuilder => {
      this.state.conditions.push({ type: 'eq', col, val })
      return this as any
    }
    neq = (): QueryBuilder => this as any
    lt = (): QueryBuilder => this as any
    lte = (): QueryBuilder => this as any
    gt = (): QueryBuilder => this as any
    gte = (): QueryBuilder => this as any
    or = (): QueryBuilder => this as any
    order = (): QueryBuilder => this as any
    limit = (): QueryBuilder => this as any
    range = (): QueryBuilder => this as any

    maybeSingle = async (): Promise<MockResponse<any>> => ({ data: null })
    single = async (): Promise<MockResponse<any>> => ({ data: null })
    insert = async (): Promise<MockResponse<any>> => ({ data: null })
    update = (): QueryBuilder => this as any
    delete = (): QueryBuilder => this as any
    upsert = async (): Promise<MockResponse<any>> => ({ data: null })
    rpc = async (): Promise<MockResponse<any>> => ({ data: null })

    then = (resolve?: any) => resolve?.({ data: null })
    catch = () => this as any
    finally = () => this as any
  }

  const supabase: any = {
    from: (table: string) => new QueryBuilderImpl(table),

    rpc: async (fn: string, params: any) => {
      calls.push({ operation: 'rpc', fn, params })
      if (options[fn]?.error) {
        return { error: options[fn].error }
      }
      return { data: options[fn]?.data || null }
    },

    auth: {
      signUp: async (opts: any) => {
        calls.push({ operation: 'auth.signUp', opts })
        if (options.auth?.signUpError) {
          return { error: options.auth.signUpError }
        }
        return { data: { user: { id: 'user-123', email: opts.email } } }
      },

      signInWithPassword: async (opts: any) => {
        calls.push({ operation: 'auth.signInWithPassword', opts })
        if (options.auth?.signInError) {
          return { error: options.auth.signInError }
        }
        return { data: { user: { id: 'user-123', email: opts.email } } }
      },

      signOut: async () => {
        calls.push({ operation: 'auth.signOut' })
        return { error: null }
      },

      getUser: async () => {
        calls.push({ operation: 'auth.getUser' })
        return { data: { user: { id: 'user-123', email: 'test@test.com' } } }
      },

      getSession: async () => {
        calls.push({ operation: 'auth.getSession' })
        return { data: { session: { user: { id: 'user-123' } } } }
      },

      onAuthStateChange: () => {
        return { data: { subscription: { unsubscribe: () => {} } } }
      },
    },

    storage: {
      from: (bucket: string) => ({
        getPublicUrl: (path: string) => {
          calls.push({ operation: 'storage.getPublicUrl', bucket, path })
          return { data: { publicUrl: `https://example.com/${bucket}/${path}` } }
        },
        upload: async (path: string, file: any, opts?: any) => {
          calls.push({ operation: 'storage.upload', bucket, path, file })
          return { error: null }
        },
        remove: async (paths: string[]) => {
          calls.push({ operation: 'storage.remove', bucket, paths })
          return { error: null }
        },
      }),
    },

    // Helpers
    calls: () => calls,
    updates: (table: string) =>
      calls.filter((c) => c.operation === 'update' && c.table === table).map((c) => c.data),
    inserts: (table: string) =>
      calls.filter((c) => c.operation === 'insert' && c.table === table).map((c) => c.data),
    deletes: (table: string) =>
      calls.filter((c) => c.operation === 'delete' && c.table === table).length,
    rpcs: (fn?: string) =>
      calls.filter((c) => c.operation === 'rpc' && (!fn || c.fn === fn)),
  }

  return supabase as SupabaseClient
}
