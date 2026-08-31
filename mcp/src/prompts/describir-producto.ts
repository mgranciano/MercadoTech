import type { Prompt } from '@modelcontextprotocol/sdk/types.js'
import { getProductByIdAdapter } from '../shared/adapters.js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type Client = SupabaseClient<Database>

export const describirProductoPrompt: Prompt = {
  name: 'describir_producto',
  description:
    'Genera una descripción comercial de un producto: características, beneficios y por qué es recomendado.',
  arguments: [
    {
      name: 'product_id',
      description: 'UUID del producto a describir',
      required: true,
    },
  ],
}

export async function getDescribirProductoContent(productId: string, supabase: Client): Promise<string> {
  try {
    const product = await getProductByIdAdapter(productId, supabase)

    if (!product) {
      throw new Error(`Producto no encontrado: ${productId}`)
    }

    return `
Eres un especialista en redacción de descripciones de productos para un marketplace de tecnología. Tu tarea es redactar una descripción comercial honesta y convincente del siguiente producto:

**Producto:** ${product.title}
**Marca:** ${product.brand}
**Precio actual:** $${product.price.toFixed(2)}
**Stock:** ${product.stock} unidades
**Condición:** ${product.condition}
**Calificación:** ${product.average_rating}/5 (${product.review_count} reseñas)

**Descripción actual:**
${product.description || '(Sin descripción)'}

## Instrucciones
1. **Sé honesto:** No inventes características ni especificaciones. Solo usa lo que está disponible.
2. **Enfócate en beneficios:** Explica para quién es este producto y qué problemas resuelve.
3. **Sé conciso:** Máximo 150 palabras.
4. **Tono:** Comercial pero honesto — no exageres ni hagas promesas falsas.
5. **Si necesitas más información:** Usa las herramientas \`get_product_reviews\` y \`get_product_questions\` para leer qué dicen los clientes.

Redacta la descripción ahora:
`.trim()
  } catch (error) {
    throw new Error(
      `Error generando prompt describir_producto: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}
