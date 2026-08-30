import type { Product } from "@/types/product"

export interface SellerProduct extends Product {
  image_url?: string
}

export interface ProductInput {
  title: string
  description: string | null
  brand: string | null
  categoryId: string
  condition: string
  price: number
  stock: number
}

export interface SellerOrderItem {
  id: string
  productId: string
  title: string
  price: number
  quantity: number
}

export interface SellerOrder {
  id: string
  status: string
  createdAt: string
  items: SellerOrderItem[]
  // Suma de SOLO los ítems de este vendedor, no orders.total: un pedido
  // puede tener ítems de varios vendedores (decisión 9, Fase 3.7).
  sellerTotal: number
}
