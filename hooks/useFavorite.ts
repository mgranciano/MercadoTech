"use client"

import { useCallback, useEffect, useState } from "react"
import { isFavorite, toggle } from "@/services/favorite.service"

export function useFavorite(productId: string, userId?: string) {
  const [favorite, setFavorite] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    let active = true

    const fetchFavorite = async () => {
      if (!userId) {
        setFavorite(false)
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        const value = await isFavorite(productId, userId)
        if (active) setFavorite(value)
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchFavorite()

    return () => {
      active = false
    }
  }, [productId, userId])

  const handleToggle = useCallback(async () => {
    if (!userId) return

    const previous = favorite
    setFavorite(!previous)
    setToggling(true)

    try {
      const result = await toggle(productId, userId)
      setFavorite(result)
    } catch (err) {
      setFavorite(previous)
      throw err
    } finally {
      setToggling(false)
    }
  }, [productId, userId, favorite])

  return { favorite, loading, toggling, toggle: handleToggle }
}
