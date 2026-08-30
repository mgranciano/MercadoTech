import { createClient } from "@/lib/supabase/client"
import type { Order, OrderItem, OrderWithItems } from "@/types/order"

interface OrderRow extends Order {
  order_items: OrderItem[]
}

function mapOrder(order: OrderRow): OrderWithItems {
  return {
    ...order,
    total: Number(order.total),
    order_items: (order.order_items || []).map((item) => ({
      ...item,
      price_snapshot: Number(item.price_snapshot),
    })),
  }
}

// El RPC es transaccional: valida stock/estado activo de cada producto,
// crea la orden y sus items con snapshot de precio/título, descuenta stock
// y vacía el carrito. Si algo falla, Postgres revierte todo y el mensaje
// de error ya dice qué producto falló — se propaga tal cual.
export async function checkout(userId: string): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("create_order_from_cart", {
    p_buyer_id: userId,
  })

  if (error) throw new Error(error.message)

  return data as string
}

export async function listMyOrders(userId: string): Promise<OrderWithItems[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("buyer_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching orders:", error)
    return []
  }

  return (data as OrderRow[]).map(mapOrder)
}

export async function getOrderById(id: string): Promise<OrderWithItems | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single()

  if (error || !data) {
    return null
  }

  return mapOrder(data as OrderRow)
}

// Cancelar no restaura stock (no hay trigger para ello); limitación
// documentada en la UI, fuera de alcance de esta sesión.
export async function cancelIfPending(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from("orders")
    .update({ status: "cancelado" })
    .eq("id", id)
    .eq("status", "pendiente")

  if (error) throw error
}
