"use client"

import { useEffect, useRef, useState } from "react"
import { getProductById, getProductImages, registerView } from "@/services/product.service"
import type { ProductImageWithUrl, ProductWithDetails } from "@/types/product"

export function useProduct(productId: string, userId?: string) {
  const [product, setProduct] = useState<ProductWithDetails | null>(null)
  const [images, setImages] = useState<ProductImageWithUrl[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const viewedRef = useRef(false)

  useEffect(() => {
    let active = true

    const fetchProduct = async () => {
      setLoading(true)
      setError(null)

      try {
        const [productData, imagesData] = await Promise.all([
          getProductById(productId),
          getProductImages(productId),
        ])

        if (!active) return

        if (!productData) {
          setError("Producto no encontrado")
          setProduct(null)
        } else {
          setProduct(productData)
        }
        setImages(imagesData)
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Error al cargar el producto")
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchProduct()

    return () => {
      active = false
    }
  }, [productId, refreshKey])

  // Fire-and-forget: solo se registra la vista si hay sesión (decisión 14).
  useEffect(() => {
    if (!userId || viewedRef.current) return
    viewedRef.current = true
    registerView(productId, userId).catch(() => {})
  }, [productId, userId])

  const retry = () => setRefreshKey((k) => k + 1)

  return { product, images, loading, error, retry }
}
