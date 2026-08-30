import type { Database } from "@/types/database"

export type CartItem = Database["public"]["Tables"]["cart_items"]["Row"]

export interface CartItemProduct {
  title: string
  price: number
  stock: number
  isActive: boolean
  imageUrl?: string
}

export interface CartItemWithProduct {
  id: string
  productId: string
  quantity: number
  // null: el producto ya no está activo (RLS lo oculta al no dueño).
  product: CartItemProduct | null
}
