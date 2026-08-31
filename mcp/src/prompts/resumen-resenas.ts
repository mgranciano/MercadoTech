import type { Prompt } from '@modelcontextprotocol/sdk/types.js'
import { listReviewsByProductAdapter, getProductByIdAdapter } from '../shared/adapters.js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type Client = SupabaseClient<Database>

export const resumenResenaPrompt: Prompt = {
  name: 'resumen_de_resenas',
  description:
    'Genera un resumen ejecutivo de las reseñas de un producto: puntos fuertes, debilidades y recomendación general.',
  arguments: [
    {
      name: 'product_id',
      description: 'UUID del producto',
      required: true,
    },
  ],
}

export async function getResumenResenaContent(productId: string, supabase: Client): Promise<string> {
  try {
    const product = await getProductByIdAdapter(productId, supabase)
    if (!product) throw new Error(`Producto no encontrado: ${productId}`)

    const reviews = await listReviewsByProductAdapter(productId, supabase)

    const reviewsText =
      reviews.length > 0
        ? reviews
            .slice(0, 10) // Primeras 10 reseñas
            .map((r) => `- ${r.rating}/5: "${r.comment}"`)
            .join('\n')
        : '(Sin reseñas aún)'

    return `
Eres un analista de reseñas. Tu tarea es resumir las opiniones de clientes sobre este producto:

**Producto:** ${product.title} (${product.brand})
**Precio:** $${product.price.toFixed(2)}
**Calificación general:** ${product.average_rating}/5 (${product.review_count} reseñas)

## Reseñas (muestra de las últimas 10)
${reviewsText}

## Instrucciones
1. **Identifica patrones:** ¿Qué dicen repetidamente los clientes?
2. **Puntos fuertes:** ¿Qué les gustó?
3. **Puntos débiles:** ¿Qué no funcionó?
4. **Recomendación:** ¿Es un buen producto? ¿Para quién?
5. **Sé objetivo:** Resume solo lo que dicen las reseñas, sin inventar.
6. **Máximo 150 palabras.**

Redacta el resumen ahora:
`.trim()
  } catch (error) {
    throw new Error(
      `Error generando prompt resumen_de_resenas: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}
