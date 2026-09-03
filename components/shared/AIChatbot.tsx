"use client"

import { useState } from "react"
import { useChat } from "@/hooks/useChat"
import { cn } from "@/lib/utils"

const CHIPS = [
  "¿Dónde está mi pedido?",
  "Políticas de devolución",
  "Ayuda con métodos de pago",
  "Recomiéndame una laptop",
]

export function AIChatbot() {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState("")
  const { messages, loading, sendMessage } = useChat({ mode: "compras" })

  const send = (text: string) => {
    setOpen(true)
    setDraft("")
    sendMessage(text)
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-5 z-40 flex h-[58px] items-center gap-3 rounded-full bg-gradient-to-r from-primary via-accent to-ai-cyan px-4 text-white shadow-[0_10px_30px_rgba(123,47,247,.45)] ring-4 ring-ai-cyan/30 transition hover:-translate-y-1 sm:pr-6"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-[17px]">
            ✦
          </span>
          <span className="hidden text-sm font-extrabold tracking-tight sm:inline">
            Asistente AI
          </span>
        </button>
      )}

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-[#060c1c]/50 sm:hidden"
          />
          <section className="fixed inset-x-0 bottom-0 z-50 flex h-[92vh] flex-col overflow-hidden rounded-t-3xl bg-card shadow-[0_-14px_40px_rgba(8,18,44,.3)] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[594px] sm:max-h-[calc(100vh-120px)] sm:w-[392px] sm:rounded-2xl sm:border sm:border-ai-cyan/40">
            <header className="relative shrink-0 overflow-hidden bg-[linear-gradient(120deg,#0a1330,#2a0f5c_70%,#0b4fd6)] px-4 pb-4 pt-3.5 sm:px-4.5 sm:py-4">
              <div className="pointer-events-none absolute -left-10 -top-40 h-56 w-56 animate-pulse rounded-full bg-[radial-gradient(circle,rgba(34,211,238,.4),transparent_68%)]" />
              <div className="relative mx-auto mb-3.5 h-1.5 w-11 rounded-full bg-white/35 sm:hidden" />
              <div className="relative flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-ai-cyan to-accent text-lg text-white">
                  ✦
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[14.5px] font-extrabold tracking-tight text-white">
                    Asistente MercadoTech AI
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="h-[7px] w-[7px] animate-pulse rounded-full bg-green-400" />
                    <span className="text-[11.5px] text-white/70">
                      En línea · responde en segundos
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-[15px] text-white hover:bg-white/25"
                >
                  ✕
                </button>
              </div>
            </header>

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-muted/30 p-4">
              {messages.length === 0 && (
                <div>
                  <div className="mb-4 px-2 py-2 text-sm text-card-foreground">
                    Hola. Soy el Asistente MercadoTech AI. Consulto tus pedidos, políticas y catálogo en tiempo real. ¿En qué te ayudo?
                  </div>
                  <div className="mb-2.5 font-mono text-[10px] uppercase tracking-[.12em] text-muted-foreground">
                    tips frecuentes
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    {CHIPS.map((c) => (
                      <button
                        key={c}
                        onClick={() => send(c)}
                        className="rounded-2xl border border-ai-cyan/50 bg-card px-4 py-3 text-left text-[13.5px] font-semibold text-primary transition hover:border-accent hover:bg-gradient-to-r hover:from-ai-cyan/10 hover:to-accent/10 sm:rounded-full sm:px-3.5 sm:py-2.5 sm:text-[12.5px]"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m) => (
                <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[84%] text-pretty px-3.5 py-3 text-[13.5px] leading-relaxed sm:max-w-[80%]",
                      m.role === "user"
                        ? "rounded-[16px_16px_5px_16px] bg-gradient-to-r from-primary to-accent text-white"
                        : "rounded-[16px_16px_16px_5px] border border-border bg-card text-card-foreground"
                    )}
                  >
                    {m.content}
                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-2.5 border-t border-primary/10 pt-2 space-y-1 text-[10px] text-accent">
                        {m.sources.map((src) => (
                          <div key={src.source_id} className="font-mono">
                            ✦ {src.source_type === "articulo_soporte" ? "artículo" : "producto"}: {src.source_id.slice(0, 8)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <footer className="flex shrink-0 items-end gap-2.5 border-t border-border bg-card p-3.5 pb-5 sm:pb-3.5">
              <textarea
                rows={1}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !loading) {
                    e.preventDefault()
                    if (draft.trim()) send(draft.trim())
                  }
                }}
                disabled={loading}
                placeholder="Escribe tu pregunta…"
                className="max-h-24 min-h-[46px] flex-1 resize-none rounded-2xl border border-border bg-muted/30 px-3.5 py-3 text-sm outline-none focus:border-ai-cyan focus:bg-card disabled:opacity-50"
              />
              <button
                onClick={() => draft.trim() && !loading && send(draft.trim())}
                disabled={loading}
                aria-label="Enviar"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-ai-cyan to-accent text-lg text-white shadow-[0_6px_18px_rgba(123,47,247,.35)] transition hover:-translate-y-0.5 disabled:opacity-50"
              >
                {loading ? "⏳" : "✦"}
              </button>
            </footer>
          </section>
        </>
      )}
    </>
  )
}
