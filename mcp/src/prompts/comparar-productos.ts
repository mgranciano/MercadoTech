import type { Prompt } from '@modelcontextprotocol/sdk/types.js'
import { getProductByIdAdapter } from '../shared/adapters.js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type Client = SupabaseClient<Database>

export const compararProductosPrompt: Prompt = {
  name: 'comparar_productos',
  description: 'Compara dos productos y ayuda al cliente a elegir el mejor según su caso de uso.',
  arguments: [
    {
      name: 'product_id_1',
      description: 'UUID del primer producto',
      required: true,
    },
    {
      name: 'product_id_2',
      description: 'UUID del segundo producto',
      required: true,
    },
  ],
}

export async function getCompararProductosContent(
  productId1: string,
  productId2: string,
  supabase: Client
): Promise<string> {
  try {
    const p1 = await getProductByIdAdapter(productId1, supabase)
    const p2 = await getProductByIdAdapter(productId2, supabase)

    if (!p1 || !p2) {
      throw new Error(`Uno o ambos productos no encontrados`)
    }

    return `
Eres un asesor de compra en un marketplace de tecnología. Tu tarea es comparar estos dos productos y ayudar al cliente a elegir:

## Producto 1
**${p1.title}** (${p1.brand})
- Precio: $${p1.price.toFixed(2)}
- Calificación: ${p1.average_rating}/5 (${p1.review_count} reseñas)
- Stock: ${p1.stock} unidades
- Condición: ${p1.condition}

## Producto 2
**${p2.title}** (${p2.brand})
- Precio: $${p2.price.toFixed(2)}
- Calificación: ${p2.average_rating}/5 (${p2.review_count} reseñas)
- Stock: ${p2.stock} unidades
- Condición: ${p2.condition}

## Instrucciones
1. **Sé objetivo:** Compara solo hechos, no inventes especificaciones.
2. **Considera el precio:** Analiza relación precio-valor.
3. **Considera la disponibilidad:** ¿Hay stock? ¿Cuál es la mejor opción si uno se agota?
4. **Sugiere casos de uso:** Para quién es mejor cada uno.
5. **Tono:** Honesto y sin presión — ayuda al cliente a decidir por sí mismo.
6. **Si necesitas más información:** Usa las herramientas \`get_product_reviews\` y \`get_product_questions\`.

Realiza la comparación ahora:
`.trim()
  } catch (error) {
    throw new Error(
      `Error generando prompt comparar_productos: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}
