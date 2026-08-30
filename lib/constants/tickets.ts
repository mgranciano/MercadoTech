import { TicketStatus } from "@/lib/constants/roles"

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  [TicketStatus.OPEN]: "Abierto",
  [TicketStatus.IN_PROGRESS]: "En proceso",
  [TicketStatus.RESOLVED]: "Resuelto",
  [TicketStatus.CLOSED]: "Cerrado",
}

export const TICKET_STATUS_STYLES: Record<TicketStatus, { bg: string; text: string }> = {
  [TicketStatus.OPEN]: { bg: "bg-warning/10", text: "text-warning" },
  [TicketStatus.IN_PROGRESS]: {
    bg: "bg-blue-50 dark:bg-blue-950",
    text: "text-blue-700 dark:text-blue-300",
  },
  [TicketStatus.RESOLVED]: { bg: "bg-success/10", text: "text-success" },
  [TicketStatus.CLOSED]: { bg: "bg-muted", text: "text-muted-foreground" },
}
