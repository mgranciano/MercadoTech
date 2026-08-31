import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { getEnv } from './env.js'

// No reutiliza lib/supabase/admin.ts: ese módulo importa "server-only" de Next.js,
// que lanza en cualquier runtime que no sea el compilador de Next.js (incluido
// este servidor MCP ejecutado con `tsx` o `node`). Este contexto arma sus propios
// clientes mínimos con las mismas credenciales. Ver scripts/index-all.ts para el
// patrón idéntico (probado en este repo).

export type MCPContext = {
  anon: ReturnType<typeof createClient<Database>>
  admin: ReturnType<typeof createClient<Database>>
}

// Por llamada: cada invocación de tool obtiene su propio contexto limpio.
// Esto evita que el estado compartido (token expirado, error anterior) afecte
// llamadas posteriores. Lección 5: aislamiento de contexto por invocación.
export async function createContext(): Promise<MCPContext> {
  const { supabaseUrl, supabaseServiceRoleKey } = getEnv()

  // Cliente anónimo: RLS activo, permisos del usuario público.
  const anon = createClient<Database>(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  )

  // Cliente admin: bypasea RLS, solo para operaciones administrativas
  // dentro del servidor (embedding indexation, búsquedas sin restricciones).
  const admin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  return { anon, admin }
}
