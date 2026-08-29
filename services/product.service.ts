import { createClient } from "@/lib/supabase/client"
import { getPublicUrl } from "@/services/storage.service"
import type { Database } from "@/types/database"

const PRODUCT_IMAGES_BUCKET = "product-images"

export type Product = Database["public"]["Tables"]["products"]["Row"]
export type ProductImage = Database["public"]["Tables"]["product_images"]["Row"]

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

// La imagen de portada y las miniaturas siempre exponen la URL pública ya
// resuelta (nunca el path crudo de Storage): next/image la necesita completa.
export async function mapProductToDetails(product: ProductRow): Promise<ProductWithDetails> {
  const images = product.product_images || []
  const reviews = product.reviews || []

  const coverImage = images.find((img) => img.position === 0) || images[0]
  const imageUrl = coverImage
    ? await getPublicUrl(PRODUCT_IMAGES_BUCKET, coverImage.image_path)
    : undefined

  const ratings = reviews.map((r) => r.rating).filter(Boolean)
  const averageRating =
    ratings.length > 0
      ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
      : 0

  return {
    ...product,
    image_url: imageUrl,
    average_rating: Math.round(averageRating * 10) / 10,
    review_count: reviews.length,
    price: Number(product.price),
  }
}

export interface ListProductsParams {
  categoryId?: string
  search?: string
  condition?: string
  minPrice?: number
  maxPrice?: number
  sort?: "recientes" | "precio_asc" | "precio_desc"
  page?: number
}

export interface ListProductsResult {
  items: ProductWithDetails[]
  total: number
}

export async function listActiveProducts(
  params: ListProductsParams,
  pageSize: number
): Promise<ListProductsResult> {
  const supabase = createClient()
  const page = params.page || 1
  const offset = (page - 1) * pageSize

  let query = supabase
    .from("products")
    .select(
      "*, product_images(id, image_path, position), reviews(id, rating)",
      { count: "exact" }
    )
    .eq("is_active", true)

  // Filter by category
  if (params.categoryId) {
    query = query.eq("category_id", params.categoryId)
  }

  // Filter by condition
  if (params.condition) {
    query = query.eq("condition", params.condition)
  }

  // Filter by price range
  if (params.minPrice !== undefined) {
    query = query.gte("price", params.minPrice)
  }
  if (params.maxPrice !== undefined) {
    query = query.lte("price", params.maxPrice)
  }

  // Search by text (ilike on title and brand)
  if (params.search) {
    query = query.or(
      `title.ilike.%${params.search}%,brand.ilike.%${params.search}%`
    )
  }

  // Sort
  if (params.sort === "precio_asc") {
    query = query.order("price", { ascending: true })
  } else if (params.sort === "precio_desc") {
    query = query.order("price", { ascending: false })
  } else {
    query = query.order("created_at", { ascending: false })
  }

  // Pagination
  query = query.range(offset, offset + pageSize - 1)

  const { data, count, error } = await query

  if (error) {
    console.error("Error fetching products:", error)
    return { items: [], total: 0 }
  }

  const items = await Promise.all(
    (data || []).map((product: ProductRow) => mapProductToDetails(product))
  )

  return {
    items,
    total: count || 0,
  }
}

export async function getProductById(id: string): Promise<ProductWithDetails | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(id, image_path, position), reviews(id, rating)")
    .eq("id", id)
    .single()

  if (error || !data) {
    console.error("Error fetching product:", error)
    return null
  }

  return mapProductToDetails(data as ProductRow)
}

export async function getProductImages(productId: string): Promise<ProductImageWithUrl[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("position", { ascending: true })

  if (error) {
    console.error("Error fetching product images:", error)
    return []
  }

  return Promise.all(
    (data || []).map(async (image) => ({
      ...image,
      image_url: await getPublicUrl(PRODUCT_IMAGES_BUCKET, image.image_path),
    }))
  )
}

// product_views.user_id es NOT NULL y su política exige rol authenticated:
// solo se registra la vista si hay sesión (decisión 14, Fase 3.5).
export async function registerView(productId: string, userId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from("product_views")
    .insert({ product_id: productId, user_id: userId })

  if (error) throw error
}
