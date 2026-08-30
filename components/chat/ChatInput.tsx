"use client"

import { useState, type KeyboardEvent } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChatInputProps {
  onSend: (content: string) => void
  disabled?: boolean
  placeholder?: string
}

// Puro: solo dispara onSend con el texto, no sabe qué pasa con él después.
export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [value, setValue] = useState("")

  const submit = () => {
    if (!value.trim() || disabled) return
    onSend(value)
    setValue("")
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="flex items-end gap-2 border-t border-border p-3">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder || "Escribe tu mensaje..."}
        rows={1}
        className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
      />
      <Button onClick={submit} disabled={disabled || !value.trim()} size="icon" aria-label="Enviar">
        <Send size={18} />
      </Button>
    </div>
  )
}
