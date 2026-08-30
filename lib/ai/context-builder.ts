import {
  CONTEXT_BUILDER_DEFAULT_MAX_CONTEXT_CHARS,
  CONTEXT_BUILDER_DEFAULT_MAX_SOURCES,
  CONTEXT_BUILDER_DEFAULT_MIN_SIMILARITY,
  CONTEXT_BUILDER_MIN_CONTENT_LENGTH,
  CONTEXT_BUILDER_MIN_TRUNCATED_SOURCE_CHARS,
} from "@/lib/constants/ai"
import { buildRagUserMessage } from "@/lib/ai/prompts"

// Entrada: una ficha ya recuperada por vector-search (misma forma que
// devuelve match_knowledge). Función pura: cero I/O, cero Supabase, cero
// React — se testea en aislamiento en la sesión 6.
export interface ContextCandidate {
  source_type: string
  source_id: string
  content: string
  metadata: unknown
  similarity: number
}

export interface ContextBuilderOptions {
  maxSources?: number
  minSimilarity?: number
  minContentLength?: number
  maxContextChars?: number
  minTruncatedSourceChars?: number
}

export interface ContextSource {
  source_type: string
  source_id: string
  title: string
  similarity: number
}

export interface ContextBuilderResult {
  userMessage: string
  sources: ContextSource[]
  stats: {
    contextTruncated: boolean
    totalChars: number
  }
}

function extractTitle(metadata: unknown, fallback: string): string {
  if (metadata && typeof metadata === "object" && "title" in metadata) {
    const title = (metadata as { title?: unknown }).title
    if (typeof title === "string" && title.length > 0) return title
  }
  return fallback
}

export function buildContext(
  query: string,
  candidates: ContextCandidate[],
  options: ContextBuilderOptions = {}
): ContextBuilderResult {
  const maxSources = options.maxSources ?? CONTEXT_BUILDER_DEFAULT_MAX_SOURCES
  const minSimilarity = options.minSimilarity ?? CONTEXT_BUILDER_DEFAULT_MIN_SIMILARITY
  const minContentLength = options.minContentLength ?? CONTEXT_BUILDER_MIN_CONTENT_LENGTH
  const maxContextChars = options.maxContextChars ?? CONTEXT_BUILDER_DEFAULT_MAX_CONTEXT_CHARS
  const minTruncatedSourceChars =
    options.minTruncatedSourceChars ?? CONTEXT_BUILDER_MIN_TRUNCATED_SOURCE_CHARS

  // (1) Selección: filtra por relevancia y contenido mínimo, ordena por
  // similitud descendente, corta a maxSources.
  const selected = candidates
    .filter((c) => c.similarity >= minSimilarity && c.content.length >= minContentLength)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, maxSources)

  // (2) Presupuesto: acumula en orden de similitud. La primera fuente que no
  // quepa entera corta la acumulación ahí — las siguientes son, por
  // definición, menos relevantes, así que no tiene sentido buscar una más
  // chica que sí quepa (esto no es bin-packing, es un resumen priorizado).
  const accepted: ContextCandidate[] = []
  let totalChars = 0
  let contextTruncated = false

  for (const candidate of selected) {
    const remaining = maxContextChars - totalChars

    if (remaining <= 0) {
      contextTruncated = true
      break
    }

    if (candidate.content.length <= remaining) {
      accepted.push(candidate)
      totalChars += candidate.content.length
      continue
    }

    // No cabe entera. Si lo que queda de presupuesto todavía alcanza un
    // mínimo útil, se trunca; si no, media frase confunde más de lo que
    // aporta y se descarta entera.
    if (remaining >= minTruncatedSourceChars) {
      accepted.push({ ...candidate, content: candidate.content.slice(0, remaining) })
      totalChars += remaining
    }

    contextTruncated = true
    break
  }

  const sources: ContextSource[] = accepted.map((c) => ({
    source_type: c.source_type,
    source_id: c.source_id,
    title: extractTitle(c.metadata, c.content.slice(0, 40)),
    similarity: c.similarity,
  }))

  const userMessage = buildRagUserMessage(
    query,
    accepted.map((c) => ({
      title: extractTitle(c.metadata, c.content.slice(0, 40)),
      content: c.content,
    }))
  )

  return { userMessage, sources, stats: { contextTruncated, totalChars } }
}
