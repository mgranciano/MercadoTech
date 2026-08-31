import { z } from 'zod'
import { ask } from '@/services/chat.service'
import { errorResult, textResult } from '../lib/tool-result.js'
import { safe } from '../lib/safe.js'
import { createContext } from '../context.js'

const askChatSchema = z.object({
  query: z
    .string()
    .min(1, 'La pregunta no puede estar vacía')
    .max(1000, 'La pregunta no puede exceder 1000 caracteres'),
  mode: z
    .enum(['compras', 'soporte'])
    .describe('Contexto: "compras" para preguntas de productos, "soporte" para problemas'),
  topK: z
    .number()
    .int()
    .min(1)
    .max(20)
    .optional()
    .describe('Cuántos documentos usar como contexto (default 5)'),
  similarityThreshold: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .describe('Umbral de similitud (default 0.5)'),
})

type AskChatInput = z.infer<typeof askChatSchema>

const handler = safe(async (input: AskChatInput) => {
  const validated = askChatSchema.parse(input)
  const { anon } = await createContext()

  const result = await ask(validated.query, validated.mode, validated, anon)

  let response = result.answer

  if (!result.hasRelevantContext) {
    response += '\n\n_Nota: no encontré información relacionada en la base de conocimiento._'
  } else {
    response += `\n\n_Información usada: ${result.metadata.usedSourceCount} fuente(s) de ${result.metadata.retrievedCount} consultadas._`
  }

  return textResult(response)
})

export const askChatTool = {
  name: 'ask_chat',
  description:
    'Responde preguntas del cliente sobre compras o soporte técnico usando RAG (Retrieval Augmented Generation). Busca información relevante en la FAQ y catálogo, luego genera una respuesta completa y personalizada.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      query: {
        type: 'string' as const,
        description:
          'La pregunta del cliente: "¿Qué laptops recomiendan?", "¿Cómo devuelvo un producto?", "¿Envían al extranjero?"',
      },
      mode: {
        type: 'string' as const,
        enum: ['compras', 'soporte'] as const,
        description: 'Tipo de pregunta: "compras" (sobre productos) o "soporte" (problemas, políticas)',
      },
      topK: {
        type: 'number' as const,
        description: 'Cuántas fuentes consultar (1-20, default 5)',
      },
      similarityThreshold: {
        type: 'number' as const,
        description: 'Qué tan relevante debe ser la información (0-1, default 0.5)',
      },
    },
    required: ['query', 'mode'],
  },
  handler,
}
