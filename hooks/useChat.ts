"use client"

import { useState } from "react"
import { getProductById } from "@/services/product.service"
import type { ChatMessage, ChatResult, ChatSource } from "@/types/chat"

interface UseChatOptions {
  mode: "compras" | "soporte"
}

// Fuentes de tipo 'producto' llegan del endpoint sin imagen/precio
// (context-builder es puro, nunca toca Supabase): se hidratan aquí, en el
// hook, reutilizando product.service — igual que cualquier otro componente
// del catálogo. Si una hidratación falla, la fuente queda sin imagen/precio
// pero el mensaje se muestra igual.
async function hydrateSources(sources: ChatSource[]): Promise<ChatSource[]> {
  return Promise.all(
    sources.map(async (source) => {
      if (source.source_type !== "producto") return source

      try {
        const product = await getProductById(source.source_id)
        if (!product) return source
        return { ...source, image_url: product.image_url, price: product.price }
      } catch {
        return source
      }
    })
  )
}

export function useChat({ mode }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)

  const sendMessage = async (content: string) => {
    const query = content.trim()
    if (!query || loading) return

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", content: query }])
    setLoading(true)

    try {
      const response = await fetch("/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, mode }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error?.message || "No pude procesar tu consulta, intenta de nuevo.")
      }

      const result = (await response.json()) as ChatResult
      const sources = await hydrateSources(result.sources)

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: result.answer, sources },
      ])
    } catch {
      // El chat NUNCA se rompe: cualquier error del servidor se convierte
      // en un mensaje más de la conversación, no en una pantalla rota.
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "No pude procesar tu consulta, intenta de nuevo.",
          isError: true,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return { messages, loading, sendMessage }
}
