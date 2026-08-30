"use client"

import { useEffect, useState } from "react"
import { deleteProduct, listMyProducts, toggleActive } from "@/services/seller.service"
import { triggerReindex } from "@/services/indexing-trigger.service"
import type { SellerProduct } from "@/types/seller"

export function useSellerProducts(sellerId?: string) {
  const [products, setProducts] = useState<SellerProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true

    const fetchProducts = async () => {
      if (!sellerId) {
        setProducts([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const data = await listMyProducts(sellerId)
        if (active) setProducts(data)
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Error al cargar tus productos")
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchProducts()

    return () => {
      active = false
    }
  }, [sellerId, refreshKey])

  const retry = () => setRefreshKey((k) => k + 1)

  const toggle = async (productId: string, isActive: boolean) => {
    const previous = products
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, is_active: isActive } : p))
    )

    try {
      await toggleActive(productId, isActive)
      triggerReindex("producto", productId)
    } catch (err) {
      setProducts(previous)
      throw err
    }
  }

  const remove = async (productId: string) => {
    const previous = products
    setProducts((prev) => prev.filter((p) => p.id !== productId))

    try {
      await deleteProduct(productId)
      // El producto ya no existe: el endpoint de reindex lo detecta y limpia
      // su ficha huérfana (decisión 6).
      triggerReindex("producto", productId)
    } catch (err) {
      setProducts(previous)
      throw err
    }
  }

  return { products, loading, error, retry, toggle, remove }
}
