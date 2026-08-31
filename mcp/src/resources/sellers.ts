import type { Resource, ResourceTemplate } from '@modelcontextprotocol/sdk/types.js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type Client = SupabaseClient<Database>

export const sellersResource: Resource = {
  uri: 'mercadotech://sellers',
  name: 'Lista de vendedores',
  description:
    'Vendedores activos en la plataforma. Accede a detalles de un vendedor con mercadotech://sellers/{sellerId}.',
  mimeType: 'text/plain',
}

export const sellerTemplate: ResourceTemplate = {
  uriTemplate: 'mercadotech://sellers/{sellerId}',
  name: 'Vendedor',
  description:
    'Perfil de vendedor: nombre, productos activos. Por política de privacidad, no se exponen datos de contacto.',
  mimeType: 'text/plain',
}

export async function getSellersListContent(supabase: Client): Promise<string> {
  try {
    // Decisión 5: solo display_name, no email ni phone
    const { data: sellers, error } = await supabase
      .from('profiles')
      .select('id, display_name')
      .eq('role', 'seller')
      .order('display_name', { ascending: true })

    if (error) throw error

    if (!sellers || sellers.length === 0) {
      return 'No hay vendedores disponibles en este momento.'
    }

    const lines = sellers.map((s) => `- ${s.display_name}`)
    return `Vendedores activos (${sellers.length}):\n\n${lines.join('\n')}`
  } catch (error) {
    throw new Error(`Error listando vendedores: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function getSellerContent(sellerId: string, supabase: Client): Promise<string> {
  try {
    // Política de profiles (Decisión 5): SOLO display_name y productos activos
    const { data: seller, error: sellerError } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', sellerId)
      .eq('role', 'seller')
      .single()

    if (sellerError || !seller) {
      throw new Error(`Vendedor no encontrado: ${sellerId}`)
    }

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, title, price, stock')
      .eq('seller_id', sellerId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (productsError) throw productsError

    const productsList =
      products && products.length > 0
        ? products
            .map((p) => `- ${p.title} - $${Number(p.price).toFixed(2)} (${p.stock} en stock)`)
            .join('\n')
        : '(Sin productos disponibles)'

    return `
# ${seller.display_name}

## Productos activos (${products?.length || 0})
${productsList}
`.trim()
  } catch (error) {
    throw new Error(`Error obteniendo vendedor ${sellerId}: ${error instanceof Error ? error.message : String(error)}`)
  }
}
