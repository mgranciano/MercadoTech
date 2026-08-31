// Adaptadores: exponen servicios del proyecto reutilizando su lógica,
// pero aceptando cliente inyectable para Decisión 8 (contexto por llamada).
// Decisión 6: derivaciones explícitamente comentadas al lado de su función.

import type { SupabaseClient } from '@supabase/supabase-js'
import { getPublicUrl } from '@/services/storage.service'
import { mapProductToDetails } from '@/services/product.service'
import type { Database } from '@/types/database'
import type {
  ProductImageWithUrl,
  ProductRow,
  ProductWithDetails,
} from '@/types/product'
import type { Question } from '@/types/question'
import type { Review } from '@/types/review'
import type { Category } from '@/types/category'

type Client = SupabaseClient<Database>

// ============================================================================
// Adaptadores: servicios existentes con cliente inyectable (Decisión 8)
// ============================================================================

export async function getProductByIdAdapter(
  id: string,
  supabase: Client
): Promise<ProductWithDetails | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(id, image_path, position), reviews(id, rating)')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return mapProductToDetails(data as ProductRow)
}

export async function listReviewsByProductAdapter(
  productId: string,
  supabase: Client
): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  if (error) {
    return []
  }

  return data || []
}

export async function listQuestionsByProductAdapter(
  productId: string,
  supabase: Client
): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  if (error) {
    return []
  }

  return data || []
}

export async function listCategoriesAdapter(
  supabase: Client
): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    return []
  }

  return data || []
}

export async function getOrderByIdAdapter(
  id: string,
  supabase: Client
): Promise<{
  id: string
  status: string
  created_at: string
  total: number
  order_items: Array<{ product_id: string; quantity: number; price_snapshot: string }>
} | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('id, status, created_at, total, order_items(product_id, quantity, price_snapshot)')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return {
    ...data,
    total: Number(data.total),
    order_items: (data.order_items || []).map((item: any) => ({
      ...item,
      price_snapshot: Number(item.price_snapshot),
    })),
  }
}

// ============================================================================
// Derivaciones (Decisión 6, Lección 6): composición de servicios
// ============================================================================

export async function listCategoriesWithCountAdapter(
  supabase: Client
): Promise<Array<{ id: string; name: string; slug: string; product_count: number }>> {
  const categories = await listCategoriesAdapter(supabase)

  const withCounts = await Promise.all(
    categories.map(async (cat) => {
      const { count, error } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', cat.id)
        .eq('is_active', true)

      return {
        ...cat,
        product_count: !error && count !== null ? count : 0,
      }
    })
  )

  return withCounts
}

// Derivación: compone listCategoriesWithCountAdapter + conteo de reseñas + precio medio.
export async function getStoreStatsAdapter(supabase: Client): Promise<{
  total_products: number
  total_categories: number
  average_rating: number
  average_price: number
}> {
  const { count: productCount } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)

  const { count: categoryCount } = await supabase
    .from('categories')
    .select('id', { count: 'exact', head: true })

  const { data: ratings } = await supabase
    .from('reviews')
    .select('rating')
    .gt('rating', 0)

  const { data: prices } = await supabase
    .from('products')
    .select('price')
    .eq('is_active', true)

  const avgRating =
    ratings && ratings.length > 0
      ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length
      : 0

  const avgPrice =
    prices && prices.length > 0
      ? prices.reduce((sum: number, p: any) => sum + Number(p.price), 0) / prices.length
      : 0

  return {
    total_products: productCount || 0,
    total_categories: categoryCount || 0,
    average_rating: Math.round(avgRating * 10) / 10,
    average_price: Math.round(avgPrice * 100) / 100,
  }
}
