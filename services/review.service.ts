import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/database"

export type Review = Database["public"]["Tables"]["reviews"]["Row"]

interface OrderItemWithOrder {
  order_id: string
  orders: { status: string; buyer_id: string } | null
}

export async function listByProduct(productId: string): Promise<Review[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching reviews:", error)
    return []
  }

  return data || []
}

export interface ReviewAverage {
  average: number
  count: number
}

export async function getAverage(productId: string): Promise<ReviewAverage> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", productId)

  if (error || !data || data.length === 0) {
    return { average: 0, count: 0 }
  }

  const sum = data.reduce((acc, r) => acc + r.rating, 0)

  return {
    average: Math.round((sum / data.length) * 10) / 10,
    count: data.length,
  }
}

export interface CanReviewResult {
  allowed: boolean
  orderId: string | null
}

// Reseña verificada: solo puede reseñar quien tiene un pedido 'entregado'
// con ese producto y aún no dejó reseña (unique product_id/buyer_id).
// La RLS de reviews_insert_policy hace la misma validación en la base de
// datos; esto es solo para decidir si se muestra el formulario.
export async function canReview(productId: string, userId: string): Promise<CanReviewResult> {
  const supabase = createClient()

  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("product_id", productId)
    .eq("buyer_id", userId)
    .maybeSingle()

  if (existing) {
    return { allowed: false, orderId: null }
  }

  const { data: items, error } = await supabase
    .from("order_items")
    .select("order_id, orders(status, buyer_id)")
    .eq("product_id", productId)

  if (error || !items) {
    return { allowed: false, orderId: null }
  }

  const eligible = (items as unknown as OrderItemWithOrder[]).find(
    (item) => item.orders?.status === "entregado" && item.orders?.buyer_id === userId
  )

  return eligible
    ? { allowed: true, orderId: eligible.order_id }
    : { allowed: false, orderId: null }
}

export interface CreateReviewInput {
  productId: string
  orderId: string
  buyerId: string
  rating: number
  comment?: string
}

export async function create(input: CreateReviewInput): Promise<Review> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      product_id: input.productId,
      order_id: input.orderId,
      buyer_id: input.buyerId,
      rating: input.rating,
      comment: input.comment || null,
    })
    .select()
    .single()

  if (error) throw error

  return data
}
