import { z } from 'zod'
import { listCategoriesWithCountAdapter } from '../shared/adapters.js'
import { textResult } from '../lib/tool-result.js'
import { safe } from '../lib/safe.js'
import { createContext } from '../context.js'

const listCategoriesSchema = z.object({})

type ListCategoriesInput = z.infer<typeof listCategoriesSchema>

const handler = safe(async (_input: ListCategoriesInput) => {
  const { anon } = await createContext()

  const categories = await listCategoriesWithCountAdapter(anon)

  if (categories.length === 0) {
    return textResult('No hay categorías disponibles.')
  }

  const formatted = categories
    .map((cat) => `- **${cat.name}** (${cat.product_count} producto${cat.product_count !== 1 ? 's' : ''})`)
    .join('\n')

  return textResult(`Categorías disponibles:\n\n${formatted}`)
})

export const listCategoriesTool = {
  name: 'list_categories',
  description:
    'Devuelve todas las categorías de productos disponibles con el número de artículos en cada una. Útil para ayudar a los clientes a explorar por categoría.',
  inputSchema: {
    type: 'object' as const,
    properties: {},
    required: [],
  },
  handler,
}
