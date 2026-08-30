import { cn } from "@/lib/utils"
import { TICKET_STATUS_LABELS, TICKET_STATUS_STYLES } from "@/lib/constants/tickets"
import type { TicketStatus } from "@/lib/constants/roles"

interface TicketStatusBadgeProps {
  status: string
  className?: string
}

export function TicketStatusBadge({ status, className }: TicketStatusBadgeProps) {
  const key = status as TicketStatus
  const style = TICKET_STATUS_STYLES[key]
  const label = TICKET_STATUS_LABELS[key] ?? status

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        style?.bg,
        style?.text,
        className
      )}
    >
      {label}
    </span>
  )
}
