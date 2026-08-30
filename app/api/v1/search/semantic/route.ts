import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { apiError } from "@/lib/api-response"
import { searchProducts } from "@/services/vector-search.service"
import { CHAT_QUERY_MAX_CHARS } from "@/lib/constants/ai"

interface SearchBody {
  query?: string
}

// El embedding de la consulta se genera AQUÍ, server-side: el token de
// Hugging Face jamás viaja al navegador. Usa el cliente de SESIÓN (no
// admin) para el RPC, así la RLS de knowledge_embeddings (solo
// authenticated, decisión 1) aplica igual que en cualquier query directa.
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return apiError(401, "unauthorized", "Debes iniciar sesión para usar la búsqueda inteligente.")
  }

  let body: SearchBody
  try {
    body = (await request.json()) as SearchBody
  } catch {
    return apiError(400, "invalid_body", "El cuerpo debe ser JSON válido.")
  }

  const query = body.query?.trim()

  if (!query) {
    return apiError(400, "invalid_query", "query no puede estar vacío.")
  }

  if (query.length > CHAT_QUERY_MAX_CHARS) {
    return apiError(400, "invalid_query", `query no puede superar ${CHAT_QUERY_MAX_CHARS} caracteres.`)
  }

  try {
    const results = await searchProducts(query, supabase)
    return NextResponse.json({ results })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido al buscar."
    return apiError(500, "search_failed", message)
  }
}
