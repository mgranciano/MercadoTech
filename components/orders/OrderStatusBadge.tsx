import { cn } from "@/lib/utils"
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from "@/lib/constants/orders"
import type { OrderStatus } from "@/lib/constants/roles"

interface OrderStatusBadgeProps {
  status: string
  className?: string
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const key = status as OrderStatus
  const style = ORDER_STATUS_STYLES[key]
  const label = ORDER_STATUS_LABELS[key] ?? status

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
