import { createClient } from "@/lib/supabase/client"
import { getPublicUrl } from "@/services/storage.service"
import type { Product, ProductImage } from "@/types/product"
import type { ProductInput, SellerOrder, SellerOrderItem, SellerProduct } from "@/types/seller"

const PRODUCT_IMAGES_BUCKET = "product-images"

interface ProductRow extends Product {
  product_images: Array<{ image_path: string; position: number }>
}

function mapProduct(product: Product): Product {
  return { ...product, price: Number(product.price) }
}

// Incluye inactivos: products_select_policy ya deja al dueño ver los suyos
// sin importar is_active.
export async function listMyProducts(sellerId: string): Promise<SellerProduct[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(image_path, position)")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching seller products:", error)
    return []
  }

  return Promise.all(
    (data as ProductRow[]).map(async ({ product_images, ...product }) => {
      const images = product_images || []
      const cover = images.find((img) => img.position === 0) || images[0]
      const imageUrl = cover
        ? await getPublicUrl(PRODUCT_IMAGES_BUCKET, cover.image_path)
        : undefined

      return { ...mapProduct(product), image_url: imageUrl }
    })
  )
}

// Filtra por seller_id explícitamente (no solo confía en RLS): un producto
// activo de otro vendedor es legible por products_select_policy, pero no
// debe poder abrirse en ESTA pantalla de edición.
export async function getMyProductById(sellerId: string, productId: string): Promise<Product | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("seller_id", sellerId)
    .maybeSingle()

  if (error || !data) return null

  return mapProduct(data)
}

export async function createProduct(sellerId: string, input: ProductInput): Promise<Product> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("products")
    .insert({
      seller_id: sellerId,
      category_id: input.categoryId,
      title: input.title,
      description: input.description,
      brand: input.brand,
      condition: input.condition,
      price: input.price,
      stock: input.stock,
    })
    .select()
    .single()

  if (error) throw error

  return mapProduct(data)
}

export async function updateProduct(productId: string, input: ProductInput): Promise<Product> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("products")
    .update({
      category_id: input.categoryId,
      title: input.title,
      description: input.description,
      brand: input.brand,
      condition: input.condition,
      price: input.price,
      stock: input.stock,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId)
    .select()
    .single()

  if (error) throw error

  return mapProduct(data)
}

export async function toggleActive(productId: string, isActive: boolean): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", productId)

  if (error) throw error
}

// order_items.product_id es on delete restrict: si el producto tiene
// ventas, Postgres rechaza el DELETE (23503) — se traduce a un mensaje
// legible en vez del error crudo de FK (decisión 10).
export async function deleteProduct(productId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from("products").delete().eq("id", productId)

  if (error) {
    if (error.code === "23503") {
      throw new Error("Este producto tiene ventas; desactívalo en lugar de eliminarlo.")
    }
    throw error
  }
}

export async function addProductImage(
  productId: string,
  imagePath: string,
  position: number
): Promise<ProductImage> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("product_images")
    .insert({ product_id: productId, image_path: imagePath, position })
    .select()
    .single()

  if (error) throw error

  return data
}

interface SellerOrderItemRow {
  id: string
  order_id: string
  product_id: string
  title_snapshot: string
  price_snapshot: number | string
  quantity: number
  orders: { status: string; created_at: string } | null
}

// Pedidos con ítems propios. order_items_select_policy ya filtra a solo las
// filas de este vendedor aunque el pedido tenga ítems de otros.
export async function listMyOrders(sellerId: string): Promise<SellerOrder[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("order_items")
    .select(
      "id, order_id, product_id, title_snapshot, price_snapshot, quantity, orders(status, created_at)"
    )
    .eq("seller_id", sellerId)

  if (error) {
    console.error("Error fetching seller orders:", error)
    return []
  }

  const byOrder = new Map<string, SellerOrder>()

  for (const row of data as unknown as SellerOrderItemRow[]) {
    if (!row.orders) continue

    const item: SellerOrderItem = {
      id: row.id,
      productId: row.product_id,
      title: row.title_snapshot,
      price: Number(row.price_snapshot),
      quantity: row.quantity,
    }

    const existing = byOrder.get(row.order_id)
    if (existing) {
      existing.items.push(item)
      existing.sellerTotal += item.price * item.quantity
    } else {
      byOrder.set(row.order_id, {
        id: row.order_id,
        status: row.orders.status,
        createdAt: row.orders.created_at,
        items: [item],
        sellerTotal: item.price * item.quantity,
      })
    }
  }

  return Array.from(byOrder.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId)

  if (error) throw error
}
