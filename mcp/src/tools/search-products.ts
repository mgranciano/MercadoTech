import { z } from 'zod'
import { searchProducts } from '@/services/vector-search.service'
import { errorResult, textResult } from '../lib/tool-result.js'
import { safe } from '../lib/safe.js'
import { createContext } from '../context.js'

const searchProductsSchema = z.object({
  query: z
    .string()
    .min(1, 'La búsqueda no puede estar vacía')
    .max(500, 'La búsqueda no puede exceder 500 caracteres'),
  topK: z
    .number()
    .int()
    .min(1)
    .max(20)
    .optional()
    .describe('Cantidad máxima de resultados (default 10)'),
  similarityThreshold: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .describe('Umbral de similitud de 0 a 1 (default 0.5)'),
})

type SearchProductsInput = z.infer<typeof searchProductsSchema>

const handler = safe(async (input: SearchProductsInput) => {
  const validated = searchProductsSchema.parse(input)
  const { anon } = await createContext()

  const results = await searchProducts(validated.query, anon, {
    topK: validated.topK,
    similarityThreshold: validated.similarityThreshold,
  })

  if (results.length === 0) {
    return textResult(`No encontré productos similares a "${validated.query}".`)
  }

  const formatted = results
    .map(
      (p, i) =>
        `${i + 1}. **${p.title}** (${p.brand}) - $${p.price.toFixed(2)}\n` +
        `   Similitud: ${(p.similarity * 100).toFixed(0)}% | Calificación: ${p.average_rating}/5`
    )
    .join('\n')

  return textResult(
    `Encontré ${results.length} producto(s) similar(es) a "${validated.query}":\n\n${formatted}`
  )
})

export const searchProductsTool = {
  name: 'search_products',
  description:
    'Busca productos activos por significado, no por palabras exactas. Usa embeddings semánticos para encontrar lo que el cliente realmente busca, incluso si la redacción es diferente.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      query: {
        type: 'string' as const,
        description: 'Qué buscar: "audífonos para correr", "laptop gaming bajo presupuesto"',
      },
      topK: {
        type: 'number' as const,
        description: 'Cuántos resultados quieres (1-20, default 10)',
      },
      similarityThreshold: {
        type: 'number' as const,
        description: 'Qué tan similares deben ser (0-1, default 0.5)',
      },
    },
    required: ['query'],
  },
  handler,
}
