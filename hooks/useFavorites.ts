"use client"

import { useEffect, useState } from "react"
import { listMine } from "@/services/favorite.service"
import type { ProductWithDetails } from "@/services/product.service"

export function useFavorites(userId?: string) {
  const [items, setItems] = useState<ProductWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true

    const fetchFavorites = async () => {
      if (!userId) {
        setItems([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const data = await listMine(userId)
        if (active) setItems(data)
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Error al cargar tus favoritos")
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchFavorites()

    return () => {
      active = false
    }
  }, [userId, refreshKey])

  const retry = () => setRefreshKey((k) => k + 1)

  return { items, loading, error, retry }
}
