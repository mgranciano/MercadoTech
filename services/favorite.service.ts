import { createClient } from "@/lib/supabase/client"
import { mapProductToDetails, type ProductRow, type ProductWithDetails } from "@/services/product.service"
import type { Database } from "@/types/database"

export type Favorite = Database["public"]["Tables"]["favorites"]["Row"]

export async function isFavorite(productId: string, userId: string): Promise<boolean> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("favorites")
    .select("id")
    .eq("product_id", productId)
    .eq("user_id", userId)
    .maybeSingle()

  if (error) {
    console.error("Error checking favorite:", error)
    return false
  }

  return !!data
}

// Devuelve el nuevo estado (true = quedó como favorito) para que el hook
// no necesite volver a consultar isFavorite tras cada toggle.
export async function toggle(productId: string, userId: string): Promise<boolean> {
  const supabase = createClient()
  const alreadyFavorite = await isFavorite(productId, userId)

  if (alreadyFavorite) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("product_id", productId)
      .eq("user_id", userId)

    if (error) throw error
    return false
  }

  const { error } = await supabase
    .from("favorites")
    .insert({ product_id: productId, user_id: userId })

  if (error) throw error
  return true
}

export async function listMine(userId: string): Promise<ProductWithDetails[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("favorites")
    .select(
      "created_at, products(*, product_images(id, image_path, position), reviews(id, rating))"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error || !data) {
    console.error("Error fetching favorites:", error)
    return []
  }

  // Un producto que dejó de estar activo llega como products: null (RLS lo
  // oculta a quien no es su vendedor); se descarta de la lista.
  const products = data
    .map((favorite) => favorite.products)
    .filter((product): product is ProductRow => product !== null)

  return Promise.all(products.map((product) => mapProductToDetails(product)))
}
