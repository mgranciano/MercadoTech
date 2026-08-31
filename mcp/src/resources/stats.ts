import type { Resource } from '@modelcontextprotocol/sdk/types.js'
import { getStoreStatsAdapter } from '../shared/adapters.js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type Client = SupabaseClient<Database>

export const statsResource: Resource = {
  uri: 'mercadotech://stats',
  name: 'Estadísticas de la tienda',
  description:
    'Métricas generales: productos, categorías, calificación promedio, precio medio y actividad.',
  mimeType: 'text/plain',
}

export async function getStatsContent(supabase: Client): Promise<string> {
  try {
    // Derivación (Lección 6): compone múltiples queries
    const stats = await getStoreStatsAdapter(supabase)

    return `
# Estadísticas de MercadoTech

**Productos activos:** ${stats.total_products}
**Categorías:** ${stats.total_categories}
**Calificación promedio:** ⭐ ${stats.average_rating}/5
**Precio promedio:** $${stats.average_price.toFixed(2)}

*Datos actualizados en tiempo real*
`.trim()
  } catch (error) {
    throw new Error(
      `Error cargando estadísticas: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}
