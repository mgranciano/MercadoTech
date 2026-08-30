import { Price } from "@/components/shared/Price"
import type { OrderItem } from "@/types/order"

interface OrderItemsTableProps {
  items: OrderItem[]
}

export function OrderItemsTable({ items }: OrderItemsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-2 font-medium">Producto</th>
            <th className="px-4 py-2 text-right font-medium">Precio</th>
            <th className="px-4 py-2 text-right font-medium">Cantidad</th>
            <th className="px-4 py-2 text-right font-medium">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="px-4 py-3">{item.title_snapshot}</td>
              <td className="px-4 py-3 text-right">
                <Price value={item.price_snapshot} />
              </td>
              <td className="px-4 py-3 text-right">{item.quantity}</td>
              <td className="px-4 py-3 text-right">
                <Price value={item.price_snapshot * item.quantity} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
