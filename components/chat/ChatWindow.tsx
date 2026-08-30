"use client"

import { useEffect, useRef } from "react"
import { ChatMessage } from "@/components/chat/ChatMessage"
import { LoadingMessage } from "@/components/chat/LoadingMessage"
import { ChatInput } from "@/components/chat/ChatInput"
import type { ChatMessage as ChatMessageType } from "@/types/chat"

interface ChatWindowProps {
  messages: ChatMessageType[]
  loading: boolean
  onSend: (content: string) => void
  suggestions?: string[]
  inputPlaceholder?: string
}

// Compone la conversación; auto-scroll al último mensaje. Puro: mensajes y
// callback por props, no conoce el endpoint ni Supabase.
export function ChatWindow({
  messages,
  loading,
  onSend,
  suggestions,
  inputPlaceholder,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden">
      <div className="min-h-[320px] max-h-[480px] flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && suggestions && suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Prueba preguntando:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => onSend(suggestion)}
                  className="rounded-full border border-border px-3 py-1.5 text-left text-xs hover:border-primary hover:text-primary transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {loading && <LoadingMessage />}

        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={onSend} disabled={loading} placeholder={inputPlaceholder} />
    </div>
  )
}
