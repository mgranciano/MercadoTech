"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { listActiveProducts } from "@/services/product.service"
import { PRODUCTS_PAGE_SIZE } from "@/lib/constants/catalog"
import type { ProductWithDetails } from "@/types/product"

interface Filters {
  search?: string
  condition?: string
  minPrice?: number
  maxPrice?: number
  sort?: "recientes" | "precio_asc" | "precio_desc"
}

interface UseProductsOptions {
  categoryId?: string
  initialPage?: number
}

export function useProducts(options: UseProductsOptions = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [items, setItems] = useState<ProductWithDetails[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const page = Number(searchParams.get("page")) || options.initialPage || 1
  const search = searchParams.get("q") || undefined
  const condition = searchParams.get("condition") || undefined
  const minPrice = searchParams.get("minPrice")
    ? Number(searchParams.get("minPrice"))
    : undefined
  const maxPrice = searchParams.get("maxPrice")
    ? Number(searchParams.get("maxPrice"))
    : undefined
  const sort =
    (searchParams.get("sort") as "recientes" | "precio_asc" | "precio_desc") ||
    "recientes"

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await listActiveProducts(
          {
            categoryId: options.categoryId,
            search,
            condition,
            minPrice,
            maxPrice,
            sort,
            page,
          },
          PRODUCTS_PAGE_SIZE
        )

        setItems(result.items)
        setTotal(result.total)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading products")
        setItems([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [options.categoryId, search, condition, minPrice, maxPrice, sort, page, refreshKey])

  const setFilter = (newFilters: Partial<Filters>) => {
    const params = new URLSearchParams(searchParams)

    if (newFilters.search !== undefined) {
      if (newFilters.search) {
        params.set("q", newFilters.search)
      } else {
        params.delete("q")
      }
    }

    if (newFilters.condition !== undefined) {
      if (newFilters.condition) {
        params.set("condition", newFilters.condition)
      } else {
        params.delete("condition")
      }
    }

    if (newFilters.minPrice !== undefined) {
      if (newFilters.minPrice) {
        params.set("minPrice", String(newFilters.minPrice))
      } else {
        params.delete("minPrice")
      }
    }

    if (newFilters.maxPrice !== undefined) {
      if (newFilters.maxPrice) {
        params.set("maxPrice", String(newFilters.maxPrice))
      } else {
        params.delete("maxPrice")
      }
    }

    if (newFilters.sort !== undefined) {
      if (newFilters.sort) {
        params.set("sort", newFilters.sort)
      } else {
        params.delete("sort")
      }
    }

    // Reset to page 1 when filters change
    params.set("page", "1")

    router.push(`?${params.toString()}`)
  }

  const setPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", String(newPage))
    router.push(`?${params.toString()}`)
  }

  const retry = () => setRefreshKey((k) => k + 1)

  return {
    items,
    total,
    page,
    loading,
    error,
    setFilter,
    setPage,
    retry,
  }
}
