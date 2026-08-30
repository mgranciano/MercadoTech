import type { Database } from "@/types/database"

export type Order = Database["public"]["Tables"]["orders"]["Row"]
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"]

export interface OrderWithItems extends Order {
  order_items: OrderItem[]
}
