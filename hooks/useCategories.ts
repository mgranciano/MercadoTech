"use client"

import { useEffect, useState } from "react"
import { listCategories, type Category } from "@/services/category.service"

let cachedCategories: Category[] | null = null

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      if (cachedCategories) {
        setCategories(cachedCategories)
        setLoading(false)
        return
      }

      try {
        const data = await listCategories()
        cachedCategories = data
        setCategories(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading categories")
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}
