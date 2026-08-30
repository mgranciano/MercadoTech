import type { SupabaseClient } from "@supabase/supabase-js"
import { generateEmbedding } from "@/lib/ai/embeddings"
import { mapProductToDetails } from "@/services/product.service"
import {
  VECTOR_SEARCH_DEFAULT_SIMILARITY_THRESHOLD,
  VECTOR_SEARCH_DEFAULT_TOP_K,
  VECTOR_SEARCH_MAX_TOP_K,
} from "@/lib/constants/ai"
import type { Database } from "@/types/database"
import type { ProductRow, ProductWithDetails } from "@/types/product"

// El cliente lo inyecta el caller (Route Handler, Fase 4.4): de sesión para
// /search/semantic (RLS de knowledge_embeddings aplica), o el que el caller
// decida en otros contextos.
type Client = SupabaseClient<Database>

export interface VectorSearchOptions {
  sourceType?: "producto" | "articulo_soporte" | null
  topK?: number
  similarityThreshold?: number
}

export interface VectorMatch {
  source_type: string
  source_id: string
  content: string
  metadata: unknown
  similarity: number
}

// pgvector via PostgREST espera el vector como texto "[n1,n2,...]", igual
// que en embedding.service.ts.
function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`
}

export async function searchByEmbedding(
  embedding: number[],
  supabase: Client,
  options: VectorSearchOptions = {}
): Promise<VectorMatch[]> {
  const matchCount = Math.min(options.topK ?? VECTOR_SEARCH_DEFAULT_TOP_K, VECTOR_SEARCH_MAX_TOP_K)
  const similarityThreshold = options.similarityThreshold ?? VECTOR_SEARCH_DEFAULT_SIMILARITY_THRESHOLD

  const { data, error } = await supabase.rpc("match_knowledge", {
    query_embedding: toVectorLiteral(embedding),
    p_source_type: options.sourceType ?? undefined,
    match_count: matchCount,
    similarity_threshold: similarityThreshold,
  })

  if (error) throw error
  return (data ?? []) as VectorMatch[]
}

export interface ProductSearchResult extends ProductWithDetails {
  similarity: number
}

// Embedding de la consulta + matching (source_type='producto') + hidratación
// contra products activos: precio e imagen SIEMPRE actuales (nunca lo que
// quedó congelado en la ficha), descartando huérfanos (producto borrado o
// desactivado desde que se indexó, decisión 6). Misma forma de hidratación
// que product.service.mapProductToDetails.
export async function searchProducts(
  query: string,
  supabase: Client,
  options: VectorSearchOptions = {}
): Promise<ProductSearchResult[]> {
  const embedding = await generateEmbedding(query)
  const matches = await searchByEmbedding(embedding, supabase, {
    ...options,
    sourceType: "producto",
  })

  const results: ProductSearchResult[] = []

  for (const match of matches) {
    const { data: product, error } = await supabase
      .from("products")
      .select("*, product_images(id, image_path, position), reviews(id, rating)")
      .eq("id", match.source_id)
      .eq("is_active", true)
      .maybeSingle()

    if (error || !product) continue

    const details = await mapProductToDetails(product as ProductRow)
    results.push({ ...details, similarity: match.similarity })
  }

  return results
}
