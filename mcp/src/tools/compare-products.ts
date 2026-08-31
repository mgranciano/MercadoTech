import { z } from 'zod'
import { getProductByIdAdapter } from '../shared/adapters.js'
import { errorResult, textResult } from '../lib/tool-result.js'
import { safe } from '../lib/safe.js'
import { createContext } from '../context.js'

const compareProductsSchema = z.object({
  product_id_1: z
    .string()
    .uuid('El ID debe ser un UUID válido')
    .describe('UUID del primer producto'),
  product_id_2: z
    .string()
    .uuid('El ID debe ser un UUID válido')
    .describe('UUID del segundo producto'),
})

type CompareProductsInput = z.infer<typeof compareProductsSchema>

const handler = safe(async (input: CompareProductsInput) => {
  const validated = compareProductsSchema.parse(input)
  const { anon } = await createContext()

  // Derivación (Lección 6): mapea getProductById x2 y compone los datos.
  // Ver mcp/src/shared/adapters.ts.
  const p1 = await getProductByIdAdapter(validated.product_id_1, anon)
  const p2 = await getProductByIdAdapter(validated.product_id_2, anon)

  if (!p1 || !p2) {
    const missing = !p1 ? validated.product_id_1 : validated.product_id_2
    return errorResult(`Producto no encontrado: ${missing}`)
  }

  const comparison =
    `| Atributo | ${p1.title} | ${p2.title} |\n` +
    `|----------|${'-'.repeat(p1.title.length + 2)}|${'-'.repeat(p2.title.length + 2)}|\n` +
    `| Precio | $${p1.price.toFixed(2)} | $${p2.price.toFixed(2)} |\n` +
    `| Marca | ${p1.brand} | ${p2.brand} |\n` +
    `| Calificación | ⭐ ${p1.average_rating}/5 (${p1.review_count} reseñas) | ⭐ ${p2.average_rating}/5 (${p2.review_count} reseñas) |\n` +
    `| Stock | ${p1.stock} unidades | ${p2.stock} unidades |\n` +
    `| Condición | ${p1.condition} | ${p2.condition} |`

  return textResult(`**Comparación de productos**\n\n${comparison}`)
})

export const compareProductsTool = {
  name: 'compare_products',
  description:
    'Compara dos productos lado a lado: precio, marca, calificaciones, stock y condición. Útil para ayudar a clientes a elegir entre opciones.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      product_id_1: {
        type: 'string' as const,
        description: 'UUID del primer producto',
      },
      product_id_2: {
        type: 'string' as const,
        description: 'UUID del segundo producto',
      },
    },
    required: ['product_id_1', 'product_id_2'],
  },
  handler,
}
