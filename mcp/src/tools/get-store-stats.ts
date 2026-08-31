import { z } from 'zod'
import { getStoreStatsAdapter } from '../shared/adapters.js'
import { textResult } from '../lib/tool-result.js'
import { safe } from '../lib/safe.js'
import { createContext } from '../context.js'

const getStoreStatsSchema = z.object({})

type GetStoreStatsInput = z.infer<typeof getStoreStatsSchema>

const handler = safe(async (_input: GetStoreStatsInput) => {
  const { admin } = await createContext()

  // Derivación (Lección 6): compone listCategoriesWithCountAdapter + conteo de reseñas
  // + precio medio. Ver mcp/src/shared/adapters.ts.
  const stats = await getStoreStatsAdapter(admin)

  const formatted =
    `📊 **Estadísticas de MercadoTech**\n` +
    `- Productos activos: ${stats.total_products}\n` +
    `- Categorías: ${stats.total_categories}\n` +
    `- Calificación promedio: ⭐ ${stats.average_rating}/5\n` +
    `- Precio promedio: $${stats.average_price.toFixed(2)}`

  return textResult(formatted)
})

export const getStoreStatsTool = {
  name: 'get_store_stats',
  description:
    'Devuelve estadísticas generales del marketplace: cuántos productos hay, categorías disponibles, calificación promedio y precio promedio. Útil para conocer el estado general de la tienda.',
  inputSchema: {
    type: 'object' as const,
    properties: {},
    required: [],
  },
  handler,
}
