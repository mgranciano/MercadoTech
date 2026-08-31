import type { Prompt } from '@modelcontextprotocol/sdk/types.js'
import { listQuestionsByProductAdapter, getProductByIdAdapter } from '../shared/adapters.js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type Client = SupabaseClient<Database>

export const redactarRespuestaPrompt: Prompt = {
  name: 'redactar_respuesta_pregunta',
  description: 'Redacta una respuesta clara y útil a una pregunta de cliente sobre un producto.',
  arguments: [
    {
      name: 'product_id',
      description: 'UUID del producto',
      required: true,
    },
    {
      name: 'question_index',
      description: 'Índice de la pregunta en la lista (0 = primera sin respuesta)',
      required: true,
    },
  ],
}

export async function getRedactarRespuestaContent(
  productId: string,
  questionIndex: string,
  supabase: Client
): Promise<string> {
  try {
    const product = await getProductByIdAdapter(productId, supabase)
    if (!product) throw new Error(`Producto no encontrado: ${productId}`)

    const questions = await listQuestionsByProductAdapter(productId, supabase)
    const index = parseInt(questionIndex, 10)

    if (isNaN(index) || index < 0 || index >= questions.length) {
      throw new Error(`Índice de pregunta inválido: ${questionIndex}`)
    }

    const question = questions[index]

    return `
Eres el vendedor de "${product.title}" en un marketplace de tecnología. Un cliente te hizo esta pregunta:

**Producto:** ${product.title} (${product.brand})
**Pregunta:** "${question.question}"

## Instrucciones para tu respuesta
1. **Sé útil:** Responde directamente la pregunta sin rodeos.
2. **Sé honesto:** No inventes características. Si no sabes algo, dilo.
3. **Sé profesional:** Tono amable y comercial.
4. **Sé conciso:** Máximo 100 palabras.
5. **Si es sobre especificaciones:** Remite a la descripción del producto. Si es sobre política: sugiere contactar al soporte.

Redacta la respuesta ahora:
`.trim()
  } catch (error) {
    throw new Error(
      `Error generando prompt redactar_respuesta: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}
