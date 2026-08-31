import type { Prompt } from '@modelcontextprotocol/sdk/types.js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import {
  describirProductoPrompt,
  getDescribirProductoContent,
} from './describir-producto.js'
import {
  compararProductosPrompt,
  getCompararProductosContent,
} from './comparar-productos.js'
import {
  redactarRespuestaPrompt,
  getRedactarRespuestaContent,
} from './redactar-respuesta.js'
import { resumenResenaPrompt, getResumenResenaContent } from './resumen-resenas.js'
import {
  generarArticuloFaqPrompt,
  getGenerarArticuloFaqContent,
} from './generar-faq.js'

type Client = SupabaseClient<Database>

export const PROMPTS: Prompt[] = [
  describirProductoPrompt,
  compararProductosPrompt,
  redactarRespuestaPrompt,
  resumenResenaPrompt,
  generarArticuloFaqPrompt,
]

type PromptHandler = (supabase: Client, ...args: string[]) => Promise<string>

const promptHandlers: Record<string, PromptHandler> = {
  describir_producto: (supabase, productId) => getDescribirProductoContent(productId, supabase),
  comparar_productos: (supabase, p1, p2) => getCompararProductosContent(p1, p2, supabase),
  redactar_respuesta_pregunta: (supabase, productId, questionIndex) =>
    getRedactarRespuestaContent(productId, questionIndex, supabase),
  resumen_de_resenas: (supabase, productId) => getResumenResenaContent(productId, supabase),
  generar_articulo_faq: (supabase, topic) => getGenerarArticuloFaqContent(topic, supabase),
}

export async function getPromptContent(
  name: string,
  supabase: Client,
  args: string[]
): Promise<string> {
  const handler = promptHandlers[name]

  if (!handler) {
    throw new Error(`Prompt no encontrado: ${name}`)
  }

  try {
    return await handler(supabase, ...args)
  } catch (error) {
    throw new Error(
      `Error en prompt ${name}: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}
