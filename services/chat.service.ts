import type { SupabaseClient } from "@supabase/supabase-js"
import { searchKnowledge } from "@/services/vector-search.service"
import { buildContext } from "@/lib/ai/context-builder"
import { generateCompletion } from "@/lib/ai/completion"
import { SHOPPING_SYSTEM_INSTRUCTIONS, SUPPORT_SYSTEM_INSTRUCTIONS } from "@/lib/ai/prompts"
import type { Database } from "@/types/database"
import type { ChatResult } from "@/types/chat"

type Client = SupabaseClient<Database>

export type ChatMode = "compras" | "soporte"

export interface AskOptions {
  topK?: number
  similarityThreshold?: number
}

const MODE_SOURCE_TYPE: Record<ChatMode, "producto" | "articulo_soporte"> = {
  compras: "producto",
  soporte: "articulo_soporte",
}

const MODE_INSTRUCTIONS: Record<ChatMode, string> = {
  compras: SHOPPING_SYSTEM_INSTRUCTIONS,
  soporte: SUPPORT_SYSTEM_INSTRUCTIONS,
}

// Orquesta SIN reimplementar: búsqueda (vector-search) → contexto
// (context-builder) → redacción (lib/ai/completion). Si mañana cambia el
// proveedor de chat, el umbral, o se agrega una fuente nueva, se toca la
// capa dueña de eso — nunca este archivo.
export async function ask(
  query: string,
  mode: ChatMode,
  opts: AskOptions,
  supabase: Client
): Promise<ChatResult> {
  const matches = await searchKnowledge(query, supabase, {
    sourceType: MODE_SOURCE_TYPE[mode],
    topK: opts.topK,
    similarityThreshold: opts.similarityThreshold,
  })

  const context = buildContext(query, matches)

  // Sin contexto relevante, la completion IGUAL se llama: las instrucciones
  // del modo ya dicen qué responder ("no encontré…" / sugerir ticket). No
  // hay atajo que devuelva una respuesta enlatada aquí.
  const completion = await generateCompletion(MODE_INSTRUCTIONS[mode], context.userMessage)

  return {
    query,
    answer: completion.text,
    hasRelevantContext: context.sources.length > 0,
    sources: context.sources,
    metadata: {
      model: completion.model,
      retrievedCount: matches.length,
      usedSourceCount: context.sources.length,
      contextTruncated: context.stats.contextTruncated,
    },
  }
}
