import { z } from 'zod'
import { listReviewsByProductAdapter } from '../shared/adapters.js'
import { errorResult, textResult } from '../lib/tool-result.js'
import { safe } from '../lib/safe.js'
import { createContext } from '../context.js'

const getProductReviewsSchema = z.object({
  product_id: z
    .string()
    .uuid('El ID del producto debe ser un UUID válido')
    .describe('UUID del producto'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .describe('Cuántas reseñas mostrar (default 10)'),
})

type GetProductReviewsInput = z.infer<typeof getProductReviewsSchema>

const handler = safe(async (input: GetProductReviewsInput) => {
  const validated = getProductReviewsSchema.parse(input)
  const { anon } = await createContext()

  const reviews = await listReviewsByProductAdapter(validated.product_id, anon)
  const limit = validated.limit || 10
  const shown = reviews.slice(0, limit)

  if (shown.length === 0) {
    return textResult('Este producto no tiene reseñas aún.')
  }

  const formatted = shown
    .map(
      (r) =>
        `**${r.rating}/5** - "${r.comment}"\n` +
        `   —${r.buyer_id ? 'Cliente' : 'Anónimo'} (${new Date(r.created_at).toLocaleDateString()})`
    )
    .join('\n\n')

  const tail = reviews.length > limit ? `\n\n(mostrando ${limit} de ${reviews.length})` : ''

  return textResult(`Reseñas de este producto:\n\n${formatted}${tail}`)
})

export const getProductReviewsTool = {
  name: 'get_product_reviews',
  description:
    'Trae las reseñas de un producto específico ordenadas por fecha. Muestra rating, comentario y quién las escribió.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      product_id: {
        type: 'string' as const,
        description: 'UUID del producto',
      },
      limit: {
        type: 'number' as const,
        description: 'Cuántas reseñas traer (1-50, default 10)',
      },
    },
    required: ['product_id'],
  },
  handler,
}
