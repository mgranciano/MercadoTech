import type { Database } from "@/types/database"

export type Review = Database["public"]["Tables"]["reviews"]["Row"]

export interface ReviewAverage {
  average: number
  count: number
}

export interface CanReviewResult {
  allowed: boolean
  orderId: string | null
}

export interface CreateReviewInput {
  productId: string
  orderId: string
  buyerId: string
  rating: number
  comment?: string
}
