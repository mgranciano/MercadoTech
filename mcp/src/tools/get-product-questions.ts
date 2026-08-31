import { z } from 'zod'
import { listQuestionsByProductAdapter } from '../shared/adapters.js'
import { textResult } from '../lib/tool-result.js'
import { safe } from '../lib/safe.js'
import { createContext } from '../context.js'

const getProductQuestionsSchema = z.object({
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
    .describe('Cuántas preguntas mostrar (default 10)'),
})

type GetProductQuestionsInput = z.infer<typeof getProductQuestionsSchema>

const handler = safe(async (input: GetProductQuestionsInput) => {
  const validated = getProductQuestionsSchema.parse(input)
  const { anon } = await createContext()

  const questions = await listQuestionsByProductAdapter(validated.product_id, anon)
  const limit = validated.limit || 10
  const shown = questions.slice(0, limit)

  if (shown.length === 0) {
    return textResult('No hay preguntas en este producto aún.')
  }

  const formatted = shown
    .map((q) => {
      let item = `**P: ${q.question}**\n`
      if (q.answer) {
        item += `**R: ${q.answer}**`
      } else {
        item += '_Sin respuesta aún_'
      }
      return item
    })
    .join('\n\n')

  const tail = questions.length > limit ? `\n\n(mostrando ${limit} de ${questions.length})` : ''

  return textResult(`Preguntas y respuestas:\n\n${formatted}${tail}`)
})

export const getProductQuestionsTool = {
  name: 'get_product_questions',
  description:
    'Obtiene las preguntas frecuentes de un producto y sus respuestas del vendedor. Muestra qué dudas tuvieron otros compradores.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      product_id: {
        type: 'string' as const,
        description: 'UUID del producto',
      },
      limit: {
        type: 'number' as const,
        description: 'Cuántas preguntas traer (1-50, default 10)',
      },
    },
    required: ['product_id'],
  },
  handler,
}
