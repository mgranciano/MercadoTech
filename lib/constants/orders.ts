import { OrderStatus } from "@/lib/constants/roles"

// Secuencia normal de un pedido; el vendedor la avanza en la Fase 3.7.
// 'cancelado' no forma parte del flujo: es un estado terminal alterno,
// solo alcanzable desde 'pendiente' (ver orders_update_policy).
export const ORDER_STATUS_FLOW: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.PAID,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
]

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "Pendiente",
  [OrderStatus.PAID]: "Pagado",
  [OrderStatus.SHIPPED]: "Enviado",
  [OrderStatus.DELIVERED]: "Entregado",
  [OrderStatus.CANCELLED]: "Cancelado",
}

export const ORDER_STATUS_STYLES: Record<OrderStatus, { bg: string; text: string }> = {
  [OrderStatus.PENDING]: { bg: "bg-warning/10", text: "text-warning" },
  [OrderStatus.PAID]: { bg: "bg-blue-50 dark:bg-blue-950", text: "text-blue-700 dark:text-blue-300" },
  [OrderStatus.SHIPPED]: { bg: "bg-purple-50 dark:bg-purple-950", text: "text-purple-700 dark:text-purple-300" },
  [OrderStatus.DELIVERED]: { bg: "bg-success/10", text: "text-success" },
  [OrderStatus.CANCELLED]: { bg: "bg-destructive/10", text: "text-destructive" },
}
