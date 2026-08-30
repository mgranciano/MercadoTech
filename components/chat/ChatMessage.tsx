import { cn } from "@/lib/utils"
import { SourcesList } from "@/components/chat/SourcesList"
import type { ChatMessage as ChatMessageType } from "@/types/chat"

interface ChatMessageProps {
  message: ChatMessageType
}

// Puro: solo recibe el mensaje ya armado, no conoce el endpoint ni Supabase.
export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : message.isError
              ? "bg-destructive/10 text-destructive"
              : "bg-muted text-foreground"
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.sources && message.sources.length > 0 && (
          <SourcesList sources={message.sources} className="mt-3" />
        )}
      </div>
    </div>
  )
}
