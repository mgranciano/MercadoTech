export interface ChatSource {
  source_type: string
  source_id: string
  title: string
  similarity: number
}

// Historial de conversación (Fase 4.7): sources solo lo llevan los mensajes
// del asistente; isError marca un fallo del servidor convertido en mensaje
// inline, para que la conversación nunca se rompa.
export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: ChatSource[]
  isError?: boolean
}

export interface ChatResult {
  query: string
  answer: string
  hasRelevantContext: boolean
  sources: ChatSource[]
  metadata: {
    model: string
    retrievedCount: number
    usedSourceCount: number
    contextTruncated: boolean
  }
}
