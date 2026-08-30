import { InferenceClient } from "@huggingface/inference"
import {
  EMBEDDING_DIMENSIONS,
  EMBEDDING_MODEL_DEFAULT,
  MAX_EMBEDDING_INPUT_CHARS,
} from "@/lib/constants/ai"
import type { Category } from "@/types/category"
import type { Product } from "@/types/product"
import type { Database } from "@/types/database"

type SupportArticle = Database["public"]["Tables"]["support_articles"]["Row"]

function getToken(): string {
  const token = process.env.HUGGINGFACEHUB_API_TOKEN
  if (!token) {
    throw new Error(
      "HUGGINGFACEHUB_API_TOKEN no está configurada. Pégala en .env.local siguiendo la sección \"Antes de empezar\" de MercadoTech_sesion4.md."
    )
  }
  return token
}

function getEmbeddingModel(): string {
  return process.env.HUGGINGFACE_EMBEDDING_MODEL || EMBEDDING_MODEL_DEFAULT
}

// SDK oficial, no fetch: Hugging Face documenta que feature-extraction NO
// está disponible en su endpoint REST OpenAI-compatible (Guía HF, lección 1).
export async function generateEmbedding(text: string): Promise<number[]> {
  const model = getEmbeddingModel()
  const client = new InferenceClient(getToken())

  let result: unknown
  try {
    result = await client.featureExtraction({ model, inputs: text })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes("401")) {
      throw new Error(
        `Hugging Face rechazó el token al generar el embedding (401): revisa HUGGINGFACEHUB_API_TOKEN en .env.local.`
      )
    }
    throw new Error(`No se pudo generar el embedding con el modelo "${model}": ${message}`)
  }

  // sentence-transformers/all-MiniLM-L6-v2 devuelve un vector plano de 384
  // números; otros modelos devuelven una matriz por token (number[][]).
  // Mejor un error claro aquí que una fila corrupta en knowledge_embeddings
  // (Guía HF, lección 5).
  if (!Array.isArray(result) || result.some((value) => typeof value !== "number")) {
    throw new Error(
      `Embedding con forma inesperada del modelo "${model}": se esperaba un vector numérico plano.`
    )
  }

  if (result.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `El modelo "${model}" devolvió un vector de longitud ${result.length}, se esperaban ${EMBEDDING_DIMENSIONS}. Si cambiaste de modelo, revisa lib/constants/ai.ts y la migración de knowledge_embeddings.`
    )
  }

  return result as number[]
}

function truncateForEmbedding(text: string): string {
  return text.length > MAX_EMBEDDING_INPUT_CHARS ? text.slice(0, MAX_EMBEDDING_INPUT_CHARS) : text
}

// Secciones etiquetadas en orden de mayor a menor densidad semántica: si
// MiniLM trunca (lección 4), se pierde primero la descripción, no el título
// ni la marca.
export function buildProductEmbeddingText(product: Product, category: Category | null): string {
  const lines = [
    `Título: ${product.title}`,
    product.brand ? `Marca: ${product.brand}` : null,
    category ? `Categoría: ${category.name}` : null,
    `Condición: ${product.condition}`,
    product.description ? `Descripción: ${product.description}` : null,
  ].filter((line): line is string => line !== null)

  return truncateForEmbedding(lines.join("\n"))
}

export function buildSupportArticleEmbeddingText(article: SupportArticle): string {
  const lines = [
    `Título: ${article.title}`,
    article.category ? `Categoría: ${article.category}` : null,
    `Contenido: ${article.content}`,
  ].filter((line): line is string => line !== null)

  return truncateForEmbedding(lines.join("\n"))
}
