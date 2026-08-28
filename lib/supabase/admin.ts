import 'server-only'

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// ⚠️  IMPORTANTE: Este cliente bypasea Row Level Security (RLS).
// NUNCA importes esto desde código cliente. Solo úsalo en server-side operations
// donde necesites acceso administrativo (seeding, migraciones, verificación).

export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
