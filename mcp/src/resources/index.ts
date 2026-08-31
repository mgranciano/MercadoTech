import type { Resource, ResourceTemplate } from '@modelcontextprotocol/sdk/types.js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { infoResource, getInfoContent } from './info.js'
import {
  productsResource,
  productTemplate,
  getProductsListContent,
  getProductContent,
} from './products.js'
import {
  sellersResource,
  sellerTemplate,
  getSellersListContent,
  getSellerContent,
} from './sellers.js'
import { categoriesResource, getCategoriesContent } from './categories.js'
import { faqResource, getFaqContent } from './faq.js'
import { statsResource, getStatsContent } from './stats.js'

type Client = SupabaseClient<Database>

export const RESOURCES: Resource[] = [
  infoResource,
  productsResource,
  sellersResource,
  categoriesResource,
  faqResource,
  statsResource,
]

export const RESOURCE_TEMPLATES: ResourceTemplate[] = [productTemplate, sellerTemplate]

// Mapa de URIs a funciones de contenido (Lección 7: cada resource captura sus propios errores)
type ResourceHandler = (supabase: Client, ...args: string[]) => Promise<string>

const resourceHandlers: Record<string, ResourceHandler> = {
  'mercadotech://info': async () => getInfoContent(),
  'mercadotech://products': getProductsListContent,
  'mercadotech://sellers': getSellersListContent,
  'mercadotech://categories': getCategoriesContent,
  'mercadotech://faq': getFaqContent,
  'mercadotech://stats': getStatsContent,
}

export async function getResourceContent(uri: string, supabase: Client): Promise<string> {
  // Maneja mercadotech://products/{id}
  if (uri.startsWith('mercadotech://products/')) {
    const productId = uri.split('/').pop()
    if (!productId) throw new Error('Invalid product URI')
    return getProductContent(productId, supabase)
  }

  // Maneja mercadotech://sellers/{sellerId}
  if (uri.startsWith('mercadotech://sellers/')) {
    const sellerId = uri.split('/').pop()
    if (!sellerId) throw new Error('Invalid seller URI')
    return getSellerContent(sellerId, supabase)
  }

  // Maneja resources estáticos
  const handler = resourceHandlers[uri]
  if (!handler) {
    throw new Error(`Resource no encontrado: ${uri}`)
  }

  return handler(supabase)
}

// Lista todos los resources con manejo de errores degradado
export async function listAllResources(supabase: Client): Promise<Array<Resource & { error?: string }>> {
  const results: Array<Resource & { error?: string }> = []

  // Resources estáticos — siempre disponibles
  results.push(infoResource)

  // Resources que dependen de Supabase — capturan su propio error
  for (const resource of [
    productsResource,
    sellersResource,
    categoriesResource,
    faqResource,
    statsResource,
  ]) {
    try {
      // Validar que el resource es accesible intentando cargar su contenido
      await getResourceContent(resource.uri, supabase)
      results.push(resource)
    } catch (error) {
      // Lección 7: no falla toda la lista, solo marca este resource como degradado
      results.push({
        ...resource,
        error: `${error instanceof Error ? error.message : String(error)}`,
      })
    }
  }

  return results
}
