// Tunables de la capa de IA (Sesión 4, RAG). Ningún valor aquí es arbitrario:
// cada uno viene de una lección de la Guía Hugging Face (heredada de
// ReadHub) o de una decisión cerrada de la spec. Cambiarlos aquí basta —
// nada en lib/ai/ ni en los services debe tener estos números hardcodeados.

// Dimensión fija del modelo de embeddings vigente. También queda grabada en
// la columna SQL (vector(384), migración 0027): cambiar de modelo a otro con
// distinta dimensión exige ALTER COLUMN ... TYPE vector(N) + recrear el
// índice HNSW y match_knowledge, no solo tocar esta constante.
export const EMBEDDING_DIMENSIONS = 384

// Proveedor de IA — decisión cerrada, no se re-decide (spec, "Proveedor de
// IA"). Reemplazable solo vía HUGGINGFACE_EMBEDDING_MODEL si hiciera falta.
export const EMBEDDING_MODEL_DEFAULT = "sentence-transformers/all-MiniLM-L6-v2"

// MiniLM acepta máximo 256 tokens (~1000 caracteres) y trunca lo que sobra
// EN SILENCIO, sin avisar (Guía HF, lección 4). Por eso el texto a vectorizar
// se arma con las señales más valiosas primero (título, marca, categoría) y
// el contenido largo al final: si algo se corta, se corta lo menos
// importante.
export const MAX_EMBEDDING_INPUT_CHARS = 1000

// Cuántas fichas trae por defecto una búsqueda semántica antes de filtrar.
export const VECTOR_SEARCH_DEFAULT_TOP_K = 5

// Techo de fichas que puede pedir un caller, para no desproporcionar el
// costo de Hugging Face ni el ruido de contexto.
export const VECTOR_SEARCH_MAX_TOP_K = 20

// Provisional (Guía HF, lección 7): pares de texto NO relacionados ya rondan
// 0.1–0.2 de similitud (comparten idioma); los relacionados suelen superar
// 0.4. Se parte de 0.3 y se calibra con datos reales en la Fase 4.8.
export const VECTOR_SEARCH_DEFAULT_SIMILARITY_THRESHOLD = 0.3

// Cuántas fuentes, como máximo, entran al mensaje final tras filtrar y
// ordenar por similitud (Fase 4.5).
export const CONTEXT_BUILDER_DEFAULT_MAX_SOURCES = 5

// Mismo umbral que la búsqueda: evita colar ruido al contexto aunque el
// caller pida más fuentes de las que hay relevantes.
export const CONTEXT_BUILDER_DEFAULT_MIN_SIMILARITY = 0.3

// Descarta fichas casi vacías (ej. contenido corrupto o truncado a nada)
// antes de gastar presupuesto de contexto en ellas.
export const CONTEXT_BUILDER_MIN_CONTENT_LENGTH = 20

// Presupuesto de caracteres que entra al mensaje de usuario del modelo de
// chat: evita exceder su ventana de contexto y encarecer la llamada.
export const CONTEXT_BUILDER_DEFAULT_MAX_CONTEXT_CHARS = 8000

// Si al presupuesto le quedan menos de esto para la última fuente, se
// descarta entera en vez de recortarla: media frase confunde más de lo que
// aporta.
export const CONTEXT_BUILDER_MIN_TRUNCATED_SOURCE_CHARS = 200

// Proveedor de IA — decisión cerrada (spec, "Proveedor de IA"). Si rota
// (Guía HF, lección 3: zephyr-7b-beta, Qwen2.5-7B-Instruct y
// Mistral-7B-Instruct-v0.3 ya perdieron proveedor gratuito cuando ReadHub
// probó), se reemplaza SOLO vía HUGGINGFACE_CHAT_MODEL — cero cambios de
// código.
export const HUGGINGFACE_CHAT_MODEL_DEFAULT = "meta-llama/Llama-3.1-8B-Instruct"

// Techo de tokens de la respuesta del modelo de chat: control de costo y
// latencia (las respuestas de soporte además deben ser cortas por diseño,
// ver SUPPORT_SYSTEM_INSTRUCTIONS en lib/ai/prompts.ts).
export const HUGGINGFACE_CHAT_MAX_TOKENS = 1024

// Límite de la pregunta del usuario antes de llegar al endpoint de chat
// (Fase 4.6): evita prompts desproporcionados y abuso de la cuota gratuita.
export const CHAT_QUERY_MAX_CHARS = 4000
