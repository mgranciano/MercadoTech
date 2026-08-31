import { z } from 'zod'
import { searchKnowledge } from '@/services/vector-search.service'
import { errorResult, textResult } from '../lib/tool-result.js'
import { safe } from '../lib/safe.js'
import { createContext } from '../context.js'

const searchKnowledgeSchema = z.object({
  query: z
    .string()
    .min(1, 'La búsqueda no puede estar vacía')
    .max(500, 'La búsqueda no puede exceder 500 caracteres'),
  source_type: z
    .enum(['producto', 'articulo_soporte'])
    .optional()
    .describe('Filtrar por tipo: "producto" (catálogo) o "articulo_soporte" (FAQ)'),
  topK: z
    .number()
    .int()
    .min(1)
    .max(20)
    .optional()
    .describe('Cantidad máxima de resultados (default 5)'),
})

type SearchKnowledgeInput = z.infer<typeof searchKnowledgeSchema>

const handler = safe(async (input: SearchKnowledgeInput) => {
  const validated = searchKnowledgeSchema.parse(input)
  const { anon } = await createContext()

  const results = await searchKnowledge(validated.query, anon, {
    sourceType: validated.source_type,
    topK: validated.topK || 5,
  })

  if (results.length === 0) {
    return textResult(`No encontré información sobre "${validated.query}".`)
  }

  const formatted = results
    .map(
      (match, i) =>
        `${i + 1}. **[${match.source_type}]** ${match.content.substring(0, 150)}...\n` +
        `   Similitud: ${(match.similarity * 100).toFixed(0)}%`
    )
    .join('\n')

  return textResult(
    `Encontré ${results.length} artículo${results.length !== 1 ? 's' : ''} relevante${results.length !== 1 ? 's' : ''} a "${validated.query}":\n\n${formatted}`
  )
})

export const searchKnowledgeTool = {
  name: 'search_knowledge',
  description:
    'Busca en la base de conocimiento: artículos de soporte (FAQ sobre devoluciones, garantía, etc.) y fichas de productos. Devuelve la información relevante sin necesidad de hacer una pregunta completa.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      query: {
        type: 'string' as const,
        description: 'Qué buscar: "política de devoluciones", "garantía", "envío gratis"',
      },
      source_type: {
        type: 'string' as const,
        enum: ['producto', 'articulo_soporte'] as const,
        description: 'Tipo de información: "articulo_soporte" para FAQ, "producto" para catálogo',
      },
      topK: {
        type: 'number' as const,
        description: 'Cuántos resultados (1-20, default 5)',
      },
    },
    required: ['query'],
  },
  handler,
}
