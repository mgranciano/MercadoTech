import type { SupabaseClient } from "@supabase/supabase-js"
import { buildProductEmbeddingText, buildSupportArticleEmbeddingText, generateEmbedding } from "@/lib/ai/embeddings"
import type { Database, Json } from "@/types/database"

// El cliente admin lo inyecta el caller (Route Handler o script, Fase 4.3):
// este service ni lo importa ni lo crea, para poder testearlo con cualquier
// cliente sin arrastrar lib/supabase/admin.ts.
type AdminClient = SupabaseClient<Database>

export type EmbeddingSourceType = "producto" | "articulo_soporte"

// pgvector via PostgREST espera el vector como texto "[n1,n2,...]"; los
// tipos generados (types/database.ts) exponen la columna embedding como
// string, no como number[].
function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`
}

async function upsertEmbedding(
  supabase: AdminClient,
  sourceType: EmbeddingSourceType,
  sourceId: string,
  content: string,
  metadata: Json
): Promise<void> {
  const embedding = await generateEmbedding(content)

  const { error } = await supabase.from("knowledge_embeddings").upsert(
    {
      source_type: sourceType,
      source_id: sourceId,
      chunk_index: 0,
      content,
      embedding: toVectorLiteral(embedding),
      metadata,
    },
    { onConflict: "source_type,source_id,chunk_index" }
  )

  if (error) throw error
}

// Carga el producto + su categoría, arma el texto, genera el embedding y
// hace upsert de su ficha. Lanza si el producto no existe: el caller decide
// qué hacer con una fuente inexistente (Fase 4.3).
export async function indexProduct(supabase: AdminClient, productId: string): Promise<void> {
  const { data: product, error } = await supabase
    .from("products")
    .select("*, categories(*)")
    .eq("id", productId)
    .single()

  if (error || !product) {
    throw new Error(`No se encontró el producto ${productId} para indexar.`)
  }

  const { categories, ...productRow } = product
  const text = buildProductEmbeddingText(productRow, categories)

  await upsertEmbedding(supabase, "producto", productId, text, {
    title: productRow.title,
  })
}

export async function indexSupportArticle(supabase: AdminClient, articleId: string): Promise<void> {
  const { data: article, error } = await supabase
    .from("support_articles")
    .select("*")
    .eq("id", articleId)
    .single()

  if (error || !article) {
    throw new Error(`No se encontró el artículo de soporte ${articleId} para indexar.`)
  }

  const text = buildSupportArticleEmbeddingText(article)

  await upsertEmbedding(supabase, "articulo_soporte", articleId, text, {
    title: article.title,
  })
}

// Contraparte de index*: borra la ficha de una fuente que ya no existe
// (producto/artículo borrado). source_id no tiene FK dura (decisión 6,
// migración 0027) — esta es la limpieza explícita que evita que quede
// huérfana para siempre. La llama el Route Handler de reindex (Fase 4.3)
// cuando comprueba que la fuente ya no está.
export async function removeEmbedding(
  supabase: AdminClient,
  sourceType: EmbeddingSourceType,
  sourceId: string
): Promise<void> {
  const { error } = await supabase
    .from("knowledge_embeddings")
    .delete()
    .eq("source_type", sourceType)
    .eq("source_id", sourceId)

  if (error) throw error
}
