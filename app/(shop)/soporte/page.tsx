"use client"

import { useAuth } from "@/hooks/useAuth"
import { useChat } from "@/hooks/useChat"
import { useMyTickets } from "@/hooks/useMyTickets"
import { ChatWindow } from "@/components/chat/ChatWindow"
import { TicketStatusBadge } from "@/components/support/TicketStatusBadge"
import { EmptyState } from "@/components/shared/EmptyState"
import { LoadingState } from "@/components/shared/LoadingState"

const STARTER_SUGGESTIONS = [
  "¿cómo devuelvo un producto?",
  "¿cuáles son los métodos de pago?",
  "mi paquete llegó dañado, ¿qué hago?",
]

function MyTickets({ userId }: { userId?: string }) {
  const { tickets, loading } = useMyTickets(userId)

  if (loading) {
    return <LoadingState variant="list" count={2} />
  }

  if (tickets.length === 0) {
    return (
      <EmptyState
        title="No tienes tickets"
        description="Si el asistente no puede resolver tu consulta, te sugerirá crear uno."
        className="py-8"
      />
    )
  }

  return (
    <div className="divide-y divide-border rounded-2xl border border-border bg-card">
      {tickets.map((ticket) => (
        <div key={ticket.id} className="flex items-center justify-between gap-4 p-4">
          <div>
            <p className="text-sm font-medium">{ticket.subject}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(ticket.created_at).toLocaleDateString("es-ES")}
            </p>
          </div>
          <TicketStatusBadge status={ticket.status} />
        </div>
      ))}
    </div>
  )
}

// Layout deja espacio bajo el input para el botón de micrófono que agrega
// la sesión 8 (agente de voz): por eso el chat y "Mis tickets" van en
// columnas separadas, no uno debajo del otro apretado.
export default function SoportePage() {
  const { profile } = useAuth()
  const { messages, loading, sendMessage } = useChat({ mode: "soporte" })

  return (
    <div className="mx-auto max-w-3xl space-y-10 py-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Soporte</h1>
        <p className="mb-6 text-muted-foreground">
          Preguntame sobre envíos, pagos, devoluciones o tu cuenta.
        </p>

        <ChatWindow
          messages={messages}
          loading={loading}
          onSend={sendMessage}
          suggestions={messages.length === 0 ? STARTER_SUGGESTIONS : undefined}
          inputPlaceholder="Ej: ¿cómo devuelvo un producto?"
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Mis tickets</h2>
        <MyTickets userId={profile?.id} />
      </div>
    </div>
  )
}
