import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { apiError } from "@/lib/api-response"
import {
  indexProduct,
  indexSupportArticle,
  removeEmbedding,
  type EmbeddingSourceType,
} from "@/services/embedding.service"

const VALID_SOURCE_TYPES: EmbeddingSourceType[] = ["producto", "articulo_soporte"]

interface ReindexBody {
  sourceType?: string
  sourceId?: string
}

// Solo el service role escribe en knowledge_embeddings (RLS de la Fase 4.1):
// este endpoint es de los únicos dos lugares del proyecto, junto a
// scripts/index-all.ts, donde se usa el cliente admin.
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return apiError(401, "unauthorized", "Debes iniciar sesión para reindexar.")
  }

  let body: ReindexBody
  try {
    body = (await request.json()) as ReindexBody
  } catch {
    return apiError(400, "invalid_body", "El cuerpo debe ser JSON válido.")
  }

  const { sourceType, sourceId } = body

  if (
    !sourceType ||
    !VALID_SOURCE_TYPES.includes(sourceType as EmbeddingSourceType) ||
    !sourceId
  ) {
    return apiError(
      400,
      "invalid_body",
      "sourceType debe ser 'producto' o 'articulo_soporte', y sourceId es requerido."
    )
  }

  const admin = createAdminClient()
  const table = sourceType === "producto" ? "products" : "support_articles"

  try {
    const { data: source } = await admin.from(table).select("id").eq("id", sourceId).maybeSingle()

    // Decisión 6: source_id no tiene FK dura. Si la fuente ya no existe
    // (producto/artículo borrado), la ficha queda huérfana salvo que se
    // borre explícitamente aquí.
    if (!source) {
      await removeEmbedding(admin, sourceType as EmbeddingSourceType, sourceId)
      return NextResponse.json({ status: "removed" })
    }

    if (sourceType === "producto") {
      await indexProduct(admin, sourceId)
    } else {
      await indexSupportArticle(admin, sourceId)
    }

    return NextResponse.json({ status: "indexed" })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido al reindexar."
    return apiError(500, "reindex_failed", message)
  }
}
