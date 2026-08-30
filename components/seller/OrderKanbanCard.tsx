import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge"
import { Price } from "@/components/shared/Price"
import type { SellerOrder } from "@/types/seller"

interface OrderKanbanCardProps {
  order: SellerOrder
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-PE", { day: "numeric", month: "short" })
}

export function OrderKanbanCard({ order }: OrderKanbanCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3.5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-ai-cyan hover:shadow-[0_12px_26px_rgba(12,26,56,.14)]">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-semibold text-primary">
          #{order.id.slice(0, 8)}
        </span>
        <OrderStatusBadge status={order.status} />
      </div>

      <ul className="mt-2.5 space-y-0.5 text-[12px] text-muted-foreground">
        {order.items.map((item) => (
          <li key={item.id} className="truncate">
            {item.quantity}× {item.title}
          </li>
        ))}
      </ul>

      <div className="mt-2.5 flex items-baseline justify-between border-t border-border pt-2.5">
        <Price value={order.sellerTotal} className="text-[16.5px] font-extrabold tracking-tight" />
        <span className="font-mono text-[10.5px] text-muted-foreground">
          {formatDate(order.createdAt)}
        </span>
      </div>
    </div>
  )
}
