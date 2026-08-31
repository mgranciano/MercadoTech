import type { Resource, ResourceTemplate } from '@modelcontextprotocol/sdk/types.js'
import { getProductByIdAdapter, listCategoriesAdapter } from '../shared/adapters.js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type Client = SupabaseClient<Database>

export const productsResource: Resource = {
  uri: 'mercadotech://products',
  name: 'Lista de productos',
  description:
    'Catálogo completo de productos activos. Accede a productos individuales con mercadotech://products/{id}.',
  mimeType: 'text/plain',
}

export const productTemplate: ResourceTemplate = {
  uriTemplate: 'mercadotech://products/{id}',
  name: 'Producto',
  description:
    'Detalles completos de un producto: especificaciones, precio, reseñas, preguntas y disponibilidad.',
  mimeType: 'text/plain',
}

export async function getProductsListContent(supabase: Client): Promise<string> {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, title, brand, price, stock, category_id')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error

    if (!products || products.length === 0) {
      return 'No hay productos disponibles en este momento.'
    }

    const lines = products.map((p) => `- ${p.title} (${p.brand}) - $${Number(p.price).toFixed(2)} - Stock: ${p.stock}`)
    return `Productos disponibles (${products.length}):\n\n${lines.join('\n')}`
  } catch (error) {
    throw new Error(`Error listando productos: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function getProductContent(id: string, supabase: Client): Promise<string> {
  try {
    const product = await getProductByIdAdapter(id, supabase)

    if (!product) {
      throw new Error(`Producto no encontrado: ${id}`)
    }

    return `
# ${product.title}

**Marca:** ${product.brand}
**Precio:** $${product.price.toFixed(2)}
**Stock disponible:** ${product.stock} unidades
**Condición:** ${product.condition}
**Calificación:** ${product.average_rating}/5 (${product.review_count} reseñas)

## Descripción
${product.description || '(Sin descripción disponible)'}
`.trim()
  } catch (error) {
    throw new Error(
      `Error obteniendo producto ${id}: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}
