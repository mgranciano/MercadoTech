import { HUGGINGFACE_CHAT_MAX_TOKENS, HUGGINGFACE_CHAT_MODEL_DEFAULT } from "@/lib/constants/ai"

const CHAT_ENDPOINT = "https://router.huggingface.co/v1/chat/completions"

export interface CompletionResult {
  text: string
  model: string
  stopReason: string | null
}

function getToken(): string {
  const token = process.env.HUGGINGFACEHUB_API_TOKEN
  if (!token) {
    throw new Error(
      "HUGGINGFACEHUB_API_TOKEN no está configurada. Pégala en .env.local siguiendo la sección \"Antes de empezar\" de MercadoTech_sesion4.md."
    )
  }
  return token
}

function getChatModel(): string {
  return process.env.HUGGINGFACE_CHAT_MODEL || HUGGINGFACE_CHAT_MODEL_DEFAULT
}

// fetch directo, NO el SDK: el router OpenAI-compatible es la otra mitad de
// la Guía HF (lección 2) — a diferencia de featureExtraction, chat SÍ está
// disponible ahí, y usar el SDK aquí sería reinventar lo que ya hace fetch.
export async function generateCompletion(system: string, user: string): Promise<CompletionResult> {
  const token = getToken()
  const model = getChatModel()

  let response: Response
  try {
    response = await fetch(CHAT_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: HUGGINGFACE_CHAT_MAX_TOKENS,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(`No se pudo contactar al router de Hugging Face: ${message}`)
  }

  if (response.status === 401) {
    throw new Error(
      "Hugging Face rechazó el token (401): revisa HUGGINGFACEHUB_API_TOKEN en .env.local."
    )
  }

  if (!response.ok) {
    const body = await response.text()
    // "model not supported" / "no provider" = el modelo rotó (Guía HF,
    // lección 3): mensaje accionable en vez de un 4xx genérico.
    if (/not supported|no provider|not found/i.test(body)) {
      throw new Error(
        `El modelo de chat "${model}" ya no tiene proveedor de inferencia gratuito en Hugging Face. Prueba 2-3 candidatos instruct actuales contra la API y actualiza HUGGINGFACE_CHAT_MODEL. Detalle del proveedor: ${body}`
      )
    }
    throw new Error(`Hugging Face respondió con error ${response.status} al modelo "${model}": ${body}`)
  }

  const data = await response.json()
  const choice = data?.choices?.[0]
  const content = choice?.message?.content

  if (typeof content !== "string" || content.length === 0) {
    throw new Error(
      `Respuesta inválida del proveedor de chat para el modelo "${model}": no se encontró choices[0].message.content.`
    )
  }

  return {
    text: content,
    model,
    stopReason: choice.finish_reason ?? null,
  }
}
