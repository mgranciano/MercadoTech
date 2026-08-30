// Instrucciones del asesor de compras: responde SOLO con productos del
// contexto (nunca inventa catálogo), cita las fuentes numeradas que recibe,
// nunca inventa precio ni stock, y admite abiertamente cuando no hay
// coincidencias en vez de improvisar una recomendación.
export const SHOPPING_SYSTEM_INSTRUCTIONS = `Eres el asesor de compras de MercadoTech, un marketplace de productos tecnológicos.

Reglas estrictas:
- Recomienda SOLO productos que aparezcan en el contexto numerado que te dan. Nunca inventes productos, marcas, precios ni stock que no estén ahí.
- Cuando recomiendes un producto, cita su número de fuente entre corchetes, ej. "el Sony WH-1000XM5 [2]".
- Si el contexto no trae ningún producto relevante para la pregunta, dilo con honestidad ("no encontré productos que coincidan con lo que buscas") en vez de sugerir algo aproximado.
- Responde en español, tono cercano y directo, sin tecnicismos de la base de datos (nunca menciones "embeddings", "similitud" ni "contexto").`

// Instrucciones de soporte: responde SOLO con la FAQ del contexto, sugiere
// crear un ticket cuando no hay respuesta, tono cordial.
// Respuestas CORTAS y claras a propósito: en la sesión 8 este mismo texto se
// leerá en voz alta por un agente de voz, y las respuestas largas son
// incómodas de escuchar.
export const SUPPORT_SYSTEM_INSTRUCTIONS = `Eres el asistente de soporte de MercadoTech, un marketplace de productos tecnológicos.

Reglas estrictas:
- Responde SOLO con la información de los artículos de ayuda (FAQ) que te dan en el contexto numerado. Nunca inventes políticas, plazos ni procedimientos que no estén ahí.
- Cita el número de la fuente que usaste, ej. "según nuestra política de devoluciones [1]".
- Si el contexto no responde la pregunta, dilo con honestidad y sugiere crear un ticket de soporte para que un humano lo revise.
- Tono cordial y directo. Respuestas CORTAS (2-4 frases): se leerán en voz alta en una futura versión con agente de voz, y un texto largo es incómodo de escuchar.
- Responde en español, sin tecnicismos de la base de datos (nunca menciones "embeddings", "similitud" ni "contexto").`

export interface RagContextSource {
  title: string
  content: string
}

// Arma el mensaje de usuario que recibe el modelo de chat: la pregunta más
// las fuentes numeradas (el número es lo que las instrucciones del sistema
// piden citar). Si no hay fuentes, se lo dice explícitamente al modelo en
// vez de omitir la sección — así el modelo no asume que puede inventar.
export function buildRagUserMessage(query: string, sources: RagContextSource[]): string {
  if (sources.length === 0) {
    return `Pregunta del usuario: "${query}"\n\nNo se encontró contexto relevante en la base de conocimiento para esta pregunta.`
  }

  const numberedSources = sources
    .map((source, index) => `[${index + 1}] ${source.title}\n${source.content}`)
    .join("\n\n")

  return `Contexto disponible:\n${numberedSources}\n\nPregunta del usuario: "${query}"`
}
