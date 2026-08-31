import { z } from 'zod'
import { getProductByIdAdapter } from '../shared/adapters.js'
import { errorResult, textResult } from '../lib/tool-result.js'
import { safe } from '../lib/safe.js'
import { createContext } from '../context.js'

const getProductSchema = z.object({
  product_id: z
    .string()
    .uuid('El ID del producto debe ser un UUID válido')
    .describe('UUID del producto en la base de datos'),
})

type GetProductInput = z.infer<typeof getProductSchema>

const handler = safe(async (input: GetProductInput) => {
  const validated = getProductSchema.parse(input)
  const { anon } = await createContext()

  const product = await getProductByIdAdapter(validated.product_id, anon)

  if (!product) {
    return errorResult(`Producto no encontrado: ${validated.product_id}`)
  }

  const review_section =
    product.review_count > 0
      ? `- Reseñas: ${product.review_count} (⭐ ${product.average_rating}/5)`
      : '- Sin reseñas aún'

  const formatted =
    `**${product.title}** por ${product.brand}\n` +
    `Precio: $${product.price.toFixed(2)}\n` +
    `${review_section}\n` +
    `Condición: ${product.condition}\n` +
    `Stock: ${product.stock} unidades`

  return textResult(formatted)
})

export const getProductTool = {
  name: 'get_product',
  description:
    'Obtiene los detalles actualizados de un producto específico: precio, reseñas, disponibilidad. Úsalo cuando necesites información completa de un producto concreto.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      product_id: {
        type: 'string' as const,
        description: 'UUID del producto (ejemplo: "550e8400-e29b-41d4-a716-446655440000")',
      },
    },
    required: ['product_id'],
  },
  handler,
}
