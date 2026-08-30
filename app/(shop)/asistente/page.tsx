"use client"

import { useChat } from "@/hooks/useChat"
import { ChatWindow } from "@/components/chat/ChatWindow"

const STARTER_SUGGESTIONS = [
  "¿qué laptop me recomiendas para diseño por menos de S/ 3,500?",
  "busco audífonos inalámbricos para hacer ejercicio",
  "necesito un monitor para trabajar desde casa",
]

export default function AsistentePage() {
  const { messages, loading, sendMessage } = useChat({ mode: "compras" })

  return (
    <div className="mx-auto max-w-3xl py-8">
      <h1 className="text-3xl font-bold mb-2">Asistente de compras</h1>
      <p className="mb-6 text-muted-foreground">
        Contame qué buscás y te recomiendo productos reales del catálogo, con
        sus links.
      </p>

      <ChatWindow
        messages={messages}
        loading={loading}
        onSend={sendMessage}
        suggestions={messages.length === 0 ? STARTER_SUGGESTIONS : undefined}
        inputPlaceholder="Ej: laptop liviana para la universidad"
      />
    </div>
  )
}
