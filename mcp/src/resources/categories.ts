import type { Resource } from '@modelcontextprotocol/sdk/types.js'
import { listCategoriesWithCountAdapter } from '../shared/adapters.js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type Client = SupabaseClient<Database>

export const categoriesResource: Resource = {
  uri: 'mercadotech://categories',
  name: 'Categorías de productos',
  description:
    'Lista de todas las categorías disponibles con el número de productos en cada una.',
  mimeType: 'text/plain',
}

export async function getCategoriesContent(supabase: Client): Promise<string> {
  try {
    const categories = await listCategoriesWithCountAdapter(supabase)

    if (categories.length === 0) {
      return 'No hay categorías disponibles en este momento.'
    }

    const lines = categories.map(
      (c) => `- **${c.name}** (${c.product_count} producto${c.product_count !== 1 ? 's' : ''})`
    )

    return `Categorías disponibles (${categories.length}):\n\n${lines.join('\n')}`
  } catch (error) {
    throw new Error(
      `Error listando categorías: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}
