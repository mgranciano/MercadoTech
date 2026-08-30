import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { apiError } from "@/lib/api-response"
import { ask, type ChatMode } from "@/services/chat.service"
import { CHAT_QUERY_MAX_CHARS } from "@/lib/constants/ai"

interface ChatBody {
  query?: string
  mode?: string
}

const VALID_MODES: ChatMode[] = ["compras", "soporte"]

// Cliente de SESIÓN (no admin): la búsqueda respeta la RLS de
// knowledge_embeddings (solo authenticated, decisión 1) igual que en
// /search/semantic.
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return apiError(401, "unauthorized", "Debes iniciar sesión para usar el asistente.")
  }

  let body: ChatBody
  try {
    body = (await request.json()) as ChatBody
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

  if (!body.mode || !VALID_MODES.includes(body.mode as ChatMode)) {
    return apiError(422, "invalid_mode", "mode debe ser 'compras' o 'soporte'.")
  }

  try {
    const result = await ask(query, body.mode as ChatMode, {}, supabase)

    // Insumo de la calibración de la Fase 4.8: retrievedCount/usedSourceCount
    // /hasRelevantContext por consulta, en un formato fácil de grep en la
    // terminal del server.
    console.log(
      JSON.stringify({
        endpoint: "chat",
        mode: body.mode,
        retrievedCount: result.metadata.retrievedCount,
        usedSourceCount: result.metadata.usedSourceCount,
        hasRelevantContext: result.hasRelevantContext,
        model: result.metadata.model,
      })
    )

    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido al conversar."
    return apiError(500, "chat_failed", message)
  }
}
