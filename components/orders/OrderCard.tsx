import Link from "next/link"
import { Price } from "@/components/shared/Price"
import { OrderStatusBadge } from "./OrderStatusBadge"
import type { OrderWithItems } from "@/types/order"

interface OrderCardProps {
  order: OrderWithItems
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-PE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function OrderCard({ order }: OrderCardProps) {
  const itemCount = order.order_items.length

  return (
    <Link
      href={`/pedidos/${order.id}`}
      className="flex flex-col gap-2 rounded-lg border border-border p-4 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p className="text-sm text-muted-foreground">
          Pedido #{order.id.slice(0, 8)} · {formatDate(order.created_at)}
        </p>
        <p className="text-sm">
          {itemCount} producto{itemCount === 1 ? "" : "s"}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <OrderStatusBadge status={order.status} />
        <Price value={order.total} className="font-semibold" />
      </div>
    </Link>
  )
}
