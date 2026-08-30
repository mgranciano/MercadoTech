import type { Database } from "@/types/database"

export type Product = Database["public"]["Tables"]["products"]["Row"]
export type ProductImage = Database["public"]["Tables"]["product_images"]["Row"]

// Forma de una fila de products embebida con sus imágenes y reseñas
// (usada por product.service y favorite.service para mapear a ProductWithDetails).
export interface ProductRow extends Product {
  product_images: Array<{ id: string; image_path: string; position: number }>
  reviews: Array<{ id: string; rating: number }>
}

export interface ProductWithDetails extends Product {
  image_url?: string
  average_rating: number
  review_count: number
}

export interface ProductImageWithUrl extends ProductImage {
  image_url: string
}
