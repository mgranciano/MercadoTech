"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  addProductImage,
  createProduct,
  getMyProductById,
  updateProduct,
} from "@/services/seller.service"
import { getProductImages } from "@/services/product.service"
import { deleteProductImage, getPublicUrl, saveImageOrder, uploadProductImage } from "@/services/storage.service"
import { validateProduct, type ProductFormValues } from "@/lib/validators/product"
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, MAX_IMAGES_PER_PRODUCT } from "@/lib/constants/product"
import type { ProductInput } from "@/types/seller"

const PRODUCT_IMAGES_BUCKET = "product-images"

export interface GalleryImage {
  id: string
  url: string
  status: "local" | "persisted"
  file?: File
  imagePath?: string
}

const EMPTY_VALUES: ProductFormValues = {
  title: "",
  description: "",
  brand: "",
  categoryId: "",
  condition: "nuevo",
  price: "",
  stock: "",
}

interface UseProductFormOptions {
  mode: "create" | "edit"
  sellerId?: string
  productId?: string
}

export function useProductForm({ mode, sellerId, productId }: UseProductFormOptions) {
  const router = useRouter()
  const [values, setValues] = useState<ProductFormValues>(EMPTY_VALUES)
  const [images, setImages] = useState<GalleryImage[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(mode === "edit")
  const [notFound, setNotFound] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (mode !== "edit" || !productId || !sellerId) return

    let active = true

    const load = async () => {
      setLoading(true)

      try {
        const product = await getMyProductById(sellerId, productId)
        if (!active) return

        if (!product) {
          setNotFound(true)
          return
        }

        setValues({
          title: product.title,
          description: product.description || "",
          brand: product.brand || "",
          categoryId: product.category_id,
          condition: product.condition,
          price: String(product.price),
          stock: String(product.stock),
        })

        const productImages = await getProductImages(productId)
        if (!active) return

        setImages(
          productImages.map((img) => ({
            id: img.id,
            url: img.image_url,
            status: "persisted" as const,
            imagePath: img.image_path,
          }))
        )
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [mode, productId, sellerId])

  const setField = (field: keyof ProductFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  // En edit, cada imagen persistida ya vive en orden contiguo 0..n-1 —
  // recalcula posiciones tras cada cambio para que "next position" nunca
  // choque con una posición que quedó libre por un remove anterior.
  const persistOrder = async (ordered: GalleryImage[]) => {
    if (!productId) return

    const items = ordered
      .filter(
        (img): img is GalleryImage & { imagePath: string } =>
          img.status === "persisted" && !!img.imagePath
      )
      .map((img, index) => ({
        id: img.id,
        product_id: productId,
        image_path: img.imagePath,
        position: index,
      }))

    if (items.length === 0) return

    await saveImageOrder(items)
  }

  const addFiles = async (files: FileList) => {
    const incoming = Array.from(files)
    const fileErrors: string[] = []
    const validFiles: File[] = []

    for (const file of incoming) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        fileErrors.push(`${file.name}: solo se aceptan JPEG, PNG o WebP.`)
        continue
      }
      if (file.size > MAX_IMAGE_BYTES) {
        fileErrors.push(`${file.name}: supera el máximo de 5 MB.`)
        continue
      }
      validFiles.push(file)
    }

    const availableSlots = Math.max(MAX_IMAGES_PER_PRODUCT - images.length, 0)
    if (validFiles.length > availableSlots) {
      fileErrors.push(`Máximo ${MAX_IMAGES_PER_PRODUCT} imágenes por producto.`)
    }

    setErrors((prev) => {
      if (fileErrors.length === 0) {
        const rest = { ...prev }
        delete rest.images
        return rest
      }
      return { ...prev, images: fileErrors.join(" ") }
    })

    const filesToAdd = validFiles.slice(0, availableSlots)
    if (filesToAdd.length === 0) return

    if (mode === "create" || !sellerId || !productId) {
      setImages((prev) => [
        ...prev,
        ...filesToAdd.map((file) => ({
          id: crypto.randomUUID(),
          url: URL.createObjectURL(file),
          status: "local" as const,
          file,
        })),
      ])
      return
    }

    // Modo edit: cada imagen nueva se sube al instante (regla de la Fase 3.7).
    let nextPosition = images.length
    for (const file of filesToAdd) {
      try {
        const path = await uploadProductImage(file, sellerId, productId, nextPosition)
        const inserted = await addProductImage(productId, path, nextPosition)
        const url = await getPublicUrl(PRODUCT_IMAGES_BUCKET, path)
        setImages((prev) => [
          ...prev,
          { id: inserted.id, url, status: "persisted" as const, imagePath: path },
        ])
        nextPosition += 1
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "No se pudo subir una imagen.")
      }
    }
  }

  const removeImage = async (id: string) => {
    const image = images.find((img) => img.id === id)
    if (!image) return

    if (image.status === "local") {
      URL.revokeObjectURL(image.url)
      setImages((prev) => prev.filter((img) => img.id !== id))
      return
    }

    const previous = images
    const next = images.filter((img) => img.id !== id)
    setImages(next)

    try {
      await deleteProductImage(image.imagePath!)
      await persistOrder(next)
    } catch (err) {
      setImages(previous)
      setSubmitError(err instanceof Error ? err.message : "No se pudo quitar la imagen.")
    }
  }

  const reorderImages = async (newOrder: GalleryImage[]) => {
    const previous = images
    setImages(newOrder)

    if (mode === "edit") {
      try {
        await persistOrder(newOrder)
      } catch (err) {
        setImages(previous)
        setSubmitError(err instanceof Error ? err.message : "No se pudo guardar el nuevo orden.")
      }
    }
  }

  const submit = async () => {
    const validationErrors = validateProduct(values, images.length)
    if (validationErrors.length > 0) {
      setErrors(Object.fromEntries(validationErrors.map((e) => [e.field, e.message])))
      return
    }

    setErrors({})
    setSubmitError(null)
    setSubmitting(true)

    const input: ProductInput = {
      title: values.title.trim(),
      description: values.description.trim() || null,
      brand: values.brand.trim() || null,
      categoryId: values.categoryId,
      condition: values.condition,
      price: Number(values.price),
      stock: Number(values.stock),
    }

    try {
      if (mode === "create") {
        if (!sellerId) throw new Error("Debes iniciar sesión")

        const product = await createProduct(sellerId, input)

        for (let i = 0; i < images.length; i++) {
          const image = images[i]
          if (image.status !== "local" || !image.file) continue
          const path = await uploadProductImage(image.file, sellerId, product.id, i)
          await addProductImage(product.id, path, i)
        }

        router.push("/vendedor/productos")
      } else if (productId) {
        await updateProduct(productId, input)
        router.push("/vendedor/productos")
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "No se pudo guardar el producto.")
    } finally {
      setSubmitting(false)
    }
  }

  return {
    values,
    images,
    errors,
    loading,
    notFound,
    submitting,
    submitError,
    setField,
    addFiles,
    removeImage,
    reorderImages,
    submit,
  }
}
