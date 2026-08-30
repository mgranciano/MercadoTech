import { createClient } from "@/lib/supabase/client"

const PRODUCT_IMAGES_BUCKET = "product-images"

export async function getPublicUrl(bucket: string, path: string): Promise<string> {
  const supabase = createClient()

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)

  return data.publicUrl
}

// Convención de path exigida por la política del bucket:
// {seller_id}/{product_id}/{n}.{ext} (sin prefijo "product-images/", el
// bucket ya scoping eso). Solo sube el archivo; insertar la fila en
// product_images es responsabilidad de seller.service.
export async function uploadProductImage(
  file: File,
  sellerId: string,
  productId: string,
  position: number
): Promise<string> {
  const supabase = createClient()
  const ext = file.name.split(".").pop() || "jpg"
  const path = `${sellerId}/${productId}/${position}.${ext}`

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, file, { upsert: true })

  if (error) throw error

  return path
}

// Borra el archivo de Storage y su fila en product_images.
export async function deleteProductImage(imagePath: string): Promise<void> {
  const supabase = createClient()

  const { error: storageError } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .remove([imagePath])

  if (storageError) throw storageError

  const { error: dbError } = await supabase
    .from("product_images")
    .delete()
    .eq("image_path", imagePath)

  if (dbError) throw dbError
}

export interface ImageOrderItem {
  id: string
  product_id: string
  image_path: string
  position: number
}

// Upsert con filas completas: un upsert parcial (solo id/position) viola
// los not null de product_id/image_path en las filas que Postgres reinserta
// internamente al resolver el conflicto.
export async function saveImageOrder(items: ImageOrderItem[]): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from("product_images").upsert(items)

  if (error) throw error
}
