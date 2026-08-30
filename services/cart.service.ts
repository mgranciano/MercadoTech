import { createClient } from "@/lib/supabase/client"
import { getPublicUrl } from "@/services/storage.service"
import type { CartItemWithProduct } from "@/types/cart"

const PRODUCT_IMAGES_BUCKET = "product-images"

interface CartItemRow {
  id: string
  product_id: string
  quantity: number
  products: {
    title: string
    price: number
    stock: number
    is_active: boolean
    product_images: Array<{ image_path: string; position: number }>
  } | null
}

export async function getItems(userId: string): Promise<CartItemWithProduct[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("cart_items")
    .select(
      "id, product_id, quantity, products(title, price, stock, is_active, product_images(image_path, position))"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching cart items:", error)
    return []
  }

  return Promise.all(
    (data as unknown as CartItemRow[]).map(async (row) => {
      if (!row.products) {
        return { id: row.id, productId: row.product_id, quantity: row.quantity, product: null }
      }

      const images = row.products.product_images || []
      const cover = images.find((img) => img.position === 0) || images[0]
      const imageUrl = cover
        ? await getPublicUrl(PRODUCT_IMAGES_BUCKET, cover.image_path)
        : undefined

      return {
        id: row.id,
        productId: row.product_id,
        quantity: row.quantity,
        product: {
          title: row.products.title,
          price: Number(row.products.price),
          stock: row.products.stock,
          isActive: row.products.is_active,
          imageUrl,
        },
      }
    })
  )
}

// Si el producto ya está en el carrito, suma la cantidad (unique(user_id,
// product_id)) y la limita al stock actual.
export async function addItem(userId: string, productId: string, quantity: number): Promise<void> {
  const supabase = createClient()

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("stock")
    .eq("id", productId)
    .single()

  if (productError || !product) throw new Error("Producto no encontrado")

  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle()

  if (existing) {
    const newQuantity = Math.min(existing.quantity + quantity, product.stock)
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: newQuantity })
      .eq("id", existing.id)
    if (error) throw error
    return
  }

  const { error } = await supabase
    .from("cart_items")
    .insert({ user_id: userId, product_id: productId, quantity: Math.min(quantity, product.stock) })

  if (error) throw error
}

export async function updateQuantity(itemId: string, quantity: number): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", itemId)

  if (error) throw error
}

export async function removeItem(itemId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from("cart_items").delete().eq("id", itemId)

  if (error) throw error
}

export async function clear(userId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from("cart_items").delete().eq("user_id", userId)

  if (error) throw error
}
